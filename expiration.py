"""
Expiration Status Tracking

Given a PantryItem, determine whether it is
"expired", "expiring soon" (within 3 days), or "fresh".
"""

from datetime import date
from models.pantry_item import PantryItem

EXPIRING_SOON_WINDOW_DAYS = 3


def get_expiration_status(item: PantryItem, reference_date: date = None) -> str:
    """
    Determine the expiration status of a pantry item.

    Args:
        item: The PantryItem to check.
        reference_date: The date to compare against (defaults to today).
                         Passing this explicitly makes the function easy to test.

    Returns:
        One of: "expired", "expiring soon", "fresh"
    """
    if reference_date is None:
        reference_date = date.today()

    days_until_expiration = (item.expiration_date - reference_date).days

    if days_until_expiration < 0:
        return "expired"
    elif days_until_expiration <= EXPIRING_SOON_WINDOW_DAYS:
        return "expiring soon"
    else:
        return "fresh"



Bruh, idk why its not working but you can copy paste it.
