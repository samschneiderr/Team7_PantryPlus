"""Serves pantry data and user accounts as JSON for the frontend."""
import json
from datetime import date
from urllib.parse import urlparse, parse_qs
from http.server import BaseHTTPRequestHandler, HTTPServer
from db.pantry_db import init_db, get_items_for_user, get_item, add_item, mark_item_used, mark_item_discarded
from db.users_db import init_users_db, create_user, get_user_by_email, update_user, verify_password
from scan_to_add import lookup_barcode_online

PORT = 5001


def get_items_formatted(user_id):
    """Return this user's pantry items as dicts with days left until expiration."""
    today = date.today()
    return [{
        "id": item.id,
        "name": item.name,
        "quantity": item.quantity,
        "unit": item.unit,
        "category": item.category,
        "status": item.status,
        "days_left": (item.expiration_date - today).days if item.expiration_date else None,
    } for item in get_items_for_user(user_id)]


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
        """Respond to GET /api/items?user_id=X with that user's pantry items."""
        parsed = urlparse(self.path)
        if parsed.path == "/api/items":
            params = parse_qs(parsed.query)
            user_id_str = params.get("user_id", [None])[0]
            if not user_id_str:
                self._send_json(400, {"error": "user_id is required"})
                return
            try:
                user_id = int(user_id_str)
            except ValueError:
                self._send_json(400, {"error": "Invalid user_id"})
                return
            self._send_json(200, get_items_formatted(user_id))
        else:
            self.send_error(404)

    def do_POST(self):
        """Handle all POST endpoints."""
        parsed = urlparse(self.path)

        if parsed.path == "/api/items":
            data = self._read_json_body()
            name = data.get("name")
            quantity = data.get("quantity")
            unit = data.get("unit", "")
            category = data.get("category", "")
            expiration_date_str = data.get("expiration_date")
            user_id = data.get("user_id")

            if not user_id:
                self._send_json(400, {"error": "user_id is required"})
                return
            if not name or quantity is None or float(quantity) <= 0:
                self._send_json(400, {"error": "Name is required and quantity must be above 0"})
                return

            exp_date = date.fromisoformat(expiration_date_str) if expiration_date_str else None
            item_id = add_item(name, float(quantity), unit, exp_date, category, user_id=user_id)
            self._send_json(201, {"id": item_id, "name": name})

        elif parsed.path == "/api/scan":
            data = self._read_json_body()
            barcode = data.get("barcode")

            result = lookup_barcode_online(barcode)

            self._send_json(200, {
                "success": result is not None,
                "item_name": result["name"] if result else None,
                "category": result["category"] if result else None,
                "barcode": barcode,
            })

        elif parsed.path.startswith("/api/items/") and parsed.path.endswith("/status"):
            parts = parsed.path.split("/")
            try:
                item_id = int(parts[3])
            except (IndexError, ValueError):
                self._send_json(400, {"error": "Invalid item id"})
                return
            data = self._read_json_body()
            user_id = data.get("user_id")
            new_status = data.get("status")

            item = get_item(item_id)
            if item is None or item.user_id != user_id:
                self._send_json(404, {"error": "Item not found"})
                return

            if new_status == "used":
                mark_item_used(item_id)
            elif new_status == "thrown_out":
                mark_item_discarded(item_id)
            else:
                self._send_json(400, {"error": "Invalid status"})
                return
            self._send_json(200, {"success": True})

        elif parsed.path == "/api/signup":
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

        elif parsed.path == "/api/login":
            data = self._read_json_body()
            email = data.get("email")
            password = data.get("password")

            if not verify_password(email, password):
                self._send_json(401, {"error": "Incorrect email or password"})
                return

            self._send_json(200, get_user_by_email(email))

        elif parsed.path.startswith("/api/users/") and parsed.path.endswith("/update"):
            parts = parsed.path.split("/")
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