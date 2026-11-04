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
        barcode TEXT, status TEXT DEFAULT 'active', min_quantity REAL, user_id INTEGER)""")
    # Databases created before a given feature existed won't have its column,
    # and CREATE TABLE IF NOT EXISTS doesn't add columns to an existing table.
    columns = [row[1] for row in conn.execute("PRAGMA table_info(pantry_items)")]
    if "min_quantity" not in columns:
        conn.execute("ALTER TABLE pantry_items ADD COLUMN min_quantity REAL")
    if "user_id" not in columns:
        conn.execute("ALTER TABLE pantry_items ADD COLUMN user_id INTEGER")
    conn.commit(); conn.close()

def add_item(name, quantity, unit, expiration_date, category, barcode=None, status="active", min_quantity=None, user_id=None):
    if not name or not name.strip():
        raise ValueError("Item name cannot be empty")
    if quantity < 0:
        raise ValueError("Quantity cannot be negative")
    if min_quantity is not None and min_quantity < 0:
        raise ValueError("Minimum quantity cannot be negative")

    conn = sqlite3.connect(DB_PATH)
    cur = conn.execute("INSERT INTO pantry_items (name, quantity, unit, expiration_date, category, barcode, status, min_quantity, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (name, quantity, unit, expiration_date.isoformat() if expiration_date else None, category, barcode, status, min_quantity, user_id))
    conn.commit(); conn.close()
    return cur.lastrowid

def get_all_items():
    conn = sqlite3.connect(DB_PATH)
    rows = conn.execute("""SELECT id, name, quantity, unit, expiration_date, category, barcode, status, min_quantity, user_id
        FROM pantry_items""").fetchall()
    conn.close()
    return [PantryItem(id=r[0], name=r[1], quantity=r[2], unit=r[3],
        expiration_date=date.fromisoformat(r[4]) if r[4] else None, category=r[5], barcode=r[6], status=r[7],
        min_quantity=r[8], user_id=r[9]) for r in rows]

def get_items_for_user(user_id):
    """Return only the pantry items belonging to this user."""
    return [item for item in get_all_items() if item.user_id == user_id]

def get_item(item_id):
    """Return the PantryItem with this id, or None if it doesn't exist."""
    return next((item for item in get_all_items() if item.id == item_id), None)

def set_min_quantity(item_id, min_quantity):
    if min_quantity is not None and min_quantity < 0:
        raise ValueError("Minimum quantity cannot be negative")
    conn = sqlite3.connect(DB_PATH)
    cur = conn.execute("UPDATE pantry_items SET min_quantity = ? WHERE id = ?", (min_quantity, item_id))
    conn.commit(); conn.close()
    return cur.rowcount > 0

def update_item(item_id, **fields):
    conn = sqlite3.connect(DB_PATH)
    for key, value in fields.items():
        conn.execute(f"UPDATE pantry_items SET {key} = ? WHERE id = ?", (value, item_id))
    conn.commit(); conn.close()

def delete_item(item_id):
    conn = sqlite3.connect(DB_PATH)
    conn.execute("DELETE FROM pantry_items WHERE id = ?", (item_id,))
    conn.commit(); conn.close()

def mark_item_used(item_id):
    """Mark an item as used up by the user."""
    update_item(item_id, status="used")

def mark_item_discarded(item_id):
    """Mark an item as thrown out, typically due to expiration."""
    update_item(item_id, status="thrown_out")

def count_items_by_category(status="active"):
    """Count pantry items with the given status, grouped by category."""
    conn = sqlite3.connect(DB_PATH)
    rows = conn.execute("""SELECT COALESCE(NULLIF(TRIM(category), ''), 'Uncategorized') AS category_name,
        COUNT(*) FROM pantry_items WHERE status = ?
        GROUP BY category_name ORDER BY category_name""", (status,)).fetchall()
    conn.close()
    return {category_name: count for category_name, count in rows}