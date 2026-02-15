import requests
import json

BASE_URL = "http://localhost:8000"

def test_backend_validation():
    print("Testing Backend Validation...")
    
    # 1. Test Valid Data
    valid_data = {
        "Age": 45, "Gender": "Male", "Symptoms": "Fever",
        "Blood_Pressure": 120, "Heart_Rate": 80, "Temperature": 37.0,
        "O2_Saturation": 98, "Pain_Severity": 2, "Consciousness": "Alert",
        "Pre_Existing_Conditions": "None"
    }
    try:
        res = requests.post(f"{BASE_URL}/predict", json=valid_data)
        if res.status_code == 200:
            print("✅ Valid Data Passed")
        else:
            print(f"❌ Valid Data Failed: {res.status_code} {res.text}")
    except Exception as e:
        print(f"❌ Connection Error: {e}")

    # 2. Test Invalid Age (Negative)
    invalid_age = valid_data.copy()
    invalid_age["Age"] = -5
    res = requests.post(f"{BASE_URL}/predict", json=invalid_age)
    if res.status_code == 422:
        print("✅ Invalid Age Rejected (422)")
    else:
        print(f"❌ Invalid Age NOT Rejected: {res.status_code}")

    # 3. Test Invalid BP (Too Low)
    invalid_bp = valid_data.copy()
    invalid_bp["Blood_Pressure"] = 10
    res = requests.post(f"{BASE_URL}/predict", json=invalid_bp)
    if res.status_code == 422:
        print("✅ Invalid BP Rejected (422)")
    else:
        print(f"❌ Invalid BP NOT Rejected: {res.status_code}")

    # 4. Test Invalid O2 (Too High)
    invalid_o2 = valid_data.copy()
    invalid_o2["O2_Saturation"] = 150
    res = requests.post(f"{BASE_URL}/predict", json=invalid_o2)
    if res.status_code == 422:
        print("✅ Invalid O2 Rejected (422)")
    else:
        print(f"❌ Invalid O2 NOT Rejected: {res.status_code}")

if __name__ == "__main__":
    test_backend_validation()
