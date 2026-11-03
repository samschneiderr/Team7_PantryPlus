"""Handles database setup and operations for user accounts."""
import sqlite3
import hashlib

DB_PATH = "pantry.db"  # reuse the same database file as pantry items


def _hash_password(password):
    """Hash a password using SHA-256."""
    return hashlib.sha256(password.encode()).hexdigest()


def init_users_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        household INTEGER DEFAULT 1,
        diet TEXT DEFAULT 'None')""")
    conn.commit()
    conn.close()

def create_user(name, email, password, household=1, diet="None"):
    """Create a new user. Returns the new user's id, or None if the email is already taken."""
    conn = sqlite3.connect(DB_PATH)
    try:
        cur = conn.execute(
            "INSERT INTO users (name, email, password, household, diet) VALUES (?, ?, ?, ?, ?)",
            (name, email, _hash_password(password), household, diet)
        )
        conn.commit()
        return cur.lastrowid
    except sqlite3.IntegrityError:
        return None  # email already exists
    finally:
        conn.close()

def get_user_by_email(email):
    """Look up a user by email. Returns a dict (without the password) or None."""
    conn = sqlite3.connect(DB_PATH)
    row = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    conn.close()
    if row is None:
        return None
    return {"id": row[0], "name": row[1], "email": row[2], "household": row[4], "diet": row[5]}

def verify_password(email, password):
    """Check whether the given password matches the stored hash for this email."""
    conn = sqlite3.connect(DB_PATH)
    row = conn.execute("SELECT password FROM users WHERE email = ?", (email,)).fetchone()
    conn.close()
    if row is None:
        return False
    return row[0] == _hash_password(password)

def update_user(user_id, household=None, diet=None):
    """Update a user's household size and/or dietary preference."""
    conn = sqlite3.connect(DB_PATH)
    if household is not None:
        conn.execute("UPDATE users SET household = ? WHERE id = ?", (household, user_id))
    if diet is not None:
        conn.execute("UPDATE users SET diet = ? WHERE id = ?", (diet, user_id))
    conn.commit()
    conn.close()