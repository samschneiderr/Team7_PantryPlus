"""
Expiration Alert Checker (TM07-39)

Check all pantry items and flag the ones that need an alert:
items that are expiring soon (within 3 days) or already expired.

Acceptance criteria:
    The function correctly identifies and returns all items needing an alert.
"""
from datetime import date

from expiration import get_expiration_status

ALERT_STATUSES = ("expired", "expiring soon")


def check_expiration_alerts(items=None, reference_date=None, include_expired=True):
    """
    Check every pantry item and return the ones that need an alert.

    Args:
        items: list of PantryItem objects. If None, loads everything from the database.
               Passing a list makes the function easy to test.
        reference_date: the date to compare against (defaults to today).
        include_expired: if False, only "expiring soon" items are returned.

    Returns:
        A list of dicts, soonest first:
            {"item": PantryItem, "status": "expired" or "expiring soon", "days_left": int}
        days_left is negative for expired items (-2 means it expired 2 days ago).
        Items with no expiration date are skipped.
    """
    if items is None:
        from db.pantry_db import get_all_items
        items = get_all_items()
    if reference_date is None:
        reference_date = date.today()

    wanted = ALERT_STATUSES if include_expired else ("expiring soon",)
    alerts = []
    for item in items:
        if item.expiration_date is None:
            continue
        status = get_expiration_status(item, reference_date)
        if status in wanted:
            alerts.append({
                "item": item,
                "status": status,
                "days_left": (item.expiration_date - reference_date).days,
            })

    alerts.sort(key=lambda alert: alert["days_left"])
    return alerts


def format_alert(alert):
    """Turn one alert into a short message, e.g. 'Milk expires in 2 days'."""
    name, days = alert["item"].name, alert["days_left"]
    if days < 0:
        return f"{name} expired {-days} day{'s' if days != -1 else ''} ago"
    if days == 0:
        return f"{name} expires today"
    return f"{name} expires in {days} day{'s' if days != 1 else ''}"


if __name__ == "__main__":
    # Quick manual demo: prints alerts for whatever is in pantry.db
    from db.pantry_db import init_db
    init_db()
    results = check_expiration_alerts()
    if not results:
        print("No items need an alert.")
    for alert in results:
        print(format_alert(alert))
