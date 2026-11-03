import sqlite3

conn = sqlite3.connect("pantry.db")
conn.execute("DELETE FROM users")
conn.commit()
conn.close()
print("All users deleted.")
