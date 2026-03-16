import os
import sys

# Add backend directory to path so we can import models
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models.database import SessionLocal, RegisteredVehicleModel

def seed_database():
    db = SessionLocal()
    
    # We saw AP39WD8488 and R183JF in the video. Let's register AP39WD8488.
    seeds = [
        {"plate": "AP39WD8488", "owner_name": "Rohit Admin", "apartment": "A-101", "phone": "555-0100"},
        {"plate": "MH12AB1234", "owner_name": "Test User", "apartment": "B-202", "phone": "555-0101"}
    ]
    
    for seed in seeds:
        existing = db.query(RegisteredVehicleModel).filter(RegisteredVehicleModel.plate == seed["plate"]).first()
        if not existing:
            new_reg = RegisteredVehicleModel(**seed)
            db.add(new_reg)
            print(f"Registered {seed['plate']}")
        else:
            print(f"{seed['plate']} is already registered.")
            
    db.commit()
    db.close()
    print("Database seeded successfully.")

if __name__ == "__main__":
    seed_database()
