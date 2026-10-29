import urllib.request
import json

def post(path, data):
    url = f"http://localhost:5001{path}"
    body = json.dumps(data).encode()
    req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urllib.request.urlopen(req) as response:
            print(f"{path} -> {response.status}")
            print(response.read().decode())
    except urllib.error.HTTPError as e:
        print(f"{path} -> {e.code}")
        print(e.read().decode())

print("Testing signup...")
post("/api/signup", {
    "name": "Test User",
    "email": "test@example.com",
    "password": "abc123",
    "household": 2,
    "diet": "Vegan"
})

print("\nTesting login...")
post("/api/login", {
    "email": "test@example.com",
    "password": "abc123"
})