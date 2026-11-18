"""
Low Stock Alerts

Flag pantry items that are running low so the user can add them to the
shopping list before they run out.

Acceptance criteria:
    The user can set a minimum quantity for any pantry item.
    When quantity is at or below that number, the item is flagged as low stock.
    The user can add a low-stock item to the shopping list with one action.
"""
from shopping_list import add_to_shopping_list


def is_low_stock(item):
    """Return True if the item is active, has a minimum set, and is at or below it."""
    if item.min_quantity is None or item.status != "active":
        return False
    return item.quantity <= item.min_quantity


def check_low_stock_alerts(items=None):
    """
    Return every pantry item that is low on stock.

    Args:
        items: list of PantryItem objects. If None, loads everything from the database.
               Passing a list makes the function easy to test.

    Returns:
        A list of dicts, lowest stock (relative to its minimum) first:
            {"item": PantryItem, "quantity": float, "min_quantity": float}
        Items with no minimum set, and used or thrown out items, are skipped.
    """
    if items is None:
        from db.pantry_db import get_all_items
        items = get_all_items()

    alerts = [
        {"item": item, "quantity": item.quantity, "min_quantity": item.min_quantity}
        for item in items if is_low_stock(item)
    ]
    alerts.sort(key=lambda alert: alert["quantity"] - alert["min_quantity"])
    return alerts


def format_low_stock_alert(alert):
    """Turn one alert into a short message, e.g. 'Milk is running low (1 gallon left, minimum 2)'."""
    item = alert["item"]
    left = f"{alert['quantity']:g} {item.unit or ''}".strip()
    return f"{item.name} is running low ({left} left, minimum {alert['min_quantity']:g})"


def add_low_stock_item_to_shopping_list(item_id, db_path=None):
    """
    Add a low-stock pantry item to the shopping list in a single call.

    Args:
        item_id: id of the pantry item.
        db_path: shopping list database path (defaults to the pantry database).

    Returns:
        The result from shopping_list.add_to_shopping_list, so callers can
        tell whether the item was already on the list.

    Raises:
        ValueError: if the item doesn't exist or isn't low on stock.
    """
    from db import pantry_db

    item = pantry_db.get_item(item_id)
    if item is None:
        raise ValueError(f"No pantry item with id {item_id}")
    if not is_low_stock(item):
        raise ValueError(f"{item.name} is not low on stock")
    return add_to_shopping_list(item.name, db_path=db_path or pantry_db.DB_PATH)


if __name__ == "__main__":
    # Quick manual demo: prints low-stock alerts for whatever is in pantry.db
    from db.pantry_db import init_db
    init_db()
    results = check_low_stock_alerts()
    if not results:
        print("No items are running low.")
    for alert in results:
        print(format_low_stock_alert(alert))
