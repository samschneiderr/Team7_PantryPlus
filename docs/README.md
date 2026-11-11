# PantryPlus

PantryPlus is a smart pantry management app that helps users track the food in their kitchen, stay ahead of expiration dates, and cut down on food waste. Users can add items by scanning a real product's barcode with their device's camera or entering them manually, then track everything from a home dashboard, a full inventory view, and a shopping list, all backed by a real, per-account database.

## Features

- **Real camera-based barcode scanning** — point your device's camera at a real product's barcode to add it automatically, powered by a live embedded scanner connected to the Open Food Facts database (3+ million real products)
- **Manual item entry** — add pantry items by hand with name, quantity, unit, category, and expiration date, with input validation
- **User accounts** — sign up, log in, and edit household preferences (household size, dietary preferences), backed by a real database with hashed, verified passwords and a session that persists across page refreshes
- **Per-user pantry data** — each account has its own private, isolated inventory
- **Expiration tracking** — items are automatically flagged as Fresh, Expiring Soon, or Expired based on their expiration date
- **Inventory management** — view all pantry items sorted by stock level, search by name, mark items as Used or Thrown Out, and see them organized into Active, Used, and Thrown Out sections
- **Low-stock alerts** — set a minimum quantity on any item; items at or below it are flagged "Low Stock" with a one-tap button to add them to the shopping list
- **Shopping list** — a real shopping list connected to the backend, with checkbox persistence and automatic suggestions for frequently wasted items
- **Home dashboard** — see what's expiring soon and a quick snapshot of your pantry at a glance
- **Waste tracking** — frequently wasted items are detected and surfaced to help reduce future waste

## Coming Soon

- Sorting and category filtering on the Inventory page (in progress)
- Activity feed showing recent pantry actions
- Session tokens instead of passing a raw user ID with each request

## Tech Stack

- **Backend:** Python, SQLite
- **Frontend:** React (Vite), React Router
- **API:** A lightweight Python HTTP server bridging the frontend and backend database
- **External data:** Open Food Facts API for real barcode lookups

## Getting Started

1. Start the backend: `python app.py` (runs on `localhost:5001`)
2. Start the frontend: `cd frontend && npm install && npm run dev` (runs on `localhost:5173`)
3. Open `http://localhost:5173` in your browser