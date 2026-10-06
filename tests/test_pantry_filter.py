"""Tests for Filter Pantry Items by Status/Category. Run from the project root:
    python -m unittest discover tests
"""
import os
import sys
import unittest
from datetime import date

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.pantry_item import PantryItem
from pantry_filter import filter_items, get_categories


def make_item(item_id, name, category, status="active"):
    return PantryItem(id=item_id, name=name, quantity=1, unit="",
                      expiration_date=date(2026, 10, 1), category=category, status=status)


class TestFilterItems(unittest.TestCase):
    def setUp(self):
        self.items = [
            make_item(1, "Milk", "Dairy"),
            make_item(2, "Cheese", "Dairy", "used"),
            make_item(3, "Yogurt", "Dairy", "thrown_out"),
            make_item(4, "Spinach", "Produce"),
            make_item(5, "Apples", "Produce", "used"),
            make_item(6, "Lettuce", "Produce", "thrown_out"),
            make_item(7, "Rice", "Grains"),
        ]

    def names(self, items):
        return [item.name for item in items]

    def test_filter_by_each_status(self):
        self.assertEqual(self.names(filter_items(self.items, status="active")), ["Milk", "Spinach", "Rice"])
        self.assertEqual(self.names(filter_items(self.items, status="used")), ["Cheese", "Apples"])
        self.assertEqual(self.names(filter_items(self.items, status="thrown_out")), ["Yogurt", "Lettuce"])

    def test_filter_by_category(self):
        self.assertEqual(self.names(filter_items(self.items, category="Dairy")), ["Milk", "Cheese", "Yogurt"])
        self.assertEqual(self.names(filter_items(self.items, category="Grains")), ["Rice"])

    def test_category_ignores_case_and_spaces(self):
        self.assertEqual(self.names(filter_items(self.items, category="  produce ")),
                         ["Spinach", "Apples", "Lettuce"])

    def test_filter_by_status_and_category(self):
        self.assertEqual(self.names(filter_items(self.items, status="active", category="Produce")), ["Spinach"])
        self.assertEqual(filter_items(self.items, status="used", category="Grains"), [])

    def test_no_filters_returns_everything(self):
        self.assertEqual(filter_items(self.items), self.items)

    def test_unknown_category_returns_empty(self):
        self.assertEqual(filter_items(self.items, category="Frozen"), [])

    def test_invalid_status_raises(self):
        with self.assertRaises(ValueError):
            filter_items(self.items, status="expired")

    def test_item_without_category_never_matches_a_category(self):
        items = self.items + [make_item(8, "Mystery", None)]
        self.assertNotIn("Mystery", self.names(filter_items(items, category="Dairy")))
        self.assertIn("Mystery", self.names(filter_items(items, status="active")))

    def test_empty_pantry(self):
        self.assertEqual(filter_items([], status="active"), [])

    def test_get_categories(self):
        self.assertEqual(get_categories(self.items), ["Dairy", "Grains", "Produce"])


if __name__ == "__main__":
    unittest.main()
