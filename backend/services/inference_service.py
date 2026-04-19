import asyncio
import cv2
import json
import base64
from ultralytics import YOLO
import easyocr
import os

from services.ocr_service import (
    extract_plate_with_api,
    FrameBuffer,
    PlateVoter,
    format_indian_plate,
)

# ---------------------------------------------------------------------------
# Model initialisation
# ---------------------------------------------------------------------------
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "models", "best.pt")
print(f"Loading YOLO model from {MODEL_PATH}")

try:
    yolo_model = YOLO(MODEL_PATH)
except Exception as e:
    print(f"Warning: Could not load YOLO model: {e}")
    yolo_model = None

# EasyOCR – used as fallback when PlateRecognizer API is unavailable
try:
    reader = easyocr.Reader(['en'], gpu=True)
except Exception as e:
    print(f"Warning: Could not load EasyOCR: {e}")
    reader = None


# ---------------------------------------------------------------------------
# Background video-processing task
# ---------------------------------------------------------------------------

async def process_video_background(video_id: str, file_path: str):
    """
    Background task: read frames → YOLO → FrameBuffer (collect 5 frames,
    pick best) → PlateRecognizer API (or EasyOCR fallback) → PlateVoter
    (majority vote) → dedup → DB save → SSE stream.
    """
    from routers.stream import active_streams, active_frame_streams, active_tasks
    from services.db_service import save_log_to_db, check_vehicle_status, process_vehicle_parking

    import time
    from difflib import SequenceMatcher

    task = asyncio.current_task()

    # Guard against duplicate tasks for the same video_id
    if video_id in active_tasks and not active_tasks[video_id].done():
        if active_tasks[video_id] != task:
            print(f"Task for {video_id} is already running. Skipping duplicate.")
            return

    active_tasks[video_id] = task

    if video_id not in active_streams:
        active_streams[video_id] = asyncio.Queue()
    if video_id not in active_frame_streams:
        active_frame_streams[video_id] = asyncio.Queue(maxsize=120)

    queue       = active_streams[video_id]
    frame_queue = active_frame_streams[video_id]

    # Cooldown deduplication
    last_seen_plates: dict[str, float] = {}
    COOLDOWN_SECONDS = 30

    # FrameBuffer: accumulate 5 detections → pick best YOLO-confidence crop
    # → send once to PlateRecognizer (saves API quota, improves quality).
    frame_buffer = FrameBuffer(size=5)

    # PlateVoter: majority-vote across the last 10 API/OCR readings.
    plate_voter = PlateVoter(window=10, min_votes=3)

    cap = cv2.VideoCapture(file_path)
    if not cap.isOpened():
        await queue.put(json.dumps({"error": "Failed to open video"}))
        return

    frame_count = 0
    fps = cap.get(cv2.CAP_PROP_FPS) or 30

    # Run YOLO less frequently to reduce CPU blocking overhead (huge speedup for CPU inferencing)
    PROCESS_EVERY_N_FRAMES = 10

    try:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            frame_count += 1

            # Yield to event loop – keeps SSE stream alive without stutter
            await asyncio.sleep(0.01)

            if task.cancelled():
                break

            # ------------------------------------------------------------------
            # YOLO inference
            # ------------------------------------------------------------------
            if yolo_model and frame_count % PROCESS_EVERY_N_FRAMES == 0:
                # IMPORTANT: Offload PyTorch inference CPU block so it doesn't freeze the MJPEG stream
                results = await asyncio.to_thread(yolo_model, frame, stream=True, verbose=False)

                for r in results:
                    for box in r.boxes:
                        x1, y1, x2, y2 = map(int, box.xyxy[0])
                        yolo_conf     = float(box.conf[0])
                        conf_pct      = int(yolo_conf * 100)

                        # Crop the plate with a small margin
                        pad  = 10
                        crop = frame[
                            max(0, y1 - pad): min(frame.shape[0], y2 + pad),
                            max(0, x1 - pad): min(frame.shape[1], x2 + pad),
                        ]

                        # ──────────────────────────────────────────────────────
                        # STEP 1 – Accumulate frames in FrameBuffer
                        # ──────────────────────────────────────────────────────
                        frame_buffer.add(crop, yolo_conf)

                        raw_plate      = None
                        formatted_plate = None
                        ocr_source     = "pending"

                        # ──────────────────────────────────────────────────────
                        # STEP 2 – When buffer is full, call OCR on best frame
                        # ──────────────────────────────────────────────────────
                        if frame_buffer.full:
                            best_crop = frame_buffer.flush()

                            # Offload blocking (API + EasyOCR) to thread pool
                            raw_plate, formatted_plate, ocr_source = \
                                await asyncio.to_thread(
                                    extract_plate_with_api,
                                    reader,
                                    best_crop,
                                    0.30,   # EasyOCR confidence threshold
                                    0.60,   # PlateRecognizer min confidence
                                )
                            print(
                                f"[OCR:{ocr_source}] frame={frame_count} "
                                f"raw={raw_plate} formatted={formatted_plate}"
                            )

                        # ──────────────────────────────────────────────────────
                        # STEP 3 – Frame averaging (majority vote)
                        # ──────────────────────────────────────────────────────
                        voted_plate = plate_voter.update(raw_plate)

                        # Resolve final plate text for this detection event
                        if voted_plate:
                            plate_text         = voted_plate
                            plate_text_display = format_indian_plate(voted_plate)
                        elif formatted_plate and raw_plate:
                            plate_text         = raw_plate
                            plate_text_display = formatted_plate
                        else:
                            plate_text         = "UNKNOWN"
                            plate_text_display = "UNKNOWN"

                        # ──────────────────────────────────────────────────────
                        # STEP 4 – DB lookup for registered / blacklisted status
                        # ──────────────────────────────────────────────────────
                        status   = "Unknown"
                        color    = (0, 165, 255)   # Amber – unknown visitor
                        veh_type = "Unknown"

                        if plate_text not in ("UNKNOWN", "") and len(plate_text) >= 4:
                            db_info   = await asyncio.to_thread(check_vehicle_status, plate_text)
                            db_status = db_info.get("status", "Unknown")
                            if db_status == "Registered":
                                status   = "Registered"
                                color    = (0, 255, 0)    # Green
                                veh_type = db_info.get("type", "Car")
                            elif db_status == "Blacklisted":
                                status   = "Blacklisted"
                                color    = (0, 0, 255)    # Red
                                veh_type = db_info.get("type", "Car")

                        # ──────────────────────────────────────────────────────
                        # STEP 5 – Draw bounding box + label on frame
                        # ──────────────────────────────────────────────────────
                        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                        cv2.putText(
                            frame,
                            f"{plate_text_display}  {status}",
                            (x1, max(0, y1 - 10)),
                            cv2.FONT_HERSHEY_SIMPLEX,
                            0.7, color, 2,
                        )

                        # ──────────────────────────────────────────────────────
                        # STEP 6 – Build detection payload
                        # ──────────────────────────────────────────────────────
                        _, buffer = cv2.imencode('.jpg', crop)
                        image_uri = (
                            "data:image/jpeg;base64,"
                            + base64.b64encode(buffer).decode('utf-8')
                        )

                        # Force all detections to be Entry for the demo to prevent premature exits which clear the active parking sessions
                        location = "Gate 1 - Entry"
                        current_time_str = time.strftime("%I:%M:%S %p")

                        detection_data = {
                            "plate":      plate_text_display,
                            "confidence": conf_pct,
                            "type":       veh_type,
                            "entryTime":  current_time_str,
                            "status":     status,
                            "location":   location,
                            "image":      image_uri,
                            "ocrSource":  ocr_source,   # "api" | "easyocr" | "pending"
                        }

                        # ──────────────────────────────────────────────────────
                        # STEP 7 – Deduplication (fuzzy, cooldown-based)
                        # ──────────────────────────────────────────────────────
                        current_time = time.time()

                        # Expire stale entries
                        last_seen_plates = {
                            p: ts
                            for p, ts in last_seen_plates.items()
                            if current_time - ts <= COOLDOWN_SECONDS
                        }

                        if plate_text not in ("UNKNOWN", "") and len(plate_text) > 2:
                            is_duplicate = False
                            for existing_plate in last_seen_plates:
                                similarity = SequenceMatcher(
                                    None, plate_text, existing_plate
                                ).ratio()
                                if similarity >= 0.80:
                                    last_seen_plates[existing_plate] = current_time
                                    is_duplicate = True
                                    break

                            if not is_duplicate:
                                last_seen_plates[plate_text] = current_time

                                inserted_id = await asyncio.to_thread(
                                    save_log_to_db, detection_data
                                )
                                if inserted_id:
                                    detection_data["id"] = inserted_id

                                await asyncio.to_thread(
                                    process_vehicle_parking,
                                    plate_text, location, veh_type,
                                )

                                await queue.put(json.dumps(detection_data))

            # ------------------------------------------------------------------
            # Push annotated full frame to MJPEG stream
            # ------------------------------------------------------------------
            ret, full_buffer = cv2.imencode('.jpg', frame)
            if ret:
                if frame_queue.full():
                    try:
                        frame_queue.get_nowait()
                    except asyncio.QueueEmpty:
                        pass
                await frame_queue.put(full_buffer.tobytes())

    finally:
        cap.release()
        await queue.put("EOF")
        await frame_queue.put(b"EOF")
        print(f"Finished processing video: {video_id}")
