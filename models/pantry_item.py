from dataclasses import dataclass
from datetime import date

@dataclass
class PantryItem:
    id: int
    name: str
    quantity: float
    unit: str
    expiration_date: date
    category: str
    barcode: str = None
