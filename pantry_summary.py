from db.pantry_db import get_all_items
from expiration import get_expiration_status

def get_pantry_summary():
    """
    Summarize pantry items by expiration status.

    Returns:
        dict: {"expired": int, "expiring soon": int, "fresh": int}
    """
    items = get_all_items()
    summary = {"expired": 0, "expiring soon": 0, "fresh": 0}

    for item in items:
        if item.expiration_date is None:  # e.g. salt, spices - nothing to count
            continue
        status = get_expiration_status(item)
        summary[status] += 1

    return summary
