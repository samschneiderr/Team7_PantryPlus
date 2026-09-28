"""
Track Frequently Wasted Items
Identify pantry items that were thrown out (rather than used up),
so the user can see which foods they tend to waste.
"""
from collections import Counter
from db.pantry_db import get_all_items

def get_wasted_items():
    """
    Return all items with status 'thrown_out'.
    """
    items = get_all_items()
    return [item for item in items if item.status == "thrown_out"]

def get_frequently_wasted(min_count=2):
    """
    Count how many times each food name was thrown out, and return
    only the ones that happened at least `min_count` times.

    Returns:
        A list of (name, count) tuples, sorted by count descending.
    """
    wasted = get_wasted_items()
    counts = Counter(item.name for item in wasted)
    frequent = [(name, count) for name, count in counts.items() if count >= min_count]
    frequent.sort(key=lambda pair: pair[1], reverse=True)
    return frequent
