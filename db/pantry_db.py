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
        barcode TEXT, status TEXT DEFAULT 'active', min_quantity REAL)""")
    # Databases created before low-stock alerts existed won't have this column,
    # and CREATE TABLE IF NOT EXISTS doesn't add columns to an existing table.
    columns = [row[1] for row in conn.execute("PRAGMA table_info(pantry_items)")]
    if "min_quantity" not in columns:
        conn.execute("ALTER TABLE pantry_items ADD COLUMN min_quantity REAL")
    conn.commit(); conn.close()

def add_item(name, quantity, unit, expiration_date, category, barcode=None, status="active", min_quantity=None):
    if not name or not name.strip():
        raise ValueError("Item name cannot be empty")
    if quantity < 0:
        raise ValueError("Quantity cannot be negative")
    if min_quantity is not None and min_quantity < 0:
        raise ValueError("Minimum quantity cannot be negative")

    conn = sqlite3.connect(DB_PATH)
    cur = conn.execute("INSERT INTO pantry_items (name, quantity, unit, expiration_date, category, barcode, status, min_quantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (name, quantity, unit, expiration_date.isoformat() if expiration_date else None, category, barcode, status, min_quantity))
    conn.commit(); conn.close()
    return cur.lastrowid

def get_all_items():
    conn = sqlite3.connect(DB_PATH)
    rows = conn.execute("""SELECT id, name, quantity, unit, expiration_date, category, barcode, status, min_quantity
        FROM pantry_items""").fetchall()
    conn.close()
    return [PantryItem(id=r[0], name=r[1], quantity=r[2], unit=r[3],
        expiration_date=date.fromisoformat(r[4]) if r[4] else None, category=r[5], barcode=r[6], status=r[7],
        min_quantity=r[8]) for r in rows]

def get_item(item_id):
    """Return the PantryItem with this id, or None if it doesn't exist."""
    return next((item for item in get_all_items() if item.id == item_id), None)

def set_min_quantity(item_id, min_quantity):
    """Set the quantity at which an item counts as low stock.

    Pass None to turn off low-stock alerts for the item.
    Returns True if the item exists, False otherwise.
    """
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
    """Count pantry items with the given status, grouped by category.

    Items with a missing or blank category are grouped as "Uncategorized"
    so the category counts always add up to the total.
    """
    conn = sqlite3.connect(DB_PATH)
    rows = conn.execute("""SELECT COALESCE(NULLIF(TRIM(category), ''), 'Uncategorized') AS category_name,
        COUNT(*) FROM pantry_items WHERE status = ?
        GROUP BY category_name ORDER BY category_name""", (status,)).fetchall()
    conn.close()
    return {category_name: count for category_name, count in rows}
