"""
Test script to verify timesheet flow end-to-end
Run this to test if data is being saved and retrieved correctly
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:5000/api"

def test_timesheet_flow():
    print("=" * 80)
    print("TIMESHEET FLOW TEST")
    print("=" * 80)
    
    # Test data
    employee_id = "Emp01"
    project_id = "VTAB004"
    task_id = "TASK003"
    task_name = "Test Task"
    seconds = 20
    work_date = datetime.now().strftime("%Y-%m-%d")
    
    print(f"\n1. Testing POST /time-tracker/task-log")
    print(f"   Employee: {employee_id}")
    print(f"   Task: {task_id}")
    print(f"   Seconds: {seconds}")
    print(f"   Date: {work_date}")
    
    # Test POST
    post_data = {
        "employee_id": employee_id,
        "project_id": project_id,
        "task_guid": "test-guid-123",
        "task_id": task_id,
        "task_name": task_name,
        "seconds": seconds,
        "work_date": work_date,
        "description": "Test entry"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/time-tracker/task-log",
            json=post_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"\n   Response Status: {response.status_code}")
        
        if response.status_code == 201:
            data = response.json()
            print(f"   [OK] Success!")
            print(f"   Dataverse Saved: {data.get('dataverse_saved', False)}")
            print(f"   Log ID: {data.get('log', {}).get('id')}")
        else:
            print(f"   [FAIL] Failed!")
            print(f"   Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"   [ERROR] Exception: {e}")
        return False
    
    # Test GET
    print(f"\n2. Testing GET /time-tracker/logs")
    print(f"   Employee: {employee_id}")
    print(f"   Date: {work_date}")
    
    try:
        response = requests.get(
            f"{BASE_URL}/time-tracker/logs",
            params={
                "employee_id": employee_id,
                "start_date": work_date,
                "end_date": work_date
            }
        )
        
        print(f"\n   Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            logs = data.get('logs', [])
            source = data.get('source', 'unknown')
            
            print(f"   [OK] Success!")
            print(f"   Source: {source}")
            print(f"   Logs Found: {len(logs)}")
            
            if logs:
                print(f"\n   Latest Log:")
                latest = logs[-1]
                print(f"   - Employee: {latest.get('employee_id')}")
                print(f"   - Task: {latest.get('task_id')}")
                print(f"   - Seconds: {latest.get('seconds')}")
                print(f"   - Work Date: {latest.get('work_date')}")
                print(f"   - Created: {latest.get('created_at')}")
                
                # Verify data matches
                if (latest.get('employee_id') == employee_id and
                    latest.get('task_id') == task_id and
                    latest.get('seconds') == seconds and
                    latest.get('work_date') == work_date):
                    print(f"\n   [OK] Data matches! Timesheet should display correctly.")
                    return True
                else:
                    print(f"\n   [WARN] Data mismatch!")
                    return False
            else:
                print(f"\n   [FAIL] No logs found!")
                return False
        else:
            print(f"   [FAIL] Failed!")
            print(f"   Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"   [ERROR] Exception: {e}")
        return False

def check_local_storage():
    print(f"\n3. Checking Local Storage File")
    
    try:
        with open("_data/timesheet_logs.json", "r") as f:
            logs = json.load(f)
            print(f"   [OK] File exists")
            print(f"   Total logs: {len(logs)}")
            
            if logs:
                print(f"\n   Latest 3 logs:")
                for log in logs[-3:]:
                    print(f"   - {log.get('task_id')} | {log.get('seconds')}s | {log.get('work_date')}")
            return True
    except FileNotFoundError:
        print(f"   [FAIL] File not found: _data/timesheet_logs.json")
        return False
    except Exception as e:
        print(f"   [ERROR] Error: {e}")
        return False

def main():
    print("\nWARNING: Make sure the backend server is running on port 5000!")
    print("   Run: python unified_server.py\n")
    
    input("Press Enter to start test...")
    
    # Run tests
    test_passed = test_timesheet_flow()
    storage_ok = check_local_storage()
    
    print("\n" + "=" * 80)
    print("TEST RESULTS")
    print("=" * 80)
    
    if test_passed and storage_ok:
        print("[PASS] All tests passed!")
        print("\nNext steps:")
        print("1. Hard refresh frontend (Ctrl+F5)")
        print("2. Go to My Tasks")
        print("3. Start and stop a timer")
        print("4. Check My Timesheet - it should show the entry")
    else:
        print("[FAIL] Some tests failed!")
        print("\nCheck:")
        print("1. Backend server is running")
        print("2. Backend console for error messages")
        print("3. _data/timesheet_logs.json file exists and is writable")
    
    print("=" * 80)

if __name__ == "__main__":
    main()
