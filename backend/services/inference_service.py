import asyncio
import cv2
import json
import base64
from ultralytics import YOLO
import easyocr
import os

# We will load the model from the models folder
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "models", "best.pt")
print(f"Loading YOLO model from {MODEL_PATH}")

try:
    yolo_model = YOLO(MODEL_PATH)
except Exception as e:
    print(f"Warning: Could not load YOLO model: {e}")
    yolo_model = None

# Initialize EasyOCR
try:
    reader = easyocr.Reader(['en'], gpu=True) # Set gpu=False if no GPU
except Exception as e:
    print(f"Warning: Could not load EasyOCR: {e}")
    reader = None

async def process_video_background(video_id: str, file_path: str):
    """
    Background task to process a video file using YOLOv8 and EasyOCR.
    It reads frames, runs inference, and pushes results to an asyncio queue.
    """
    # Import here to avoid circular dependencies
    from routers.stream import active_streams, active_frame_streams, active_tasks
    from services.db_service import save_log_to_db, check_if_registered
    
    task = asyncio.current_task()
    if video_id in active_tasks and not active_tasks[video_id].done():
        if active_tasks[video_id] != task:
            print(f"Task for {video_id} is already running. Skipping duplicate request.")
            return
            
    active_tasks[video_id] = task
    
    if video_id not in active_streams:
        active_streams[video_id] = asyncio.Queue()
        
    if video_id not in active_frame_streams:
        active_frame_streams[video_id] = asyncio.Queue(maxsize=120)
        
    queue = active_streams[video_id]
    frame_queue = active_frame_streams[video_id]
    
    # Dictionary to keep track of recently seen plates to avoid duplicates
    # Key: plate text, Value: timestamp (time.time())
    import time
    last_seen_plates = {}
    COOLDOWN_SECONDS = 5
    
    cap = cv2.VideoCapture(file_path)
    if not cap.isOpened():
        await queue.put(json.dumps({"error": "Failed to open video"}))
        return

    frame_count = 0
    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps == 0: fps = 30
    
    # Process every Nth frame to reduce load while keeping video smooth
    PROCESS_EVERY_N_FRAMES = 3 
    
    try:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
                
            frame_count += 1
            
            # Small yield to event loop to keep streaming responsive without artificial stutter
            await asyncio.sleep(0.01)
            
            # Check for disconnect/cancellation
            if task.cancelled():
                break

            # Run YOLO inference only on selected frames to save GPU/CPU
            if yolo_model and frame_count % PROCESS_EVERY_N_FRAMES == 0:
                results = yolo_model(frame, stream=True, verbose=False)
                
                # Assume one object per frame for this demo
                for r in results:
                    boxes = r.boxes
                    for box in boxes:
                        x1, y1, x2, y2 = map(int, box.xyxy[0])
                        conf = int(box.conf[0] * 100)
                        
                        # Crop license plate region for OCR
                        # Add padding if possible
                        pad = 10
                        crop = frame[max(0, y1-pad):min(frame.shape[0], y2+pad), 
                                     max(0, x1-pad):min(frame.shape[1], x2+pad)]
                        
                        plate_text = "UNKNOWN"
                        if crop.size > 0 and reader:
                            # --- PREPROCESSING FOR OCR ---
                            # Convert to grayscale
                            gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
                            # Resize to make text larger and clearer for EasyOCR
                            gray = cv2.resize(gray, None, fx=3, fy=3, interpolation=cv2.INTER_CUBIC)
                            # Apply Gaussian blur to remove noise
                            blur = cv2.GaussianBlur(gray, (5,5), 0)
                            # Apply Otsu's thresholding to binarize the image 
                            _, thresh = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
                            
                            # Specify allowlist to prevent weird character recognition
                            allowlist = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
                            
                            # Try OCR on the thresholded image first
                            # Offload to separate thread so we don't block the video stream loop
                            ocr_results = await asyncio.to_thread(reader.readtext, thresh, allowlist=allowlist)
                            
                            # Fallback to just grayscaled/resized image if thresholding destroyed the text
                            if not ocr_results:
                                ocr_results = await asyncio.to_thread(reader.readtext, gray, allowlist=allowlist)

                            if ocr_results:
                                # Top match
                                _, text, _ = ocr_results[0]
                                # Clean up the text
                                import re
                                cleaned_text = re.sub(r'[^A-Z0-9]', '', text.upper())
                                
                                # Indian plates are generally 9-10 chars. Add a small length check
                                if len(cleaned_text) > 3:
                                    # Very basic formatting for standard Indian plates just for UI purposes
                                    if len(cleaned_text) == 10:
                                        plate_text = f"{cleaned_text[:2]}-{cleaned_text[2:4]}-{cleaned_text[4:6]}-{cleaned_text[6:]}"
                                    else:
                                        plate_text = cleaned_text
                                
                        status = "Unknown"
                        color = (0, 0, 255) # Default Red for Unknown
                        
                        if plate_text != "UNKNOWN" and len(plate_text) >= 4:
                            is_registered = await asyncio.to_thread(check_if_registered, plate_text)
                            if is_registered:
                                status = "Registered"
                                color = (0, 255, 0) # Green
                                
                        # Draw bounding box on the MAIN frame
                        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                        cv2.putText(frame, f"{plate_text} {status}", (x1, max(0, y1 - 10)), 
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
                        
                        # Encode crop to base64 for frontend display
                        _, buffer = cv2.imencode('.jpg', crop)
                        img_base64 = base64.b64encode(buffer).decode('utf-8')
                        image_uri = f"data:image/jpeg;base64,{img_base64}"
                        
                        # Mock data for fields not yet inferred
                        veh_type = "Car"
                        location = "Gate 1 - Entry"
                                
                        location = "Gate 1 - Entry"
                        
                        current_time_str = time.strftime("%I:%M:%S %p")
                        
                        detection_data = {
                            "plate": plate_text,
                            "confidence": conf,
                            "type": veh_type,
                            "entryTime": current_time_str,
                            "status": status,
                            "location": location,
                            "image": image_uri
                        }
                        
                        # Check for duplicates before saving to DB and sending to stream
                        current_time = time.time()
                        # Only consider non-empty and non-UNKNOWN plates for duplicate checking
                        if plate_text != "UNKNOWN" and len(plate_text) > 2:
                            last_seen = last_seen_plates.get(plate_text, 0)
                            if current_time - last_seen > COOLDOWN_SECONDS:
                                # First time seeing this plate recently
                                last_seen_plates[plate_text] = current_time
                                # Save to DB and get the auto-incremented ID
                                inserted_id = await asyncio.to_thread(save_log_to_db, detection_data)
                                if inserted_id:
                                    detection_data["id"] = inserted_id
                                # Send to stream
                                await queue.put(json.dumps(detection_data))
                        else:
                            # If it's UNKNOWN, we don't save to DB or stream it to avoid noise
                            pass
                            
                        
            # Encode the FULL frame and push to the MJPEG frame queue
            ret, full_buffer = cv2.imencode('.jpg', frame)
            if ret:
                # If queue is full, drop the oldest frame to prevent memory issues
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
