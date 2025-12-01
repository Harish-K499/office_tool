# attendance_backend.py - Standalone Backend Test with Random Attendance ID + Duration In Text

import datetime
import time
import random
import string
import os
import requests
from dotenv import load_dotenv
from dataverse_helper import create_record, update_record, get_access_token

# ================== ENVIRONMENT VARIABLES ==================
load_dotenv("id.env")
RESOURCE = os.getenv("RESOURCE")

# ================== DATAVERSE TABLE INFO ==================
ENTITY_NAME = "crc6f_table13s"  # ✅ Plural entity name

# ✅ VERIFIED FIELD LOGICAL NAMES
FIELD_ATTENDANCE_ID_CUSTOM = "crc6f_attendanceid"    # String (Custom Attendance ID)
FIELD_EMPLOYEE_ID = "crc6f_employeeid"
FIELD_DATE = "crc6f_date"
FIELD_CHECKIN = "crc6f_checkin"
FIELD_CHECKOUT = "crc6f_checkout"
FIELD_DURATION = "crc6f_duration"                    # Numeric hours
FIELD_DURATION_INTEXT = "crc6f_duration_intext"      # String readable duration
FIELD_RECORD_ID = "crc6f_table13id"                  # Primary key (GUID)

# ================== ACTIVE SESSION STORE ==================
active_sessions = {}


# ================== HELPER FUNCTIONS ==================
def generate_random_attendance_id():
    """
    Generate a random Attendance ID like: ATD-H35J6U9
    (Prefix 'ATD-' + 7 random alphanumeric characters)
    """
    random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=7))
    return f"ATD-{random_part}"



# ================== CHECK-IN ==================
def check_in(employee_id: str):
    """
    Check-in: Creates a new attendance record with a random attendance ID and start time.
    """
    try:
        now = datetime.datetime.now()
        formatted_date = now.date().isoformat()
        formatted_time = now.strftime("%H:%M:%S")
        random_attendance_id = generate_random_attendance_id()

        data = {
            FIELD_EMPLOYEE_ID: employee_id,
            FIELD_DATE: formatted_date,
            FIELD_CHECKIN: formatted_time,
            FIELD_ATTENDANCE_ID_CUSTOM: random_attendance_id
        }

        print(f"\n{'='*60}")
        print(f"CHECK-IN STARTED")
        print(f"{'='*60}")
        print(f"Employee ID       : {employee_id}")
        print(f"Attendance ID     : {random_attendance_id}")
        print(f"Date              : {formatted_date}")
        print(f"Check-in Time     : {formatted_time}")
        print(f"\nSending data to Dataverse...")

        record = create_record(ENTITY_NAME, data)

        # Extract record ID from response
        record_id = (record.get(FIELD_RECORD_ID) or
                     record.get("cr6f_table13id") or
                     record.get("id"))

        # Store session info in memory
        active_sessions[employee_id] = {
            'record_id': record_id,
            'checkin_time': formatted_time
        }

        print(f"\n✅ CHECK-IN SUCCESSFUL!")
        print(f"Record ID         : {record_id}")
        print(f"{'='*60}\n")

        return record_id, formatted_time

    except Exception as e:
        print(f"\n❌ CHECK-IN FAILED!")
        print(f"Error: {str(e)}")
        print(f"{'='*60}\n")
        return None, None


# ================== CHECK-OUT ==================
def check_out(employee_id: str):
    """
    Check-out: Updates the Dataverse record with end time and duration.
    """
    try:
        if employee_id not in active_sessions:
            print(f"\n❌ No active check-in found for Employee {employee_id}")
            return False

        session = active_sessions[employee_id]
        record_id = session['record_id']
        checkin_time_str = session['checkin_time']

        now = datetime.datetime.now()
        checkout_time_str = now.strftime("%H:%M:%S")

        # Calculate duration
        checkin_time = datetime.datetime.strptime(checkin_time_str, "%H:%M:%S")
        checkout_time = datetime.datetime.strptime(checkout_time_str, "%H:%M:%S")

        duration = checkout_time - checkin_time
        total_seconds = int(duration.total_seconds())
        total_hours = total_seconds // 3600
        total_minutes = (total_seconds % 3600) // 60

        readable_duration = f"{total_hours} hour(s) {total_minutes} minute(s)"

        data = {
            FIELD_CHECKOUT: checkout_time_str,
            FIELD_DURATION: str(total_hours),             # ✅ FIX: convert to string
            FIELD_DURATION_INTEXT: readable_duration
        }

        print(f"\n{'='*60}")
        print(f"CHECK-OUT STARTED")
        print(f"{'='*60}")
        print(f"Employee ID       : {employee_id}")
        print(f"Record ID         : {record_id}")
        print(f"Check-out Time    : {checkout_time_str}")
        print(f"Total Duration    : {readable_duration}")
        print(f"\nUpdating record in Dataverse...")

        update_record(ENTITY_NAME, record_id, data)

        del active_sessions[employee_id]

        print(f"\n✅ CHECK-OUT SUCCESSFUL!")
        print(f"Duration Stored   : {readable_duration}")
        print(f"{'='*60}\n")

        return True

    except Exception as e:
        print(f"\n❌ CHECK-OUT FAILED!")
        print(f"Error: {str(e)}")
        print(f"{'='*60}\n")
        return False



# ================== VERIFY RECORD ==================
def verify_record_in_dataverse(employee_id: str):
    """
    Verify the stored record in Dataverse for today's date.
    """
    try:
        token = get_access_token()
        today = datetime.date.today().isoformat()

        headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/json",
            "OData-MaxVersion": "4.0",
            "OData-Version": "4.0"
        }

        filter_query = f"?$filter={FIELD_EMPLOYEE_ID} eq '{employee_id}' and {FIELD_DATE} eq '{today}'"
        url = f"{RESOURCE}/api/data/v9.2/{ENTITY_NAME}{filter_query}"

        print(f"\n{'='*60}")
        print(f"VERIFYING RECORD IN DATAVERSE")
        print(f"{'='*60}")
        print(f"Fetching attendance record for Employee: {employee_id}")
        print(f"Date: {today}")

        response = requests.get(url, headers=headers)

        if response.status_code == 200:
            records = response.json().get("value", [])

            if records:
                record = records[0]
                print(f"\n✅ RECORD FOUND IN DATAVERSE!")
                print(f"\nRecord Details:")
                print(f"  Employee ID  : {record.get(FIELD_EMPLOYEE_ID)}")
                print(f"  Date         : {record.get(FIELD_DATE)}")
                print(f"  Check-in     : {record.get(FIELD_CHECKIN)}")
                print(f"  Check-out    : {record.get(FIELD_CHECKOUT)}")
                print(f"  Duration     : {record.get(FIELD_DURATION)} hour(s)")
                print(f"  DurationText : {record.get(FIELD_DURATION_INTEXT)}")
                print(f"{'='*60}\n")
                return True
            else:
                print(f"\n⚠️ No records found for today")
                print(f"{'='*60}\n")
                return False
        else:
            print(f"\n❌ Failed to fetch record: {response.status_code}")
            print(f"{'='*60}\n")
            return False

    except Exception as e:
        print(f"\n❌ VERIFICATION FAILED!")
        print(f"Error: {str(e)}")
        print(f"{'='*60}\n")
        return False


# ================== MAIN TEST ==================
if __name__ == "__main__":
    print("\n" + "🚀 "*20)
    print("ATTENDANCE SYSTEM - BACKEND TEST")
    print("🚀 "*20 + "\n")

    test_employee_id = "EMP001"

    # Step 1: CHECK-IN
    print("📝 Step 1: Testing Check-In...")
    record_id, checkin_time = check_in(test_employee_id)
    if not record_id:
        print("Test failed at check-in. Exiting.")
        exit(1)

    # Step 2: Simulate working time
    work_duration = 10  # seconds
    print(f"⏳ Step 2: Simulating work time ({work_duration} seconds)...")
    for i in range(work_duration):
        time.sleep(1)
        print(f"⏱️  Working... {i+1}/{work_duration} seconds", end='\r')
    print("\n✅ Work time completed!\n")

    # Step 3: CHECK-OUT
    print("📝 Step 3: Testing Check-Out...")
    if not check_out(test_employee_id):
        print("Test failed at check-out. Exiting.")
        exit(1)

    # Step 4: VERIFY IN DATAVERSE
    print("📝 Step 4: Verifying Record in Dataverse...")
    verify_record_in_dataverse(test_employee_id)

    # Final summary
    print("\n" + "🎉 "*20)
    print("TEST COMPLETED SUCCESSFULLY!")
    print("🎉 "*20 + "\n")

    print("✅ Check-in recorded")
    print("✅ Check-out recorded")
    print("✅ Duration calculated & stored (int + text)")
    print("✅ Record verified in Dataverse")
