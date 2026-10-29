"""Serves pantry data and user accounts as JSON for the frontend."""
import json
from datetime import date
from http.server import BaseHTTPRequestHandler, HTTPServer
from db.pantry_db import init_db, get_all_items
from db.users_db import init_users_db, create_user, get_user_by_email, update_user

PORT = 5001


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
        """Respond to GET /api/items with the active pantry items."""
        if self.path == "/api/items":
            self._send_json(200, get_active_items())
        else:
            self.send_error(404)

    def do_POST(self):
        """Handle POST /api/signup, /api/login, and /api/users/<id>/update."""
        if self.path == "/api/signup":
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
            # Note: password is not yet verified, this is an early version.
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