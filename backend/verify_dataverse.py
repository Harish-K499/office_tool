# verify_dataverse.py - Check if attendance records are being stored
import requests
from dataverse_helper import get_access_token
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv("id.env")
RESOURCE = os.getenv("RESOURCE")

ENTITY_NAME = "crc6f_table13s"
FIELD_EMPLOYEE_ID = "crc6f_employeeid"
FIELD_DATE = "crc6f_date"
FIELD_CHECKIN = "crc6f_checkin"
FIELD_CHECKOUT = "crc6f_checkout"
FIELD_DURATION = "crc6f_duration"
FIELD_ATTENDANCE_ID = "crc6f_table13id"


def fetch_today_attendance(employee_id=None):
    """Fetch all attendance records for today"""
    try:
        token = get_access_token()
        today = datetime.now().date().isoformat()
        
        headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/json",
            "OData-MaxVersion": "4.0",
            "OData-Version": "4.0"
        }
        
        # Build filter
        if employee_id:
            filter_query = f"?$filter={FIELD_DATE} eq '{today}' and {FIELD_EMPLOYEE_ID} eq '{employee_id}'"
        else:
            filter_query = f"?$filter={FIELD_DATE} eq '{today}'"
        
        url = f"{RESOURCE}/api/data/v9.2/{ENTITY_NAME}{filter_query}"
        
        print(f"\n{'='*80}")
        print(f"FETCHING ATTENDANCE RECORDS FROM DATAVERSE")
        print(f"{'='*80}")
        print(f"Date: {today}")
        if employee_id:
            print(f"Employee: {employee_id}")
        print(f"\nURL: {url}")
        print(f"{'='*80}\n")
        
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            records = response.json().get("value", [])
            
            if records:
                print(f"✅ FOUND {len(records)} RECORD(S)\n")
                
                for i, record in enumerate(records, 1):
                    print(f"{'─'*80}")
                    print(f"RECORD #{i}")
                    print(f"{'─'*80}")
                    print(f"  Record ID     : {record.get(FIELD_ATTENDANCE_ID)}")
                    print(f"  Employee ID   : {record.get(FIELD_EMPLOYEE_ID)}")
                    print(f"  Date          : {record.get(FIELD_DATE)}")
                    print(f"  Check-in      : {record.get(FIELD_CHECKIN) or 'Not set'}")
                    print(f"  Check-out     : {record.get(FIELD_CHECKOUT) or 'Not checked out yet'}")
                    print(f"  Duration      : {record.get(FIELD_DURATION) or 'N/A'}")
                    print(f"{'─'*80}\n")
                
                return records
            else:
                print(f"⚠️  NO RECORDS FOUND FOR TODAY")
                print(f"{'='*80}\n")
                return []
        else:
            print(f"❌ FAILED TO FETCH RECORDS")
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text}")
            print(f"{'='*80}\n")
            return None
            
    except Exception as e:
        print(f"\n❌ ERROR FETCHING RECORDS")
        print(f"Error: {str(e)}")
        print(f"{'='*80}\n")
        return None


def fetch_all_attendance(limit=10):
    """Fetch last N attendance records"""
    try:
        token = get_access_token()
        
        headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/json",
            "OData-MaxVersion": "4.0",
            "OData-Version": "4.0"
        }
        
        # Order by date descending, limit results
        url = f"{RESOURCE}/api/data/v9.2/{ENTITY_NAME}?$orderby={FIELD_DATE} desc&$top={limit}"
        
        print(f"\n{'='*80}")
        print(f"FETCHING LAST {limit} ATTENDANCE RECORDS")
        print(f"{'='*80}\n")
        
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            records = response.json().get("value", [])
            
            if records:
                print(f"✅ FOUND {len(records)} RECORD(S)\n")
                
                for i, record in enumerate(records, 1):
                    print(f"{'─'*80}")
                    print(f"RECORD #{i}")
                    print(f"{'─'*80}")
                    print(f"  Record ID     : {record.get(FIELD_ATTENDANCE_ID)}")
                    print(f"  Employee ID   : {record.get(FIELD_EMPLOYEE_ID)}")
                    print(f"  Date          : {record.get(FIELD_DATE)}")
                    print(f"  Check-in      : {record.get(FIELD_CHECKIN) or 'Not set'}")
                    print(f"  Check-out     : {record.get(FIELD_CHECKOUT) or 'Not checked out yet'}")
                    print(f"  Duration      : {record.get(FIELD_DURATION) or 'N/A'}")
                    print(f"{'─'*80}\n")
                
                return records
            else:
                print(f"⚠️  NO RECORDS FOUND")
                print(f"{'='*80}\n")
                return []
        else:
            print(f"❌ FAILED TO FETCH RECORDS")
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text}")
            print(f"{'='*80}\n")
            return None
            
    except Exception as e:
        print(f"\n❌ ERROR FETCHING RECORDS")
        print(f"Error: {str(e)}")
        print(f"{'='*80}\n")
        return None


if __name__ == "__main__":
    print("\n" + "🔍 " * 30)
    print("DATAVERSE ATTENDANCE VERIFICATION")
    print("🔍 " * 30 + "\n")
    
    # Option 1: Check today's records for specific employee
    print("Option 1: Check today's attendance for EMP001")
    fetch_today_attendance("EMP001")
    
    # Option 2: Check all today's records
    print("\nOption 2: Check all today's attendance")
    fetch_today_attendance()
    
    # Option 3: Check last 10 records
    print("\nOption 3: Check last 10 attendance records")
    fetch_all_attendance(10)