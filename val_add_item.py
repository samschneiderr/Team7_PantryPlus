#Open db/pantry_db.py and update the add_item function to include validation:

def add_item(name, quantity, unit, expiration_date, category, barcode=None, status="active"):
    if not name or not name.strip():
        raise ValueError("Item name cannot be empty")
    if quantity < 0:
        raise ValueError("Quantity cannot be negative")

    conn = sqlite3.connect(DB_PATH)
    cur = conn.execute("INSERT INTO pantry_items (name, quantity, unit, expiration_date, category, barcode, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (name, quantity, unit, expiration_date.isoformat(), category, barcode, status))
    conn.commit(); conn.close()
    return cur.lastrowid
