"""Tests for item_count_summary.get_item_count_summary."""
import os
import sqlite3
import tempfile
import unittest
from datetime import date

import db.pantry_db as pantry_db
from item_count_summary import get_item_count_summary


class TestItemCountSummary(unittest.TestCase):
    """Check the summary matches what is actually stored in the database."""

    def setUp(self):
        # Use a throwaway database so tests never touch the real pantry.db
        self.original_db_path = pantry_db.DB_PATH
        handle, self.test_db_path = tempfile.mkstemp(suffix=".db")
        os.close(handle)
        pantry_db.DB_PATH = self.test_db_path
        pantry_db.init_db()

    def tearDown(self):
        pantry_db.DB_PATH = self.original_db_path
        os.remove(self.test_db_path)

    def count_active_rows_directly(self):
        """Independent count straight from the table, to compare against."""
        conn = sqlite3.connect(self.test_db_path)
        count = conn.execute("SELECT COUNT(*) FROM pantry_items WHERE status = 'active'").fetchone()[0]
        conn.close()
        return count

    def test_empty_pantry(self):
        self.assertEqual(get_item_count_summary(), {"total": 0, "by_category": {}})

    def test_total_and_breakdown_match_database(self):
        pantry_db.add_item("Black Beans", 2, "can", date(2027, 1, 1), "Canned")
        pantry_db.add_item("Corn", 1, "can", date(2027, 2, 1), "Canned")
        pantry_db.add_item("Milk", 1, "gallon", date(2026, 11, 1), "Dairy")
        summary = get_item_count_summary()
        self.assertEqual(summary["total"], 3)
        self.assertEqual(summary["by_category"], {"Canned": 2, "Dairy": 1})
        self.assertEqual(summary["total"], self.count_active_rows_directly())

    def test_breakdown_sums_to_total(self):
        pantry_db.add_item("Chips", 1, "bag", None, "Snacks")
        pantry_db.add_item("Rice", 2, "lb", None, "Grains")
        summary = get_item_count_summary()
        self.assertEqual(sum(summary["by_category"].values()), summary["total"])

    def test_missing_or_blank_category_is_uncategorized(self):
        pantry_db.add_item("Mystery Jar", 1, "jar", None, None)
        pantry_db.add_item("Leftovers", 1, "box", None, "  ")
        summary = get_item_count_summary()
        self.assertEqual(summary["by_category"], {"Uncategorized": 2})
        self.assertEqual(summary["total"], 2)

    def test_used_and_thrown_out_items_not_counted(self):
        kept_id = pantry_db.add_item("Eggs", 12, "count", date(2026, 11, 5), "Dairy")
        used_id = pantry_db.add_item("Yogurt", 1, "cup", date(2026, 11, 2), "Dairy")
        discarded_id = pantry_db.add_item("Bread", 1, "loaf", date(2026, 10, 1), "Bakery")
        pantry_db.mark_item_used(used_id)
        pantry_db.mark_item_discarded(discarded_id)
        summary = get_item_count_summary()
        self.assertEqual(summary, {"total": 1, "by_category": {"Dairy": 1}})

    def test_reflects_deleted_items(self):
        item_id = pantry_db.add_item("Pasta", 1, "box", None, "Grains")
        pantry_db.delete_item(item_id)
        self.assertEqual(get_item_count_summary()["total"], 0)

    def test_counts_rows_not_quantity(self):
        pantry_db.add_item("Soup", 5, "can", None, "Canned")
        self.assertEqual(get_item_count_summary()["total"], 1)


if __name__ == "__main__":
    unittest.main()
