# server.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from dataverse_helper import create_record, update_record
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# ✅ CORRECT FIELD NAMES from your Dataverse schema
ENTITY_NAME = "crc6f_table13s"
FIELD_EMPLOYEE_ID = "crc6f_employeeid"
FIELD_DATE = "crc6f_date"
FIELD_CHECKIN = "crc6f_checkin"
FIELD_CHECKOUT = "crc6f_checkout"
FIELD_DURATION = "crc6f_duration"
FIELD_ATTENDANCE_ID = "crc6f_table13id"

# Store active check-in sessions (in production, use Redis or database)
active_sessions = {}


@app.route('/api/checkin', methods=['POST'])
def checkin():
    try:
        data = request.json
        employee_id = data.get('employee_id')
        
        if not employee_id:
            return jsonify({"success": False, "error": "Employee ID is required"}), 400
        
        # Check if already checked in
        if employee_id in active_sessions:
            return jsonify({
                "success": False, 
                "error": "Already checked in. Please check out first."
            }), 400
        
        now = datetime.now()
        formatted_date = now.date().isoformat()
        formatted_time = now.strftime("%H:%M:%S")
        
        # ✅ Create record with CORRECT field names
        record_data = {
            FIELD_EMPLOYEE_ID: employee_id,
            FIELD_DATE: formatted_date,
            FIELD_CHECKIN: formatted_time
        }
        
        print(f"\n{'='*60}")
        print(f"CHECK-IN REQUEST")
        print(f"{'='*60}")
        print(f"Employee: {employee_id}")
        print(f"Date: {formatted_date}")
        print(f"Time: {formatted_time}")
        print(f"Sending to Dataverse...")
        
        created = create_record(ENTITY_NAME, record_data)
        
        # Extract record ID
        record_id = (created.get(FIELD_ATTENDANCE_ID) or 
                     created.get("id"))
        
        if record_id:
            # Save session
            active_sessions[employee_id] = {
                "record_id": record_id,
                "checkin_time": formatted_time,
                "checkin_datetime": now.isoformat()
            }
            
            print(f"✅ SUCCESS! Record ID: {record_id}")
            print(f"{'='*60}\n")
            
            return jsonify({
                "success": True,
                "record_id": record_id,
                "checkin_time": formatted_time
            })
        else:
            print(f"❌ FAILED: No record ID returned")
            print(f"{'='*60}\n")
            return jsonify({
                "success": False,
                "error": "Failed to create record"
            }), 500
            
    except Exception as e:
        print(f"\n❌ CHECK-IN ERROR: {str(e)}\n")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/checkout', methods=['POST'])
def checkout():
    try:
        data = request.json
        employee_id = data.get('employee_id')
        
        if not employee_id:
            return jsonify({"success": False, "error": "Employee ID is required"}), 400
        
        session = active_sessions.get(employee_id)
        
        if not session:
            return jsonify({
                "success": False,
                "error": "No active check-in found. Please check in first."
            }), 400
        
        now = datetime.now()
        checkout_time_str = now.strftime("%H:%M:%S")
        
        # Calculate duration
        checkin_dt = datetime.fromisoformat(session["checkin_datetime"])
        total_seconds = int((now - checkin_dt).total_seconds())

        hours = total_seconds // 3600
        minutes = (total_seconds % 3600) // 60
        seconds = total_seconds % 60

        # 📝 Formatted duration for display (e.g. "2h 15m 30s")
        formatted_duration = f"{hours}h {minutes}m {seconds}s"

        # For Dataverse: convert total hours to string
        total_hours = round(total_seconds / 3600)
        total_hours_str = str(total_hours)  # ✅ Fix for Dataverse

        update_data = {
            FIELD_CHECKOUT: checkout_time_str,
            FIELD_DURATION: total_hours_str   # ✅ send as string
        }

        print(f"\n{'='*60}")
        print(f"CHECK-OUT REQUEST")
        print(f"{'='*60}")
        print(f"Employee: {employee_id}")
        print(f"Record ID: {session['record_id']}")
        print(f"Check-out: {checkout_time_str}")
        print(f"Duration: {formatted_duration}")
        print(f"Updating Dataverse...")

        update_record(ENTITY_NAME, session["record_id"], update_data)
        
        # Remove session after successful checkout
        del active_sessions[employee_id]
        
        print(f"✅ CHECK-OUT SUCCESS!")
        print(f"{'='*60}\n")
        
        return jsonify({
            "success": True,
            "checkout_time": checkout_time_str,
            "duration": formatted_duration,
            "total_hours": total_hours
        })
        
    except Exception as e:
        print(f"\n❌ CHECK-OUT ERROR: {str(e)}\n")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500



@app.route('/api/status/<employee_id>', methods=['GET'])
def get_status(employee_id):
    """Check if employee is currently checked in"""
    if employee_id in active_sessions:
        session = active_sessions[employee_id]
        checkin_dt = datetime.fromisoformat(session["checkin_datetime"])
        elapsed = int((datetime.now() - checkin_dt).total_seconds())
        
        return jsonify({
            "checked_in": True,
            "checkin_time": session["checkin_time"],
            "elapsed_seconds": elapsed
        })
    else:
        return jsonify({
            "checked_in": False
        })


@app.route('/api/attendance/<employee_id>/<int:year>/<int:month>', methods=['GET'])
def get_monthly_attendance(employee_id, year, month):
    """Get attendance records for a specific month"""
    try:
        import requests
        from dataverse_helper import get_access_token
        import os
        from dotenv import load_dotenv
        
        load_dotenv("id.env")
        RESOURCE = os.getenv("RESOURCE")
        
        token = get_access_token()
        
        # Build date filter for the month
        from calendar import monthrange
        _, last_day = monthrange(year, month)
        
        start_date = f"{year}-{str(month).zfill(2)}-01"
        end_date = f"{year}-{str(month).zfill(2)}-{str(last_day).zfill(2)}"
        
        headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/json",
            "OData-MaxVersion": "4.0",
            "OData-Version": "4.0"
        }
        
        filter_query = (f"?$filter={FIELD_EMPLOYEE_ID} eq '{employee_id}' "
                       f"and {FIELD_DATE} ge '{start_date}' "
                       f"and {FIELD_DATE} le '{end_date}'")
        
        url = f"{RESOURCE}/api/data/v9.2/{ENTITY_NAME}{filter_query}"
        
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            records = response.json().get("value", [])
            
            # Format records for frontend
            formatted_records = []
            for record in records:
                formatted_records.append({
                    "date": record.get(FIELD_DATE),
                    "checkin": record.get(FIELD_CHECKIN),
                    "checkout": record.get(FIELD_CHECKOUT),
                    "duration": record.get(FIELD_DURATION)
                })
            
            return jsonify({
                "success": True,
                "records": formatted_records,
                "count": len(formatted_records)
            })
        else:
            return jsonify({
                "success": False,
                "error": f"Failed to fetch records: {response.status_code}"
            }), 500
            
    except Exception as e:
        print(f"Error fetching monthly attendance: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
        
@app.route('/ping', methods=['GET'])
def ping():
    return jsonify({"message": "Backend is connected ✅"}), 200


if __name__ == '__main__':
    print("\n" + "🚀 " * 30)
    print("ATTENDANCE SYSTEM SERVER STARTING...")
    print("🚀 " * 30 + "\n")
    print("Server running on: http://localhost:5000")
    print("Frontend should connect to: http://localhost:5000/api/checkin")
    print("\n" + "="*80 + "\n")
    
    app.run(debug=True, port=5000)