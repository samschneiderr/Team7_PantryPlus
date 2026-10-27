from datetime import date
from sort_items import get_items_sorted_by_expiration
from db.pantry_db import add_item, init_db

def test_items_sorted_soonest_first():
    init_db()
    add_item("Item A", 1, "unit", date(2026, 12, 1), "Test")
    add_item("Item B", 1, "unit", date(2026, 10, 1), "Test")
    items = get_items_sorted_by_expiration()
    dates = [item.expiration_date for item in items]
    assert dates == sorted(dates)