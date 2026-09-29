"""Tests for the Expiration Alert Checker (TM07-39). Run from the project root:
    python -m unittest discover tests
"""
import os
import sys
import unittest
from datetime import date, timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from expiration_alerts import check_expiration_alerts, format_alert
from models.pantry_item import PantryItem

TODAY = date(2026, 10, 1)


def make_item(item_id, name, days_from_today):
    exp = None if days_from_today is None else TODAY + timedelta(days=days_from_today)
    return PantryItem(id=item_id, name=name, quantity=1, unit="", expiration_date=exp, category="Test")


class TestExpirationAlerts(unittest.TestCase):
    def setUp(self):
        self.items = [
            make_item(1, "Milk", -2),        # expired
            make_item(2, "Spinach", 0),      # expires today
            make_item(3, "Yogurt", 3),       # last day of the 3-day window
            make_item(4, "Bread", 4),        # just outside the window
            make_item(5, "Rice", 200),       # fresh
            make_item(6, "Salt", None),      # no expiration date
        ]

    def names(self, alerts):
        return [a["item"].name for a in alerts]

    def test_returns_all_items_needing_alert(self):
        alerts = check_expiration_alerts(self.items, TODAY)
        self.assertEqual(self.names(alerts), ["Milk", "Spinach", "Yogurt"])

    def test_statuses_and_days_left(self):
        alerts = check_expiration_alerts(self.items, TODAY)
        self.assertEqual([a["status"] for a in alerts], ["expired", "expiring soon", "expiring soon"])
        self.assertEqual([a["days_left"] for a in alerts], [-2, 0, 3])

    def test_fresh_and_undated_items_not_flagged(self):
        flagged = self.names(check_expiration_alerts(self.items, TODAY))
        for name in ("Bread", "Rice", "Salt"):
            self.assertNotIn(name, flagged)

    def test_can_exclude_expired(self):
        alerts = check_expiration_alerts(self.items, TODAY, include_expired=False)
        self.assertEqual(self.names(alerts), ["Spinach", "Yogurt"])

    def test_empty_pantry(self):
        self.assertEqual(check_expiration_alerts([], TODAY), [])

    def test_format_alert(self):
        alerts = check_expiration_alerts(self.items, TODAY)
        self.assertEqual([format_alert(a) for a in alerts],
                         ["Milk expired 2 days ago", "Spinach expires today", "Yogurt expires in 3 days"])


if __name__ == "__main__":
    unittest.main()
