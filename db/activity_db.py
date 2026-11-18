"""Handles database setup and logging for the Activity feed."""
import sqlite3
from datetime import datetime, timezone

DB_PATH = "pantry.db"  # reuse the same database file as everything else

def init_activity_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""CREATE TABLE IF NOT EXISTS activity_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        action_type TEXT NOT NULL,
        item_name TEXT,
        timestamp TEXT NOT NULL)""")
    conn.commit()
    conn.close()

def log_activity(user_id, action_type, item_name=None):
    """Record one activity entry. action_type examples: 'added', 'used', 'thrown_out', 'scan_success', 'scan_failed'."""
    conn = sqlite3.connect(DB_PATH)
    timestamp = datetime.now(timezone.utc).isoformat()
    conn.execute(
        "INSERT INTO activity_log (user_id, action_type, item_name, timestamp) VALUES (?, ?, ?, ?)",
        (user_id, action_type, item_name, timestamp)
    )
    conn.commit()
    conn.close()

def get_activity_for_user(user_id, limit=50):
    """Return this user's activity, most recent first."""
    conn = sqlite3.connect(DB_PATH)
    rows = conn.execute(
        "SELECT action_type, item_name, timestamp FROM activity_log WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?",
        (user_id, limit)
    ).fetchall()
    conn.close()
    return [{"action_type": r[0], "item_name": r[1], "timestamp": r[2]} for r in rows]