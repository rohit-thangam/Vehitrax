from fastapi import APIRouter
from sse_starlette.sse import EventSourceResponse
from fastapi.responses import StreamingResponse
import asyncio

router = APIRouter()

# In-memory queue to pass detections from the inference background task to the SSE stream.
# Key: video_id, Value: asyncio.Queue
active_streams = {}

# In-memory queue for full JPEG frames to be streamed to the frontend via MJPEG.
# Key: video_id, Value: asyncio.Queue
active_frame_streams = {}

# Keep track of running background tasks to prevent duplicate inference processes
active_tasks = {}

@router.get("/detections")
async def stream_detections(video_id: str = "demo"):
    """
    Streams detections as Server-Sent Events (SSE).
    """
    if video_id not in active_streams:
        active_streams[video_id] = asyncio.Queue()

    queue = active_streams[video_id]

    async def event_generator():
        try:
            while True:
                # Wait for next detection from the inference engine
                data = await queue.get()
                
                # If EOF string is sent, we stop
                if data == "EOF":
                    yield {"event": "end", "data": "Processing Finished"}
                    break
                    
                yield {
                    "event": "detection",
                    "data": data
                }
        except asyncio.CancelledError:
            print(f"Client disconnected for video_id {video_id}")
        except Exception:
            # Client disconnected abruptly and socket is closed
            pass
            
    return EventSourceResponse(event_generator())

@router.get("/video_feed")
async def video_feed(video_id: str = "live_demo_01"):
    """
    Streams the video frames with bounding boxes drawn as an MJPEG stream.
    """
    if video_id not in active_frame_streams:
         active_frame_streams[video_id] = asyncio.Queue(maxsize=120)
         
    queue = active_frame_streams[video_id]

    async def frame_generator():
        try:
            while True:
                frame_bytes = await queue.get()
                if frame_bytes == b"EOF":
                    break
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        except asyncio.CancelledError:
            print(f"Video stream client disconnected for {video_id}")
        except Exception:
            # Client disconnected abruptly and socket is closed
            pass
            
    return StreamingResponse(frame_generator(), media_type="multipart/x-mixed-replace; boundary=frame")
