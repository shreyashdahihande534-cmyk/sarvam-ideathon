import os
import json
from rules import evaluate_scheme_eligibility

def test_all_personas():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(base_dir, "..", "data", "test_personas.json")
    with open(data_path, "r", encoding="utf-8") as f:
        personas = json.load(f)

    all_passed = True
    print(f"Running validation on {len(personas)} personas...\n")

    for p in personas:
        p_id = p["id"]
        name = p["name"]
        print(f"Checking {p_id} ({name}):")
        for scheme_id, expected_status in p["expected"].items():
            result = evaluate_scheme_eligibility(p, scheme_id)
            actual_status = result["status"]
            if actual_status == expected_status:
                print(f"  [PASS] {scheme_id}: {actual_status}")
            else:
                print(f"  [FAIL] {scheme_id}: expected '{expected_status}', got '{actual_status}'")
                all_passed = False

    if all_passed:
        print("\nAll 8 personas matched 100% expected eligibility outcomes!")
    else:
        print("\nSome tests failed.")

if __name__ == "__main__":
    test_all_personas()
