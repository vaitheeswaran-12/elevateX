import sqlite3
import os
import sys

def main():
    db_path = "ascendiq.db"
    schema_path = "backend/src/config/schema.sql"

    if not os.path.exists(schema_path):
        print(f"Error: Schema file not found at {schema_path}")
        sys.exit(1)

    print(f"Connecting/Creating SQLite Database: {db_path}...")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    print(f"Reading schema file: {schema_path}...")
    with open(schema_path, 'r') as f:
        schema_sql = f.read()

    print("Executing schema...")
    try:
        cursor.executescript(schema_sql)
        conn.commit()
        print("Database Schema initialized successfully inside SQLite!")
    except Exception as e:
        print(f"Error executing database schema: {e}")
        conn.close()
        sys.exit(1)

    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print("\nCreated Tables:")
    for t in tables:
        print(f" - {t[0]}")

    conn.close()

if __name__ == "__main__":
    main()
