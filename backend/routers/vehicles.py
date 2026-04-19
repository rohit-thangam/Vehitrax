from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from models.database import SessionLocal, RegisteredVehicleModel

router = APIRouter()

class VehicleCreate(BaseModel):
    name: str
    flat: str
    phone: str
    email: str
    vehiclePlate: str
    vehicleType: str
    status: str = "Registered"

class VehicleResponse(VehicleCreate):
    id: int

@router.get("/", response_model=List[VehicleResponse])
def get_vehicles():
    db = SessionLocal()
    try:
        vehicles = db.query(RegisteredVehicleModel).order_by(RegisteredVehicleModel.id.desc()).all()
        result = []
        for v in vehicles:
            result.append({
                "id": v.id,
                "name": v.owner_name,
                "flat": v.apartment,
                "phone": v.phone,
                "email": v.owner_name.lower().replace(" ", "") + "@example.com",
                "vehiclePlate": v.plate,
                "vehicleType": getattr(v, "vehicle_type", "Car"), 
                "status": getattr(v, "status", "Registered")
            })
        return result
    finally:
        db.close()

@router.post("/", response_model=VehicleResponse)
def create_vehicle(vehicle: VehicleCreate):
    db = SessionLocal()
    try:
        # Check if plate already exists
        clean_plate = vehicle.vehiclePlate.replace(' ', '').replace('-', '').upper()
        existing = db.query(RegisteredVehicleModel).filter(RegisteredVehicleModel.plate == clean_plate).first()
        if existing:
            raise HTTPException(status_code=400, detail="Vehicle plate already registered")
            
        new_vehicle = RegisteredVehicleModel(
            owner_name=vehicle.name,
            apartment=vehicle.flat,
            phone=vehicle.phone,
            plate=clean_plate,
            status=vehicle.status,
            vehicle_type=vehicle.vehicleType
        )
        db.add(new_vehicle)
        db.commit()
        db.refresh(new_vehicle)
        
        return {
            "id": new_vehicle.id,
            "name": vehicle.name,
            "flat": vehicle.flat,
            "phone": vehicle.phone,
            "email": vehicle.email,
            "vehiclePlate": vehicle.vehiclePlate,
            "vehicleType": vehicle.vehicleType,
            "status": new_vehicle.status
        }
    finally:
        db.close()

@router.put("/{vehicle_id}", response_model=VehicleResponse)
def update_vehicle(vehicle_id: int, vehicle: VehicleCreate):
    db = SessionLocal()
    try:
        db_vehicle = db.query(RegisteredVehicleModel).filter(RegisteredVehicleModel.id == vehicle_id).first()
        if not db_vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")
            
        clean_plate = vehicle.vehiclePlate.replace(' ', '').replace('-', '').upper()
        
        db_vehicle.owner_name = vehicle.name
        db_vehicle.apartment = vehicle.flat
        db_vehicle.phone = vehicle.phone
        db_vehicle.plate = clean_plate
        db_vehicle.status = vehicle.status
        db_vehicle.vehicle_type = vehicle.vehicleType
        
        db.commit()
        
        return {
            "id": db_vehicle.id,
            "name": vehicle.name,
            "flat": vehicle.flat,
            "phone": vehicle.phone,
            "email": vehicle.email,
            "vehiclePlate": vehicle.vehiclePlate,
            "vehicleType": vehicle.vehicleType,
            "status": db_vehicle.status
        }
    finally:
        db.close()

@router.delete("/{vehicle_id}")
def delete_vehicle(vehicle_id: int):
    db = SessionLocal()
    try:
        db_vehicle = db.query(RegisteredVehicleModel).filter(RegisteredVehicleModel.id == vehicle_id).first()
        if not db_vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")
            
        db.delete(db_vehicle)
        db.commit()
        return {"message": "Vehicle deleted successfully"}
    finally:
        db.close()
