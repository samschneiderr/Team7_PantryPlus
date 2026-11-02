"""Serves pantry data and user accounts as JSON for the frontend."""
import json
from datetime import date
from http.server import BaseHTTPRequestHandler, HTTPServer
from db.pantry_db import init_db, get_all_items, add_item, mark_item_used, mark_item_discarded
from db.users_db import init_users_db, create_user, get_user_by_email, update_user
from scan_to_add import BARCODE_CATALOG, simulate_scan_success

PORT = 5001


def get_items_formatted():
    """Return all pantry items as dicts with days left until expiration."""
    today = date.today()
    return [{
        "id": item.id,
        "name": item.name,
        "quantity": item.quantity,
        "unit": item.unit,
        "category": item.category,
        "status": item.status,
        "days_left": (item.expiration_date - today).days if item.expiration_date else None,
    } for item in get_all_items()]


class PantryRequestHandler(BaseHTTPRequestHandler):
    """Handles API requests for pantry items and user accounts."""

    def _send_json(self, status, data):
        body = json.dumps(data).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _read_json_body(self):
        length = int(self.headers.get("Content-Length", 0))
        raw = self.rfile.read(length)
        return json.loads(raw) if raw else {}

    def do_GET(self):
        """Respond to GET /api/items with all pantry items."""
        if self.path == "/api/items":
            self._send_json(200, get_items_formatted())
        else:
            self.send_error(404)

    def do_POST(self):
        """Handle all POST endpoints."""
        if self.path == "/api/items":
            data = self._read_json_body()
            name = data.get("name")
            quantity = data.get("quantity")
            unit = data.get("unit", "")
            category = data.get("category", "")
            expiration_date_str = data.get("expiration_date")

            if not name or quantity is None or float(quantity) <= 0:
                self._send_json(400, {"error": "Name is required and quantity must be above 0"})
                return

            exp_date = date.fromisoformat(expiration_date_str) if expiration_date_str else None
            item_id = add_item(name, float(quantity), unit, exp_date, category)
            self._send_json(201, {"id": item_id, "name": name})

        elif self.path == "/api/scan":
            data = self._read_json_body()
            barcode = data.get("barcode")

            scan_ok = simulate_scan_success()
            item_name = BARCODE_CATALOG.get(barcode) if scan_ok else None
            success = scan_ok and item_name is not None

            self._send_json(200, {
                "success": success,
                "item_name": item_name,
                "barcode": barcode,
            })

        elif self.path.startswith("/api/items/") and self.path.endswith("/status"):
            parts = self.path.split("/")
            try:
                item_id = int(parts[3])
            except (IndexError, ValueError):
                self._send_json(400, {"error": "Invalid item id"})
                return
            data = self._read_json_body()
            new_status = data.get("status")
            if new_status == "used":
                mark_item_used(item_id)
            elif new_status == "thrown_out":
                mark_item_discarded(item_id)
            else:
                self._send_json(400, {"error": "Invalid status"})
                return
            self._send_json(200, {"success": True})

        elif self.path == "/api/signup":
            data = self._read_json_body()
            name = data.get("name")
            email = data.get("email")
            password = data.get("password")
            household = data.get("household", 1)
            diet = data.get("diet", "None")

            if not name or not email or not password:
                self._send_json(400, {"error": "Missing required fields"})
                return

            user_id = create_user(name, email, password, household, diet)
            if user_id is None:
                self._send_json(409, {"error": "An account with that email already exists"})
                return

            self._send_json(201, get_user_by_email(email))

        elif self.path == "/api/login":
            data = self._read_json_body()
            email = data.get("email")
            user = get_user_by_email(email)
            if user is None:
                self._send_json(404, {"error": "No account found with that email"})
                return
            self._send_json(200, user)

        elif self.path.startswith("/api/users/") and self.path.endswith("/update"):
            parts = self.path.split("/")
            try:
                user_id = int(parts[3])
            except (IndexError, ValueError):
                self._send_json(400, {"error": "Invalid user id"})
                return
            data = self._read_json_body()
            update_user(user_id, household=data.get("household"), diet=data.get("diet"))
            self._send_json(200, {"success": True})

        else:
            self.send_error(404)


if __name__ == "__main__":
    init_db()
    init_users_db()
    HTTPServer(("localhost", PORT), PantryRequestHandler).serve_forever()