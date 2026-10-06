# PantryPlus Coding Conventions

Team 7 agrees to follow these rules for all PantryPlus code.

## Naming

- Files, functions, and variables use `snake_case` (`pantry_filter.py`, `filter_items()`, `expiration_date`)
- Classes use `PascalCase` (`PantryItem`)
- Constants use `UPPER_CASE` (`VALID_STATUSES`)
- Functions start with a verb (`get_all_items()`, `mark_item_used()`)
- Names should be clear: no unclear abbreviations like `qty` or `exp`
- Booleans read like yes/no questions (`is_expired`, `has_barcode`)
- Status values are always `"active"`, `"used"`, or `"thrown_out"`

## Style

- Follow PEP 8 and indent with 4 spaces
- Every file and function has a docstring explaining what it does
- Comments explain _why_, not _what_
- All SQL goes in `db/pantry_db.py` and uses `?` placeholders

## Testing

- Use `unittest`, with tests in `tests/test_<module>.py`
- Test normal cases and edge cases (empty pantry, missing values, bad input)
- Run `python -m unittest discover tests` before every commit

## Git and Jira

- Don't push code with failing tests
- Docs go in `/docs` as `.md` files
- Every worklog includes a commit or PR link

## Team Agreement

| Team Member         | Agreed | Signed              |
| ------------------- | ------ | ------------------- |
| Samantha Schneider  | yes    | Samantha Schneider  |
| Ti'onna Hunter      | yes    | Ti'onna Hunter      |
| Chanelee Florentino | yes    | Chanelee Florentino |
