"""
Test Cases for employee_database_class_yaml.py

Verifies the YAML Adapter is form, fit, and function identical
to the provided JSON and SQL Adapters.
"""
from employee_database_class_yaml import EmployeeDatabase
import os

TEST_FILE = "test_employee_records.yaml"

def setup():
    """Start each test with a clean file."""
    if os.path.exists(TEST_FILE):
        os.remove(TEST_FILE)
    return EmployeeDatabase(FILE_PATH=TEST_FILE)

def test_case_1_insert_and_get_single_employee():
    """TC1: Insert one employee, retrieve by name, verify exact output format."""
    db = setup()
    db.insert_employee("John", "Doe", "1980-01-15", "2020-06-10", "Software Engineer")
    result = db.get_employee("John", "Doe")
    expected = "ID: 1, Name: John Doe, Birthdate: 1980-01-15, Hire Date: 2020-06-10, Job Title: Software Engineer"
    print("TC1 Result:", result)
    assert result == expected, f"TC1 FAILED: expected '{expected}', got '{result}'"
    print("TC1 PASSED")

def test_case_2_insert_multiple_employees():
    """TC2: Insert multiple employees, verify get_all_employees returns all of them with correct auto-incremented IDs."""
    db = setup()
    db.insert_employee("John", "Doe", "1980-01-15", "2020-06-10", "Software Engineer")
    db.insert_employee("Jane", "Smith", "1990-03-22", "2021-01-05", "Product Manager")
    all_employees = db.get_all_employees()
    print("TC2 Result:", all_employees)
    assert len(all_employees) == 2, f"TC2 FAILED: expected 2 employees, got {len(all_employees)}"
    assert all_employees[0]["id"] == 1
    assert all_employees[1]["id"] == 2
    print("TC2 PASSED")

def test_case_3_employee_not_found():
    """TC3: Query a name that doesn't exist, verify None is returned."""
    db = setup()
    db.insert_employee("John", "Doe", "1980-01-15", "2020-06-10", "Software Engineer")
    result = db.get_employee("Nonexistent", "Person")
    print("TC3 Result:", result)
    assert result is None, f"TC3 FAILED: expected None, got '{result}'"
    print("TC3 PASSED")

def test_case_4_file_created_and_persists():
    """TC4: Verify the YAML file is actually created and data persists across a new instance."""
    db = setup()
    db.insert_employee("John", "Doe", "1980-01-15", "2020-06-10", "Software Engineer")
    assert os.path.exists(TEST_FILE), "TC4 FAILED: YAML file was not created"
    db2 = EmployeeDatabase(FILE_PATH=TEST_FILE)
    result = db2.get_employee("John", "Doe")
    assert result is not None, "TC4 FAILED: data did not persist across new instance"
    print("TC4 PASSED")

if __name__ == "__main__":
    test_case_1_insert_and_get_single_employee()
    test_case_2_insert_multiple_employees()
    test_case_3_employee_not_found()
    test_case_4_file_created_and_persists()
    print("\nAll test cases passed.")