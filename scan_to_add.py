"""
scan_to_add.py

Simulates the Scan-to-Add barcode function for PantryPlus (REQ002).

Requirement being satisfied:
    "Scan and recognize barcodes on items added to pantry with >=98%
    success rate (REQ002). Log timestamp, item name, and barcode on entry."

Acceptance criteria:
    Calling the function with a barcode adds an item to the database.
"""

import random
import sqlite3
from datetime import datetime, timezone

# A tiny "known barcode" lookup table standing in for a real product API
# (e.g. UPC database). In the real app this would call an external service.
BARCODE_CATALOG = {
    "0123456789012": "Peanut Butter",
    "0234567890123": "Whole Wheat Bread",
    "0345678901234": "Canned Black Beans",
    "0456789012345": "Milk (1 Gallon)",
    "0567890123456": "Frozen Pizza",
}

SUCCESS_RATE = 0.98  # REQ002 requirement


def _init_db(db_path="pantry.db"):
    """Create the pantry_items and scan_log tables if they don't exist."""
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS pantry_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_name TEXT NOT NULL,
            barcode TEXT NOT NULL,
            added_at TEXT NOT NULL
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS scan_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            barcode TEXT NOT NULL,
            item_name TEXT,
            timestamp TEXT NOT NULL,
            success INTEGER NOT NULL
        )
    """)
    conn.commit()
    return conn


def simulate_scan_success(success_rate=SUCCESS_RATE):
    """
    Simulates sensor/camera scan reliability.
    Returns True ~98% of the time, False otherwise, per REQ002.
    """
    return random.random() < success_rate


def scan_to_add(barcode, db_path="pantry.db", conn=None):
    """
    Simulates scanning a barcode and adding the recognized item to the
    pantry database.

    Args:
        barcode (str): the barcode string being scanned.
        db_path (str): path to the sqlite database file.
        conn: optional existing sqlite3 connection (mainly for tests).

    Returns:
        dict: {
            "success": bool,
            "item_name": str or None,
            "barcode": str,
            "timestamp": ISO 8601 string,
        }
    """
    own_conn = False
    if conn is None:
        conn = _init_db(db_path)
        own_conn = True

    timestamp = datetime.now(timezone.utc).isoformat()
    cur = conn.cursor()

    # Step 1: simulate scan hardware reliability (REQ002: >=98% success)
    scan_ok = simulate_scan_success()

    # Step 2: even a "successful" scan can hit an unrecognized barcode
    item_name = BARCODE_CATALOG.get(barcode) if scan_ok else None
    success = scan_ok and item_name is not None

    # Step 3: log every attempt (timestamp, item name, barcode) per REQ002
    cur.execute(
        "INSERT INTO scan_log (barcode, item_name, timestamp, success) "
        "VALUES (?, ?, ?, ?)",
        (barcode, item_name, timestamp, int(success)),
    )

    # Step 4: on success, add the item to the pantry database
    if success:
        cur.execute(
            "INSERT INTO pantry_items (item_name, barcode, added_at) "
            "VALUES (?, ?, ?)",
            (item_name, barcode, timestamp),
        )

    conn.commit()
    if own_conn:
        conn.close()

    return {
        "success": success,
        "item_name": item_name,
        "barcode": barcode,
        "timestamp": timestamp,
    }


if __name__ == "__main__":
    # Quick manual demo
    test_barcode = "0123456789012"
    result = scan_to_add(test_barcode)
    print(result)
