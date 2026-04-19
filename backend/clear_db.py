import sqlite3

def clear_db():
    conn = sqlite3.connect('vehitrax.db')
    cursor = conn.cursor()
    cursor.execute('DELETE FROM parking_sessions')
    cursor.execute('DELETE FROM parking_zones')
    conn.commit()
    conn.close()
    print("Cleaned!")

if __name__ == '__main__':
    clear_db()
