"""Tests for the bug fix: items with no expiration date (e.g. salt, spices).
Run from the project root:
    python -m unittest discover tests
"""
import os
import sqlite3
import sys
import tempfile
import unittest
from datetime import date, timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db import pantry_db
from pantry_summary import get_pantry_summary


class TestNoExpirationDate(unittest.TestCase):
    def setUp(self):
        # Point the database at a throwaway file so the real pantry.db is never touched.
        self.tmp_dir = tempfile.TemporaryDirectory()
        self.original_db_path = pantry_db.DB_PATH
        pantry_db.DB_PATH = os.path.join(self.tmp_dir.name, "test_pantry.db")
        pantry_db.init_db()

    def tearDown(self):
        pantry_db.DB_PATH = self.original_db_path
        self.tmp_dir.cleanup()

    def insert_raw(self, name, expiration_value):
        """Insert a row directly with SQL, the way bad/old data might already be stored."""
        conn = sqlite3.connect(pantry_db.DB_PATH)
        conn.execute("INSERT INTO pantry_items (name, quantity, unit, expiration_date, category) "
                     "VALUES (?, 1, '', ?, 'Spices')", (name, expiration_value))
        conn.commit(); conn.close()

    def test_items_with_null_date_load(self):
        self.insert_raw("Salt", None)
        items = pantry_db.get_all_items()
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0].name, "Salt")
        self.assertIsNone(items[0].expiration_date)

    def test_items_with_empty_string_date_load(self):
        self.insert_raw("Pepper", "")
        items = pantry_db.get_all_items()
        self.assertIsNone(items[0].expiration_date)

    def test_add_item_without_date(self):
        pantry_db.add_item("Cinnamon", 1, "jar", None, "Spices")
        self.assertIsNone(pantry_db.get_all_items()[0].expiration_date)

    def test_dated_items_still_load_normally(self):
        pantry_db.add_item("Milk", 1, "gal", date(2026, 10, 10), "Dairy")
        pantry_db.add_item("Salt", 1, "box", None, "Spices")
        items = {item.name: item for item in pantry_db.get_all_items()}
        self.assertEqual(items["Milk"].expiration_date, date(2026, 10, 10))
        self.assertIsNone(items["Salt"].expiration_date)

    def test_summary_does_not_crash_and_skips_undated_items(self):
        today = date.today()
        pantry_db.add_item("Old Milk", 1, "gal", today - timedelta(days=2), "Dairy")
        pantry_db.add_item("Spinach", 1, "bag", today + timedelta(days=1), "Produce")
        pantry_db.add_item("Rice", 1, "lb", today + timedelta(days=200), "Grains")
        pantry_db.add_item("Salt", 1, "box", None, "Spices")
        self.insert_raw("Pepper", "")

        self.assertEqual(get_pantry_summary(), {"expired": 1, "expiring soon": 1, "fresh": 1})

    def test_summary_with_only_undated_items(self):
        pantry_db.add_item("Salt", 1, "box", None, "Spices")
        self.assertEqual(get_pantry_summary(), {"expired": 0, "expiring soon": 0, "fresh": 0})


if __name__ == "__main__":
    unittest.main()
