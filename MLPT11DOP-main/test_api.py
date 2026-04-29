import urllib.request
import json

url = "http://127.0.0.1:8000/predict/measles"
data = {
    "cases_lag1": 10,
    "cases_lag2": 60,
    "cases_lag4": 80,
    "rolling_avg_4": 20.0,
    "rolling_avg_12": 20.0,
    "month": 4,
    "year": 2024,
    "quarter": 2,
    "growth_rate": 20.0
}

req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req) as response:
        print(f"Status Code: {response.getcode()}")
        print(f"Response Body: {response.read().decode('utf-8')}")
except urllib.error.HTTPError as e:
    print(f"HTTPError: {e.code}")
    print(f"Error Body: {e.read().decode('utf-8')}")
except Exception as e:
    print(f"Error: {e}")
