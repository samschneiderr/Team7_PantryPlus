from pantry_summary import get_pantry_summary
from waste_tracker import get_frequently_wasted

def get_pantry_health_report(min_count=2):
    """
    Combine expiration status summary and frequently wasted items
    into one unified pantry health report.

    Returns:
        dict: {
            "expiration_summary": {"expired": int, "expiring soon": int, "fresh": int},
            "frequently_wasted": list of (name, count) tuples
        }
    """
    return {
        "expiration_summary": get_pantry_summary(),
        "frequently_wasted": get_frequently_wasted(min_count=min_count),
    }
