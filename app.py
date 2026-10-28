"""Serves pantry data from the database as JSON for the frontend."""
import json
from datetime import date
from http.server import BaseHTTPRequestHandler, HTTPServer
from db.pantry_db import init_db, get_all_items

PORT = 5000


def get_active_items():
    """Return active pantry items as dicts with days left until expiration."""
    today = date.today()
    return [{
        "id": item.id,
        "name": item.name,
        "quantity": item.quantity,
        "unit": item.unit,
        "category": item.category,
        "days_left": (item.expiration_date - today).days if item.expiration_date else None,
    } for item in get_all_items() if item.status == "active"]


class PantryRequestHandler(BaseHTTPRequestHandler):
    """Handles API requests for pantry items."""

    def do_GET(self):
        """Respond to GET /api/items with the active pantry items."""
        if self.path != "/api/items":
            self.send_error(404)
            return
        body = json.dumps(get_active_items()).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    init_db()
    HTTPServer(("localhost", PORT), PantryRequestHandler).serve_forever()
