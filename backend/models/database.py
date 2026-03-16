from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
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
    registration_date = Column(DateTime, default=datetime.utcnow)

# Create the tables
Base.metadata.create_all(bind=engine)
