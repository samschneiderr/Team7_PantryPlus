"""Tests for low_stock_alerts and the min_quantity support in db/pantry_db.py."""
import os
import sqlite3
import tempfile
import unittest

import db.pantry_db as pantry_db
from low_stock_alerts import (
    add_low_stock_item_to_shopping_list,
    check_low_stock_alerts,
    format_low_stock_alert,
)
from models.pantry_item import PantryItem
from shopping_list import get_shopping_list


class LowStockTestCase(unittest.TestCase):
    """Base class that points pantry_db at a throwaway database."""

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


class TestSetMinQuantity(LowStockTestCase):
    """The user can set a minimum quantity for any pantry item."""

    def test_new_item_has_no_minimum(self):
        pantry_db.add_item("Rice", 2, "lb", None, "Grains")
        self.assertIsNone(pantry_db.get_all_items()[0].min_quantity)

    def test_add_item_with_minimum(self):
        pantry_db.add_item("Rice", 2, "lb", None, "Grains", min_quantity=1)
        self.assertEqual(pantry_db.get_all_items()[0].min_quantity, 1)

    def test_set_and_clear_minimum(self):
        item_id = pantry_db.add_item("Milk", 1, "gallon", None, "Dairy")
        self.assertTrue(pantry_db.set_min_quantity(item_id, 2))
        self.assertEqual(pantry_db.get_item(item_id).min_quantity, 2)
        pantry_db.set_min_quantity(item_id, None)
        self.assertIsNone(pantry_db.get_item(item_id).min_quantity)

    def test_negative_minimum_rejected(self):
        item_id = pantry_db.add_item("Milk", 1, "gallon", None, "Dairy")
        with self.assertRaises(ValueError):
            pantry_db.set_min_quantity(item_id, -1)
        with self.assertRaises(ValueError):
            pantry_db.add_item("Eggs", 6, "count", None, "Dairy", min_quantity=-3)

    def test_set_minimum_on_missing_item(self):
        self.assertFalse(pantry_db.set_min_quantity(999, 2))

    def test_old_database_gets_column_added(self):
        # Simulate a pantry.db created before min_quantity existed
        os.remove(self.test_db_path)
        conn = sqlite3.connect(self.test_db_path)
        conn.execute("""CREATE TABLE pantry_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL,
            quantity REAL NOT NULL, unit TEXT, expiration_date TEXT, category TEXT,
            barcode TEXT, status TEXT DEFAULT 'active')""")
        conn.execute("INSERT INTO pantry_items (name, quantity) VALUES ('Old Item', 3)")
        conn.commit(); conn.close()

        pantry_db.init_db()
        items = pantry_db.get_all_items()
        self.assertEqual(items[0].name, "Old Item")
        self.assertIsNone(items[0].min_quantity)


class TestCheckLowStockAlerts(LowStockTestCase):
    """Items at or below their minimum are flagged as low stock."""

    def flagged_names(self):
        return [alert["item"].name for alert in check_low_stock_alerts()]

    def test_empty_pantry(self):
        self.assertEqual(check_low_stock_alerts(), [])

    def test_below_minimum_is_flagged(self):
        pantry_db.add_item("Milk", 1, "gallon", None, "Dairy", min_quantity=2)
        self.assertEqual(self.flagged_names(), ["Milk"])

    def test_at_minimum_is_flagged(self):
        pantry_db.add_item("Milk", 2, "gallon", None, "Dairy", min_quantity=2)
        self.assertEqual(self.flagged_names(), ["Milk"])

    def test_above_minimum_not_flagged(self):
        pantry_db.add_item("Milk", 3, "gallon", None, "Dairy", min_quantity=2)
        self.assertEqual(self.flagged_names(), [])

    def test_zero_quantity_is_flagged(self):
        pantry_db.add_item("Salt", 0, "box", None, "Spices", min_quantity=0)
        self.assertEqual(self.flagged_names(), ["Salt"])

    def test_no_minimum_not_flagged(self):
        pantry_db.add_item("Rice", 0, "lb", None, "Grains")
        self.assertEqual(self.flagged_names(), [])

    def test_used_and_thrown_out_not_flagged(self):
        used_id = pantry_db.add_item("Yogurt", 0, "cup", None, "Dairy", min_quantity=1)
        discarded_id = pantry_db.add_item("Bread", 0, "loaf", None, "Bakery", min_quantity=1)
        pantry_db.mark_item_used(used_id)
        pantry_db.mark_item_discarded(discarded_id)
        self.assertEqual(self.flagged_names(), [])

    def test_lowest_relative_to_minimum_first(self):
        pantry_db.add_item("Eggs", 5, "count", None, "Dairy", min_quantity=6)
        pantry_db.add_item("Milk", 0, "gallon", None, "Dairy", min_quantity=2)
        self.assertEqual(self.flagged_names(), ["Milk", "Eggs"])

    def test_accepts_item_list(self):
        items = [PantryItem(1, "Beans", 1, "can", None, "Canned", min_quantity=2)]
        self.assertEqual(len(check_low_stock_alerts(items)), 1)

    def test_format_alert(self):
        item = PantryItem(1, "Milk", 1, "gallon", None, "Dairy", min_quantity=2)
        alert = check_low_stock_alerts([item])[0]
        self.assertEqual(format_low_stock_alert(alert),
                         "Milk is running low (1 gallon left, minimum 2)")


class TestAddLowStockItemToShoppingList(LowStockTestCase):
    """A low-stock item can be added to the shopping list with one action."""

    def shopping_list_names(self):
        return [entry["item_name"] for entry in get_shopping_list(db_path=self.test_db_path)]

    def test_adds_low_item(self):
        item_id = pantry_db.add_item("Milk", 1, "gallon", None, "Dairy", min_quantity=2)
        result = add_low_stock_item_to_shopping_list(item_id)
        self.assertFalse(result["already_existed"])
        self.assertEqual(self.shopping_list_names(), ["Milk"])

    def test_adding_twice_does_not_duplicate(self):
        item_id = pantry_db.add_item("Milk", 1, "gallon", None, "Dairy", min_quantity=2)
        add_low_stock_item_to_shopping_list(item_id)
        result = add_low_stock_item_to_shopping_list(item_id)
        self.assertTrue(result["already_existed"])
        self.assertEqual(self.shopping_list_names(), ["Milk"])

    def test_item_not_low_rejected(self):
        item_id = pantry_db.add_item("Milk", 5, "gallon", None, "Dairy", min_quantity=2)
        with self.assertRaises(ValueError):
            add_low_stock_item_to_shopping_list(item_id)
        self.assertEqual(self.shopping_list_names(), [])

    def test_missing_item_rejected(self):
        with self.assertRaises(ValueError):
            add_low_stock_item_to_shopping_list(999)


if __name__ == "__main__":
    unittest.main()
