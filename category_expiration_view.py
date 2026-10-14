from pantry_filter import filter_by_category
from expiration import get_expiration_status

def get_category_expiration_view(category):
    """
    Return all items in a given category, each tagged with its expiration status.

    Returns:
        list of dicts: [{"name": str, "expiration_status": str}, ...]
    """
    items = filter_by_category(category)
    return [
        {"name": item.name, "expiration_status": get_expiration_status(item)}
        for item in items
    ]
