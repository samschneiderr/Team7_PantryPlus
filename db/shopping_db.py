"""Handles database setup and CRUD operations for the Shopping List."""
import sqlite3

DB_PATH = "pantry.db"

def init_shopping_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""CREATE TABLE IF NOT EXISTS shopping_list_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_name TEXT NOT NULL,
        is_waste_suggestion INTEGER DEFAULT 0,
        user_id INTEGER)""")
    columns = [row[1] for row in conn.execute("PRAGMA table_info(shopping_list_items)")]
    if "user_id" not in columns:
        conn.execute("ALTER TABLE shopping_list_items ADD COLUMN user_id INTEGER")
    conn.commit()
    conn.close()

def get_shopping_list(user_id):
    """Return all items currently on this user's shopping list."""
    conn = sqlite3.connect(DB_PATH)
    rows = conn.execute(
        "SELECT item_name, is_waste_suggestion FROM shopping_list_items WHERE user_id = ? ORDER BY id",
        (user_id,)
    ).fetchall()
    conn.close()
    return [{"item_name": r[0], "is_waste_suggestion": bool(r[1])} for r in rows]

def add_to_shopping_list(user_id, item_name, is_waste_suggestion=False):
    """Add an item to this user's shopping list, unless it's already there (case-insensitive)."""
    conn = sqlite3.connect(DB_PATH)
    existing = conn.execute(
        "SELECT id FROM shopping_list_items WHERE user_id = ? AND LOWER(TRIM(item_name)) = LOWER(TRIM(?))",
        (user_id, item_name)
    ).fetchone()
    if existing:
        conn.close()
        return False
    conn.execute(
        "INSERT INTO shopping_list_items (item_name, is_waste_suggestion, user_id) VALUES (?, ?, ?)",
        (item_name, 1 if is_waste_suggestion else 0, user_id)
    )
    conn.commit()
    conn.close()
    return True

def remove_from_shopping_list(user_id, item_name):
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        "DELETE FROM shopping_list_items WHERE user_id = ? AND LOWER(TRIM(item_name)) = LOWER(TRIM(?))",
        (user_id, item_name)
    )
    conn.commit()
    conn.close()

def _extract_item_name(logged_name):
    """Activity log entries for partial actions look like '2 count of Eggs';
    pull out just the item name so waste counts group correctly."""
    if " of " in logged_name:
        return logged_name.split(" of ", 1)[1]
    return logged_name

def get_frequently_wasted_items(user_id, threshold=3):
    """Return item names this user has thrown out at least `threshold` times."""
    conn = sqlite3.connect(DB_PATH)
    rows = conn.execute(
        "SELECT item_name FROM activity_log WHERE user_id = ? AND action_type = 'thrown_out' AND item_name IS NOT NULL",
        (user_id,)
    ).fetchall()
    conn.close()

    counts = {}
    display_name = {}
    for (logged_name,) in rows:
        name = _extract_item_name(logged_name)
        key = name.strip().lower()
        counts[key] = counts.get(key, 0) + 1
        display_name[key] = name.strip()

    return [display_name[key] for key, count in counts.items() if count >= threshold]