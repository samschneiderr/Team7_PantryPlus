# PantryPlus

PantryPlus is a smart pantry management app that helps users track the food items in their pantry, monitor expiration dates, and reduce food waste. Users can add items manually or by scanning a barcode with their device's camera, and track their pantry's health at a glance from the home dashboard.

## Features

- **Camera-based barcode scanning** — point your device's camera at a barcode to quickly add an item, powered by a live embedded scanner and a backend lookup simulating real-world scan reliability (~98% success rate)
- **Manual item entry** — add pantry items by hand with name, quantity, unit, category, and expiration date, with input validation
- **Expiration tracking** — items are automatically flagged as Fresh, Expiring Soon, or Expired based on their expiration date
- **Inventory management** — view all pantry items sorted by stock level, search by name, and mark items as Used or Thrown Out
- **Home dashboard** — see what's expiring soon and a quick snapshot of your pantry at a glance
- **User accounts** — sign up, log in, and edit household preferences (household size, dietary preferences), backed by a real database
- **Waste tracking** — frequently wasted items are detected and surfaced to help reduce future waste

## Coming Soon

- Shopping list suggestions based on waste patterns
- Activity feed showing recent pantry actions
- Password verification and hashing for user accounts (currently stored but not yet verified)

## Tech Stack

- **Backend:** Python, SQLite
- **Frontend:** React (Vite), React Router
- **API:** A lightweight Python HTTP server bridging the frontend and backend database

## Getting Started

1. Start the backend: `python app.py` (runs on `localhost:5001`)
2. Start the frontend: `cd frontend && npm install && npm run dev` (runs on `localhost:5173`)
3. Open `http://localhost:5173` in your browser
