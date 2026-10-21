from datetime import date
from db.pantry_db import get_all_items

def get_items_sorted_by_expiration():
    """
    Return all pantry items sorted by expiration date, soonest first.

    Returns:
        list of PantryItem, ordered from earliest to latest expiration date.
    """
    items = get_all_items()
    return sorted(items, key=lambda item: item.expiration_date)
