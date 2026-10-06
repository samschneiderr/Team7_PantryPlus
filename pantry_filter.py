"""
Filter Pantry Items by Status/Category

Let users filter their pantry view by item status (active, used, thrown_out)
or category (e.g. Dairy, Produce).

Acceptance criteria:
    Function returns correctly filtered results for a given status or category.
"""

VALID_STATUSES = ("active", "used", "thrown_out")


def filter_items(items=None, status=None, category=None):
    """
    Return the pantry items that match the given status and/or category.

    Args:
        items: list of PantryItem objects. If None, loads everything from the database.
               Passing a list makes the function easy to test.
        status: one of "active", "used", "thrown_out". None means any status.
        category: e.g. "Dairy" or "Produce". Matching ignores case and surrounding
                  spaces, so "dairy" matches "Dairy". None means any category.

    If both status and category are given, an item must match both.
    If neither is given, every item is returned.

    Returns:
        A list of PantryItem objects, in their original order.

    Raises:
        ValueError: if status is not one of VALID_STATUSES.
    """
    if status is not None and status not in VALID_STATUSES:
        raise ValueError(f"Invalid status {status!r}. Expected one of {VALID_STATUSES}.")
    if items is None:
        from db.pantry_db import get_all_items
        items = get_all_items()

    wanted_category = category.strip().lower() if category is not None else None
    results = []
    for item in items:
        if status is not None and item.status != status:
            continue
        if wanted_category is not None and (item.category or "").strip().lower() != wanted_category:
            continue
        results.append(item)
    return results


def get_categories(items=None):
    """Return the distinct categories in the pantry, sorted, e.g. for a filter dropdown."""
    if items is None:
        from db.pantry_db import get_all_items
        items = get_all_items()
    return sorted({item.category for item in items if item.category})


if __name__ == "__main__":
    # Quick manual demo: prints active items in each category in pantry.db
    from db.pantry_db import init_db
    init_db()
    for cat in get_categories():
        names = [item.name for item in filter_items(status="active", category=cat)]
        print(f"{cat}: {', '.join(names) if names else '(none active)'}")
