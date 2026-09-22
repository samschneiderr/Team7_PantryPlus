# Reads all pantry items from the db and writes a static HTML list view.
import sys
import os
from html import escape

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db.pantry_db import get_all_items, init_db

def render_html(items):
    if items:
        rows = """
        <div class="item-row header">
            <span>Item</span>
            <span>Quantity</span>
            <span>Category</span>
            <span>Expires</span>
        </div>
        """
        for item in items:
            quantity = f"{item.quantity:g} {item.unit or ''}".strip()
            rows += f"""
        <div class="item-row">
            <span>{escape(str(item.name))}</span>
            <span>{escape(quantity)}</span>
            <span>{escape(str(item.category or "Uncategorized"))}</span>
            <span>{escape(str(item.expiration_date))}</span>
        </div>
        """
    else:
        rows = '<p class="empty">Your pantry is empty. Add some items to get started.</p>'

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>PantryPlus - My Pantry</title>
    <link rel="stylesheet" href="../static/style.css">
</head>
<body>
    <h1>My Pantry</h1>
    <div id="itemList">
        {rows}
    </div>
</body>
</html>"""
    return html

if __name__ == "__main__":
    # Safe to call every run; creates the table only if it does not exist yet.
    init_db()
    items = get_all_items()
    html = render_html(items)

    output_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "output", "pantry_list.html")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"Generated {output_path}")
