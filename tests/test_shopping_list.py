from shopping_list import add_to_shopping_list, get_shopping_list, remove_from_shopping_list

def test_add_and_get_item():
    add_to_shopping_list("Test Item")
    items = [i["item_name"] for i in get_shopping_list()]
    assert "Test Item" in items

def test_duplicate_add_does_not_error():
    result1 = add_to_shopping_list("Dup Item")
    result2 = add_to_shopping_list("Dup Item")
    assert result2["already_existed"] is True

def test_remove_item():
    add_to_shopping_list("Remove Me")
    removed = remove_from_shopping_list("Remove Me")
    assert removed is True
