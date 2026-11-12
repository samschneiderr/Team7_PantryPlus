# PantryPlus

PantryPlus tracks what’s in your pantry, so nothing quietly expires. Add items by scanning a real barcode (auto-filled from a database of millions of products) or typing them in by hand. See what’s expiring soon on Home, browse and manage everything on Inventory, get flagged when something’s low and add it to your Shopping List in one tap, and look back through an Activity feed of everything you’ve done. Each account has its own private, isolated pantry data. Built with Python, SQLite, and React, with a real camera scanner connected to the Open Food Facts database.

## What You Can Do

📷 **Scan a barcode** — point your camera at a real product and it gets added automatically, no typing needed

✏️ **Add items by hand** — or type in anything you want to track, with the name, quantity, category, and expiration date

🏠 **See your pantry at a glance** — the Home screen shows what's expiring soon and a quick snapshot of everything you have

📋 **View your full inventory** — see everything you own, search by name, and mark things as used or thrown out

🔔 **Get low-stock alerts** — set a minimum amount for any item, and it gets flagged when you're running low

🛒 **Keep a shopping list** — check items off as you buy them, and get automatic suggestions based on what you tend to waste

📜 **See your activity history** — every scan, add, and update you've made, in one simple feed

👤 **Your own account** — sign up, log in, and your pantry is yours alone, nobody else can see or change it

## Still Being Built

- Sorting and filtering options on the Inventory page
- A "forgot password" option for logging in
- Making logins more secure behind the scenes

## How It's Built

- **Backend:** Python + SQLite (a simple, lightweight database)
- **Frontend:** React, built with Vite
- **Real barcode data:** pulled from Open Food Facts, a free, public database of real products