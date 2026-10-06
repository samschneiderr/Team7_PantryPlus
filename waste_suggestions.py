"""
waste_suggestions.py

Auto-Suggest Shopping List from Wasted Items.

If a food is frequently thrown out, add it to the shopping list so the
user can review it. Uses get_frequently_wasted() from waste_tracker.py and
add_to_shopping_list() / get_shopping_list() from shopping_list.py.
"""

from shopping_list import add_to_shopping_list, get_shopping_list
from waste_tracker import get_frequently_wasted


def _normalize(name):
    """Ignore capitalization and extra spaces so 'Milk ' matches 'milk'."""
    return " ".join(name.lower().split())


def suggest_wasted_items(min_count=2, db_path="pantry.db", conn=None):
    """
    Add frequently wasted foods that aren't on the shopping list yet.

    Args:
        min_count (int): how many times a food must be thrown out to count.
        db_path (str): path to the sqlite database file.
        conn: optional existing sqlite3 connection (mainly for tests).

    Returns:
        list[str]: the names of the foods that were added.
    """
    on_list = {
        _normalize(item["item_name"])
        for item in get_shopping_list(db_path=db_path, conn=conn)
    }

    added = []
    for name, _count in get_frequently_wasted(min_count):
        key = _normalize(name)
        if key in on_list:
            continue
        add_to_shopping_list(name, db_path=db_path, conn=conn)
        on_list.add(key)
        added.append(name)
    return added
