from datetime import date
from sort_items import get_items_sorted_by_expiration
from db.pantry_db import add_item, init_db, delete_item

def test_items_sorted_soonest_first():
    init_db()
    id_a = add_item("Item A", 1, "unit", date(2026, 12, 1), "Test")
    id_b = add_item("Item B", 1, "unit", date(2026, 10, 1), "Test")

    try:
        items = get_items_sorted_by_expiration()
        dates = [item.expiration_date for item in items]
        assert dates == sorted(dates)
    finally:
        delete_item(id_a)
        delete_item(id_b)