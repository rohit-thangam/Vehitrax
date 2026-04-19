from fastapi import APIRouter, UploadFile, File, BackgroundTasks
from pydantic import BaseModel
import shutil
import os
import uuid

router = APIRouter()

UPLOAD_DIR = "data/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class UploadResponse(BaseModel):
    message: str
    video_id: str
    filename: str

# Mock service import, we will implement this later
from services.inference_service import process_video_background

@router.post("/upload", response_model=UploadResponse)
async def upload_video(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    """
    Uploads a video, saves it locally, and kicks off the background YOLOv8 + EasyOCR processing.
    """
    video_id = str(uuid.uuid4())
    ext = file.filename.split(".")[-1]
    safe_filename = f"{video_id}.{ext}"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Start background processing
    background_tasks.add_task(process_video_background, video_id, file_path)

    return {"message": "Video uploaded successfully. Processing started.", "video_id": video_id, "filename": file.filename}

@router.get("/live_feed")
async def start_live_feed(background_tasks: BackgroundTasks):
    """
    Starts simulated live feed using the demo.mp4 video in the data folder.
    """
    video_id = "live_demo_01"
    # The backend is in 'S8/backend', so the data folder is 'S8/data'
    file_path = os.path.join("..", "data", "toll_entry.mp4")
    
    if not os.path.exists(file_path):
        return {"error": "toll_entry.mp4 not found in data folder"}
        
    # Start background processing
    background_tasks.add_task(process_video_background, video_id, file_path)
    
    return {
        "message": "Live feed started", 
        "video_id": video_id, 
        "url": "http://localhost:8000/data/toll_entry.mp4"
    }
