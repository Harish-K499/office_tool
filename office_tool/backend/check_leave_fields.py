#!/usr/bin/env python3
"""
Check the actual field names in crc6f_hr_leavemangements table
"""
import requests
import os
from dotenv import load_dotenv
from dataverse_helper import get_access_token

load_dotenv("id.env")
RESOURCE = os.getenv("RESOURCE")

def check_leave_table_fields():
    """Fetch a sample record to see actual field names"""
    
    token = get_access_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0"
    }
    
    # Try to get one record
    url = f"{RESOURCE}/api/data/v9.2/crc6f_hr_leavemangements?$top=1"
    
    print("="*80)
    print("🔍 CHECKING LEAVE MANAGEMENT TABLE FIELDS")
    print("="*80)
    print(f"📡 URL: {url}")
    print()
    
    response = requests.get(url, headers=headers)
    
    print(f"📊 Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        records = data.get("value", [])
        
        if records:
            print(f"✅ Found {len(records)} record(s)")
            print()
            print("📋 AVAILABLE FIELDS:")
            print("-" * 80)
            
            record = records[0]
            for key, value in sorted(record.items()):
                print(f"  {key:40} = {value}")
            
            print("-" * 80)
        else:
            print("⚠️ No records found in table")
            print("   Table exists but is empty")
    else:
        print(f"❌ Error: {response.status_code}")
        print(f"Response: {response.text}")
    
    print()

if __name__ == "__main__":
    check_leave_table_fields()
