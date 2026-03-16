import json
import os
from datetime import datetime
from models.database import SessionLocal, DetectionLogModel, RegisteredVehicleModel

def check_if_registered(plate_number: str) -> bool:
    """
    Checks if a given plate number exists in the registered_vehicles table.
    """
    try:
        db = SessionLocal()
        # Case insensitive exact match or partial match (for demo purposes)
        # We'll do exact match, but strip spaces just in case
        clean_plate = plate_number.replace(' ', '').replace('-', '')
        
        vehicle = db.query(RegisteredVehicleModel).filter(
            RegisteredVehicleModel.plate == clean_plate
        ).first()
        return vehicle is not None
    except Exception as e:
        print(f"Error checking registration DB: {e}")
        return False
    finally:
        db.close()

def save_log_to_db(log_data: dict):
    """
    Saves a single detection log to SQLite via SQLAlchemy.
    """
    try:
        db = SessionLocal()
        new_log = DetectionLogModel(
            plate=log_data.get('plate', 'UNKNOWN'),
            confidence=log_data.get('confidence', 0),
            type=log_data.get('type', 'Unknown'),
            entryTime=log_data.get('entryTime', ''),
            status=log_data.get('status', 'Unknown'),
            location=log_data.get('location', 'Unknown'),
            image=log_data.get('image', ''),
            timestamp=datetime.now()
        )
        db.add(new_log)
        db.commit()
        db.refresh(new_log)
        return new_log.id
    except Exception as e:
        print(f"Error saving to DB: {e}")
        return None
    finally:
        db.close()

def update_log_status(log_id: int, new_status: str) -> bool:
    """
    Updates the status of an existing detection log.
    """
    try:
        db = SessionLocal()
        log = db.query(DetectionLogModel).filter(DetectionLogModel.id == log_id).first()
        if log:
            log.status = new_status
            db.commit()
            return True
        return False
    except Exception as e:
        print(f"Error updating log status: {e}")
        return False
    finally:
        db.close()

def get_logs_from_db(limit=50, offset=0):
    """
    Retrieves detection logs from SQLite.
    """
    try:
        db = SessionLocal()
        logs = db.query(DetectionLogModel).order_by(DetectionLogModel.timestamp.desc()).offset(offset).limit(limit).all()
        result = []
        for log in logs:
            result.append({
                "id": log.id,
                "plate": log.plate,
                "confidence": log.confidence,
                "type": log.type,
                "entryTime": log.entryTime,
                "status": log.status,
                "location": log.location,
                "image": log.image
            })
        return result
    except Exception as e:
        print(f"Error getting logs from DB: {e}")
        return []
    finally:
        db.close()
