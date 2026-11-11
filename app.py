"""Serves pantry data and user accounts as JSON for the frontend."""
import json
from datetime import date
from urllib.parse import urlparse, parse_qs
from http.server import BaseHTTPRequestHandler, HTTPServer
from db.pantry_db import init_db, get_items_for_user, get_item, add_item, mark_item_used, mark_item_discarded, set_min_quantity
from low_stock_alerts import is_low_stock, add_low_stock_item_to_shopping_list
from shopping_list import get_shopping_list, remove_from_shopping_list
from waste_suggestions import suggest_wasted_items
from waste_tracker import get_frequently_wasted
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
        "min_quantity": item.min_quantity,
        "is_low_stock": is_low_stock(item),
    } for item in get_items_for_user(user_id)]


def parse_min_quantity(value):
    """Turn a min_quantity from the request into a float, or None when it is blank (cleared)."""
    if value is None or value == "":
        return None
    min_quantity = float(value)
    if min_quantity < 0:
        raise ValueError("Minimum quantity cannot be negative")
    return min_quantity


def get_shopping_list_formatted():
    """Return the shopping list, marking items that are there because they're often thrown out."""
    wasted_names = {name.lower() for name, _count in get_frequently_wasted()}
    return [{
        "item_name": entry["item_name"],
        "added_at": entry["added_at"],
        "is_waste_suggestion": entry["item_name"].lower() in wasted_names,
    } for entry in get_shopping_list()]


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
        elif parsed.path == "/api/shopping-list":
            self._send_json(200, get_shopping_list_formatted())
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

            try:
                min_quantity = parse_min_quantity(data.get("min_quantity"))
            except ValueError:
                self._send_json(400, {"error": "Minimum quantity must be 0 or more"})
                return

            exp_date = date.fromisoformat(expiration_date_str) if expiration_date_str else None
            item_id = add_item(name, float(quantity), unit, exp_date, category, min_quantity=min_quantity, user_id=user_id)
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

        elif parsed.path.startswith("/api/items/") and parsed.path.endswith("/min-quantity"):
            parts = parsed.path.split("/")
            try:
                item_id = int(parts[3])
            except (IndexError, ValueError):
                self._send_json(400, {"error": "Invalid item id"})
                return
            data = self._read_json_body()

            item = get_item(item_id)
            if item is None or item.user_id != data.get("user_id"):
                self._send_json(404, {"error": "Item not found"})
                return

            try:
                min_quantity = parse_min_quantity(data.get("min_quantity"))
            except ValueError:
                self._send_json(400, {"error": "Minimum quantity must be 0 or more"})
                return
            set_min_quantity(item_id, min_quantity)
            self._send_json(200, {"success": True, "min_quantity": min_quantity})

        elif parsed.path.startswith("/api/items/") and parsed.path.endswith("/add-to-shopping-list"):
            parts = parsed.path.split("/")
            try:
                item_id = int(parts[3])
            except (IndexError, ValueError):
                self._send_json(400, {"error": "Invalid item id"})
                return
            data = self._read_json_body()

            item = get_item(item_id)
            if item is None or item.user_id != data.get("user_id"):
                self._send_json(404, {"error": "Item not found"})
                return

            try:
                result = add_low_stock_item_to_shopping_list(item_id)
            except ValueError as error:
                self._send_json(400, {"error": str(error)})
                return
            self._send_json(200, result)

        elif parsed.path == "/api/shopping-list/suggestions":
            self._send_json(200, {"added": suggest_wasted_items()})

        elif parsed.path == "/api/shopping-list/remove":
            data = self._read_json_body()
            item_name = data.get("item_name")
            if not item_name:
                self._send_json(400, {"error": "item_name is required"})
                return
            self._send_json(200, {"removed": remove_from_shopping_list(item_name)})

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