# Handles database setup and CRUD operations for pantry items.
import sqlite3
from datetime import date
from models.pantry_item import PantryItem

DB_PATH = "pantry.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""CREATE TABLE IF NOT EXISTS pantry_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL,
        quantity REAL NOT NULL, unit TEXT, expiration_date TEXT, category TEXT,
        barcode TEXT)""")
    conn.commit(); conn.close()

def add_item(name, quantity, unit, expiration_date, category, barcode=None):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.execute("INSERT INTO pantry_items (name, quantity, unit, expiration_date, category, barcode) VALUES (?, ?, ?, ?, ?, ?)",
        (name, quantity, unit, expiration_date.isoformat(), category, barcode))
    conn.commit(); conn.close()
    return cur.lastrowid

def get_all_items():
    conn = sqlite3.connect(DB_PATH)
    rows = conn.execute("SELECT * FROM pantry_items").fetchall()
    conn.close()
    return [PantryItem(id=r[0], name=r[1], quantity=r[2], unit=r[3],
        expiration_date=date.fromisoformat(r[4]), category=r[5], barcode=r[6]) for r in rows]

def update_item(item_id, **fields):
    conn = sqlite3.connect(DB_PATH)
    for key, value in fields.items():
        conn.execute(f"UPDATE pantry_items SET {key} = ? WHERE id = ?", (value, item_id))
    conn.commit(); conn.close()

def delete_item(item_id):
    conn = sqlite3.connect(DB_PATH)
    conn.execute("DELETE FROM pantry_items WHERE id = ?", (item_id,))
    conn.commit(); conn.close()
