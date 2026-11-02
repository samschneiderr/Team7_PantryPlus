from db.pantry_db import get_all_items, delete_item

for item in get_all_items():
    if item.category == "Test":
        print(f"Deleting: {item.name}")
        delete_item(item.id)

print("Done.")
