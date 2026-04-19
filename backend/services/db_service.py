import json
import os
from datetime import datetime
from models.database import SessionLocal, DetectionLogModel, RegisteredVehicleModel, ParkingSessionModel, ParkingZoneModel

def check_vehicle_status(plate_number: str) -> dict:
    """
    Checks if a given plate number exists in the registered_vehicles table and returns its status and type.
    """
    try:
        db = SessionLocal()
        # Case insensitive exact match or partial match (for demo purposes)
        # We'll do exact match, but strip spaces just in case
        clean_plate = plate_number.replace(' ', '').replace('-', '')
        
        vehicle = db.query(RegisteredVehicleModel).filter(
            RegisteredVehicleModel.plate == clean_plate
        ).first()
        if vehicle:
            return {
                "status": getattr(vehicle, 'status', 'Registered'),
                "type": getattr(vehicle, 'vehicle_type', 'Car')
            }
        return {"status": "Unknown", "type": "Unknown"}
    except Exception as e:
        print(f"Error checking registration DB: {e}")
        return {"status": "Unknown", "type": "Unknown"}
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
        print(f"Error checking registration: {e}")
        return False
    finally:
        db.close()

def delete_log_from_db(log_id: int) -> bool:
    """
    Deletes a specific detection log entry.
    """
    try:
        db = SessionLocal()
        log = db.query(DetectionLogModel).filter(DetectionLogModel.id == log_id).first()
        if log:
            db.delete(log)
            db.commit()
            return True
        return False
    except Exception as e:
        print(f"Error deleting log: {e}")
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

def process_vehicle_parking(plate: str, location: str, vehicle_type: str = "Unknown"):
    """
    Manages the ParkingSessionModel state.
    If 'Entry', creates a new active session if one doesn't exist.
    If 'Exit', marks the active session as completed.
    """
    if plate == "UNKNOWN" or not plate:
        return
        
    try:
        db = SessionLocal()
        # Find any active session for this plate
        active_session = db.query(ParkingSessionModel).filter(
            ParkingSessionModel.plate == plate,
            ParkingSessionModel.status == "Active"
        ).first()
        
        if "Entry" in location:
            # If entering and no active session, create one
            if not active_session:
                new_session = ParkingSessionModel(
                    plate=plate,
                    vehicle_type=vehicle_type,
                    entry_time=datetime.now(),
                    status="Active"
                )
                db.add(new_session)
                
                # Auto-assign to a Zone
                target_zone_type = "Resident" if check_vehicle_status(plate).get("status") == "Registered" else "Visitor"
                available_zone = db.query(ParkingZoneModel).filter(
                    ParkingZoneModel.is_occupied == False,
                    ParkingZoneModel.zone_type == target_zone_type
                ).first()
                
                if available_zone:
                    available_zone.is_occupied = True
                    available_zone.current_plate = plate
                
                db.commit()
                
        elif "Exit" in location or "Outbound" in location:
            # If exiting and there's an active session, close it
            if active_session:
                active_session.exit_time = datetime.now()
                active_session.status = "Completed"
                
                # Clear Zone mapping
                occupied_zone = db.query(ParkingZoneModel).filter(ParkingZoneModel.current_plate == plate).first()
                if occupied_zone:
                    occupied_zone.is_occupied = False
                    occupied_zone.current_plate = None
                    
                db.commit()
                
    except Exception as e:
        print(f"Error processing parking session: {e}")
    finally:
        db.close()
