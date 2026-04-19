import sqlite3
import random
from datetime import datetime, timedelta

def seed_db():
    conn = sqlite3.connect('vehitrax.db')
    cursor = conn.cursor()
    
    # 1. Clear existing
    cursor.execute('DELETE FROM parking_sessions')
    cursor.execute('DELETE FROM parking_zones')
    
    # 2. Generate 70 total zones (35 A, 35 B)
    zones = []
    for i in range(1, 36):
        zones.append((f"A{i}", "Visitor", 0, None))
        zones.append((f"B{i}", "Resident", 0, None))
    
    # 3. Select 25 random indices to be occupied
    occupied_indices = random.sample(range(70), 25)
    
    # Generate generic random plates
    plate_chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    def get_random_plate():
        return "MH" + "".join(random.choices("0123456789", k=2)) + "".join(random.choices(plate_chars, k=4))

    for idx in occupied_indices:
        slot_id = zones[idx][0]
        zone_type = zones[idx][1]
        plate = get_random_plate()
        
        # update zone to occupied
        zones[idx] = (slot_id, zone_type, 1, plate)
        
        # insert into parking_sessions
        # set entry time to a few seconds ago to avoid immediate overstay
        entry_time = datetime.now() - timedelta(seconds=random.randint(10, 45))
        cursor.execute(
            'INSERT INTO parking_sessions (plate, vehicle_type, entry_time, status) VALUES (?, ?, ?, ?)',
            (plate, "Car" if zone_type == "Resident" else "Unknown", entry_time, "Active")
        )
        
    for z in zones:
        cursor.execute(
            'INSERT INTO parking_zones (slot_id, zone_type, is_occupied, current_plate) VALUES (?, ?, ?, ?)',
            z
        )

    conn.commit()
    conn.close()
    print("Database seeded with 70 slots and 25 active occupancies!")

if __name__ == '__main__':
    seed_db()
