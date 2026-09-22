# Reads all pantry items from the db and writes a static HTML list view with barcodes.
import sys
import os
from html import escape

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db.pantry_db import get_all_items, init_db

# python-barcode draws the barcode as inline SVG (pip install python-barcode).
# If it's not installed, the page still works and just shows the barcode number.
try:
    import barcode
    from barcode.writer import SVGWriter
except ImportError:
    barcode = None


def pick_symbology(code):
    """Choose the barcode type that matches the code's length/format."""
    if code.isdigit():
        if len(code) == 12:
            return "upca"    # standard US grocery barcode
        if len(code) == 13:
            return "ean13"   # international grocery barcode
        if len(code) == 8:
            return "ean8"    # small packages
    return "code128"         # handles anything else (letters, odd lengths)


def barcode_svg(code):
    """Return an inline <svg> string for the code, or None if it can't be drawn."""
    if barcode is None:
        return None
    try:
        svg_bytes = barcode.get(pick_symbology(code), code, writer=SVGWriter()).render(
            writer_options={"write_text": False, "module_height": 10, "quiet_zone": 2}
        )
    except Exception:
        return None
    svg = svg_bytes.decode("utf-8")
    # Drop the XML declaration/DOCTYPE so the SVG can sit directly inside HTML.
    return svg[svg.find("<svg"):]


def render_barcode_cell(item):
    code = str(getattr(item, "barcode", "") or "").strip()
    if not code:
        return '<span class="barcode missing">No barcode</span>'
    svg = barcode_svg(code)
    image = f'<div class="barcode-img">{svg}</div>' if svg else ""
    return f'<span class="barcode">{image}<code>{escape(code)}</code></span>'


def render_html(items):
    if items:
        rows = """
        <div class="item-row header">
            <span>Item</span>
            <span>Quantity</span>
            <span>Category</span>
            <span>Barcode</span>
        </div>
        """
        for item in items:
            quantity = f"{item.quantity:g} {item.unit or ''}".strip()
            rows += f"""
        <div class="item-row">
            <span>{escape(str(item.name))}</span>
            <span>{escape(quantity)}</span>
            <span>{escape(str(item.category or "Uncategorized"))}</span>
            {render_barcode_cell(item)}
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