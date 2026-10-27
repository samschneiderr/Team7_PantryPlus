"""Summarize how many items are in the pantry, in total and by category."""
from db.pantry_db import count_items_by_category


def get_item_count_summary():
    """Return the total count of active pantry items and a per-category breakdown.

    Only items with status "active" are counted, because used and thrown-out
    items are kept in the database for waste tracking but are no longer in the pantry.
    Each database row counts as one item; quantity is not summed because units
    differ between items (2 lbs of rice and 3 cans of beans can't be added).

    Returns:
        dict: {"total": int, "by_category": {category_name: int, ...}}
    """
    by_category = count_items_by_category(status="active")
    return {"total": sum(by_category.values()), "by_category": by_category}
