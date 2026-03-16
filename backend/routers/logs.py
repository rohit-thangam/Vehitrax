from fastapi import APIRouter
from typing import List
from pydantic import BaseModel

router = APIRouter()

class DetectionLog(BaseModel):
    id: int
    plate: str
    confidence: float
    type: str
    entryTime: str
    status: str
    location: str
    image: str

class StatusUpdate(BaseModel):
    status: str

# Mock service import
from services.db_service import get_logs_from_db, update_log_status

@router.get("/", response_model=List[DetectionLog])
async def get_logs(limit: int = 50, offset: int = 0):
    """
    Fetches historical detection logs.
    """
    return get_logs_from_db(limit=limit, offset=offset)

@router.patch("/{log_id}/status")
async def update_status(log_id: int, update_data: StatusUpdate):
    """
    Updates the status of a specific log entry (e.g., changing 'Unknown' to 'Visitor').
    """
    from fastapi import HTTPException
    success = update_log_status(log_id, update_data.status)
    if not success:
        raise HTTPException(status_code=404, detail="Log not found or update failed")
    return {"message": "Status updated successfully", "status": update_data.status}
