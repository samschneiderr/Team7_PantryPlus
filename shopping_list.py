"""
shopping_list.py

Implements TM07-40: Weekly Shopping List Notes.

Description:
    Let users track foods they buy regularly, separate from waste tracking.

Acceptance Criteria:
    User can add a food to their recurring shopping list and see it persist.

Follows the same pattern as waste_tracker.py / expiration.py in this repo:
a small sqlite-backed module with simple add/list functions.
"""

import sqlite3
from datetime import datetime, timezone


def _init_db(db_path="pantry.db", conn=None):
    """
    Create the shopping_list table if it doesn't exist.
    Kept separate from pantry_items/waste tables per the task description
    ("separate from waste tracking").
    """
    own_conn = False
    if conn is None:
        conn = sqlite3.connect(db_path)
        own_conn = True

    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS shopping_list (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_name TEXT NOT NULL,
            added_at TEXT NOT NULL,
            UNIQUE(item_name)
        )
    """)
    conn.commit()

    if own_conn:
        conn.close()
    return conn if not own_conn else None


def add_to_shopping_list(item_name, db_path="pantry.db", conn=None):
    """
    Adds a food item to the recurring weekly shopping list.

    Args:
        item_name (str): name of the food item to add.
        db_path (str): path to the sqlite database file.
        conn: optional existing sqlite3 connection (mainly for tests).

    Returns:
        dict: {
            "item_name": str,
            "added_at": ISO 8601 timestamp string,
            "already_existed": bool,
        }
    """
    if not item_name or not item_name.strip():
        raise ValueError("item_name must be a non-empty string")

    item_name = item_name.strip()

    own_conn = False
    if conn is None:
        conn = sqlite3.connect(db_path)
        _init_db(conn=conn)
        own_conn = True
    else:
        _init_db(conn=conn)

    cur = conn.cursor()

    # Check whether it's already on the list (recurring items shouldn't duplicate)
    existing = cur.execute(
        "SELECT item_name, added_at FROM shopping_list WHERE item_name = ?",
        (item_name,),
    ).fetchone()

    if existing:
        result = {
            "item_name": existing[0],
            "added_at": existing[1],
            "already_existed": True,
        }
    else:
        timestamp = datetime.now(timezone.utc).isoformat()
        cur.execute(
            "INSERT INTO shopping_list (item_name, added_at) VALUES (?, ?)",
            (item_name, timestamp),
        )
        conn.commit()
        result = {
            "item_name": item_name,
            "added_at": timestamp,
            "already_existed": False,
        }

    if own_conn:
        conn.close()

    return result


def get_shopping_list(db_path="pantry.db", conn=None):
    """
    Returns the current recurring weekly shopping list, so callers can
    verify items persist across calls/sessions.

    Returns:
        list[dict]: each item as {"item_name": str, "added_at": str}
    """
    own_conn = False
    if conn is None:
        conn = sqlite3.connect(db_path)
        _init_db(conn=conn)
        own_conn = True
    else:
        _init_db(conn=conn)

    cur = conn.cursor()
    rows = cur.execute(
        "SELECT item_name, added_at FROM shopping_list ORDER BY added_at"
    ).fetchall()

    if own_conn:
        conn.close()

    return [{"item_name": r[0], "added_at": r[1]} for r in rows]


def remove_from_shopping_list(item_name, db_path="pantry.db", conn=None):
    """
    Removes a food item from the recurring shopping list.

    Returns:
        bool: True if an item was removed, False if it wasn't on the list.
    """
    own_conn = False
    if conn is None:
        conn = sqlite3.connect(db_path)
        _init_db(conn=conn)
        own_conn = True
    else:
        _init_db(conn=conn)

    cur = conn.cursor()
    cur.execute("DELETE FROM shopping_list WHERE item_name = ?", (item_name,))
    removed = cur.rowcount > 0
    conn.commit()

    if own_conn:
        conn.close()

    return removed


if __name__ == "__main__":
    add_to_shopping_list("Eggs")
    add_to_shopping_list("Oat Milk")
    print(get_shopping_list())
