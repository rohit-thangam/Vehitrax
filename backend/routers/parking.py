from fastapi import APIRouter
from sqlalchemy.orm import Session
from models.database import SessionLocal, ParkingSessionModel, ParkingZoneModel
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import math

router = APIRouter()

class ActiveParkingResponse(BaseModel):
    id: int
    plate: str
    vehicle_type: str
    entry_time: datetime
    status: str
    duration_minutes: int
    is_overstay: bool

class ParkingZoneResponse(BaseModel):
    id: int
    slot_id: str
    zone_type: str
    is_occupied: bool
    current_plate: Optional[str]

@router.get("/occupancy")
def get_occupancy():
    """Returns the total number of currently active parking sessions."""
    db = SessionLocal()
    try:
        active_count = db.query(ParkingSessionModel).filter(ParkingSessionModel.status == "Active").count()
        capacity = db.query(ParkingZoneModel).count()
        if capacity == 0:
            capacity = 500
        return {"active": active_count, "capacity": capacity} 
    finally:
        db.close()

@router.get("/active", response_model=List[ActiveParkingResponse])
def get_active_sessions():
    """Returns a list of all currently parked vehicles with computed duration."""
    db = SessionLocal()
    try:
        sessions = db.query(ParkingSessionModel).filter(ParkingSessionModel.status == "Active").order_by(ParkingSessionModel.entry_time.desc()).all()
        
        result = []
        now = datetime.now()
        for s in sessions:
            delta = now - s.entry_time
            duration_minutes = math.floor(delta.total_seconds() / 60)
            result.append({
                "id": s.id,
                "plate": s.plate,
                "vehicle_type": s.vehicle_type,
                "entry_time": s.entry_time,
                "status": s.status,
                "duration_minutes": duration_minutes,
                "is_overstay": duration_minutes >= 420 # 7 HOUR LIMIT
            })
            
        return result
    finally:
        db.close()


@router.get("/zones", response_model=List[ParkingZoneResponse])
def get_parking_zones():
    """Returns all parking zones, seeding them if they don't exist yet."""
    db = SessionLocal()
    try:
        zones = db.query(ParkingZoneModel).all()
        
        # Auto-seed the grid mapping if empty
        if not zones:
            new_zones = []
            # 35 Visitor slots (A) and 35 Resident slots (B) = 70 total slots
            for i in range(1, 36):
                new_zones.append(ParkingZoneModel(slot_id=f"A{i}", zone_type="Visitor"))
                new_zones.append(ParkingZoneModel(slot_id=f"B{i}", zone_type="Resident"))
            db.add_all(new_zones)
            db.commit()
            zones = db.query(ParkingZoneModel).all()
            
        return zones
    finally:
        db.close()
