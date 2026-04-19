from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime

SQLALCHEMY_DATABASE_URL = "sqlite:///./vehitrax.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class DetectionLogModel(Base):
    __tablename__ = "detections"

    id = Column(Integer, primary_key=True, index=True)
    plate = Column(String, index=True)
    confidence = Column(Float)
    type = Column(String)
    entryTime = Column(String)
    status = Column(String)
    location = Column(String)
    image = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

class RegisteredVehicleModel(Base):
    __tablename__ = "registered_vehicles"
    
    id = Column(Integer, primary_key=True, index=True)
    plate = Column(String, unique=True, index=True)
    owner_name = Column(String)
    apartment = Column(String)
    phone = Column(String)
    status = Column(String, default="Registered")
    vehicle_type = Column(String, default="Car")
    registration_date = Column(DateTime, default=datetime.utcnow)

class ParkingSessionModel(Base):
    __tablename__ = "parking_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    plate = Column(String, index=True)
    vehicle_type = Column(String, default="Unknown")
    entry_time = Column(DateTime, default=datetime.utcnow)
    exit_time = Column(DateTime, nullable=True)
    status = Column(String, default="Active") # Active or Completed

class ParkingZoneModel(Base):
    __tablename__ = "parking_zones"
    
    id = Column(Integer, primary_key=True, index=True)
    slot_id = Column(String, unique=True, index=True) # e.g. A1, B12
    zone_type = Column(String, default="Visitor") # Visitor, Resident
    is_occupied = Column(Boolean, default=False)
    current_plate = Column(String, nullable=True)

# Create the tables
Base.metadata.create_all(bind=engine)
