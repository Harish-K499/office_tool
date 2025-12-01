# leave_tracker_backend.py
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from datetime import datetime
import random
import string
import traceback
import os
from dataverse_helper import create_record
import requests
from dataverse_helper import get_access_token

app = Flask(__name__)
CORS(app)
app.config['DEBUG'] = True


# ------------------------------------------------------------
# Helper Functions
# ------------------------------------------------------------
def generate_leave_id():
    """Generate Leave ID in format: LVE-XXXXXXX (7-digit alphanumeric)"""
    random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=7))
    leave_id = f"LVE-{random_part}"
    print(f"   🔑 Generated Leave ID: {leave_id}")
    return leave_id


def format_employee_id(emp_number):
    """Format employee ID as EMP0001, EMP0002, etc."""
    emp_id = f"EMP{emp_number:04d}"
    print(f"   👤 Formatted Employee ID: {emp_id}")
    return emp_id


def calculate_leave_days(start_date, end_date):
    """Calculate number of days between start and end date"""
    start = datetime.strptime(start_date, "%Y-%m-%d")
    end = datetime.strptime(end_date, "%Y-%m-%d")
    days = (end - start).days + 1
    print(f"   📅 Calculated Leave Days: {days} (from {start_date} to {end_date})")
    return days


# ------------------------------------------------------------
# Flask Routes
# ------------------------------------------------------------
@app.route('/')
def index():
    print("📄 Serving index page (my_leave.html)")
    return render_template("my_leave.html")


@app.route('/apply_leave_page')
def apply_leave_page():
    print("📄 Serving apply leave page")
    return render_template("apply_leave.html")


@app.route('/apply_leave', methods=['POST'])
def apply_leave():
    print("\n" + "=" * 70)
    print("🚀 LEAVE APPLICATION REQUEST RECEIVED")
    print("=" * 70)

    try:
        print("\n📥 Step 1: Receiving request data...")

        # ✅ Ensure request is JSON
        if not request.is_json:
            print("   ❌ Request is not JSON!")
            print("   🔍 Request headers:", dict(request.headers))
            return jsonify({"error": "Request must be JSON"}), 400

        data = request.get_json()
        print(f"   ✅ Received JSON data:\n   {data}")

        # Extract fields
        leave_type = data.get("leave_type")
        start_date = data.get("start_date")
        end_date = data.get("end_date")
        applied_by_raw = data.get("applied_by")
        paid_unpaid = data.get("paid_unpaid", "Paid")
        status = data.get("status", "Pending")
        reason = data.get("reason", "")

        # Format employee ID
        if applied_by_raw:
            if applied_by_raw.isdigit():
                applied_by = format_employee_id(int(applied_by_raw))
            elif applied_by_raw.upper().startswith("EMP"):
                applied_by = applied_by_raw.upper()
            else:
                applied_by = "EMP0001"
        else:
            applied_by = "EMP0001"

        # Validate required fields
        missing_fields = [f for f in ["leave_type", "start_date", "end_date", "applied_by"]
                          if not data.get(f)]
        if missing_fields:
            return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400

        leave_id = generate_leave_id()
        leave_days = calculate_leave_days(start_date, end_date)
        applied_date = datetime.now().strftime("%Y-%m-%d")

        entity_name = "crc6f_table14s"
        record_data = {
            "crc6f_leaveid": leave_id,
            "crc6f_leavetype": leave_type,
            "crc6f_startdate": start_date,
            "crc6f_enddate": end_date,
            "crc6f_paidunpaid": paid_unpaid,
            "crc6f_status": status,
            "crc6f_totaldays": str(leave_days),
            "crc6f_employeeid": applied_by,
            "crc6f_approvedby": "",
        }

        print(f"📦 Dataverse Record Data: {record_data}")
        created_record = create_record(entity_name, record_data)
        print(f"✅ Record Created: {created_record}")

        response_data = {
            "message": f"Leave applied successfully for {applied_by}",
            "leave_id": leave_id,
            "leave_days": leave_days,
            "leave_details": created_record
        }

        print("✅ LEAVE APPLICATION SUCCESSFUL!\n")
        return jsonify(response_data), 200

    except Exception as e:
        print("\n❌ ERROR OCCURRED IN LEAVE APPLICATION")
        traceback.print_exc()
        return jsonify({
            "error": str(e),
            "traceback": traceback.format_exc()
        }), 500


@app.route('/api/leaves/<employee_id>', methods=['GET'])
def get_employee_leaves(employee_id):
    print(f"\n{'='*70}")
    print(f"🔍 FETCHING LEAVE HISTORY FOR EMPLOYEE: {employee_id}")
    print(f"{'='*70}")
    
    try:
        # Normalize employee ID format
        if employee_id.isdigit():
            employee_id = format_employee_id(int(employee_id))
        else:
            employee_id = employee_id.upper()
            
        print(f"   👤 Normalized Employee ID: {employee_id}")
        
        # Fetch leaves from Dataverse
        import requests
        from dataverse_helper import get_access_token
        
        token = get_access_token()
        entity_name = "crc6f_table14s"
        
        # Build OData query to filter by employee ID
        filter_query = f"$filter=crc6f_employeeid eq '{employee_id}'"
        select_query = "$select=crc6f_leaveid,crc6f_leavetype,crc6f_startdate,crc6f_enddate,crc6f_paidunpaid,crc6f_status,crc6f_totaldays,crc6f_employeeid,crc6f_approvedby"
        
        url = f"{os.getenv('RESOURCE')}/api/data/v9.2/{entity_name}?{filter_query}&{select_query}"
        
        headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/json",
            "OData-MaxVersion": "4.0",
            "OData-Version": "4.0"
        }
        
        print(f"   🌐 Sending request to Dataverse: {url}")
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            leaves = result.get('value', [])
            
            # Transform Dataverse field names to frontend expected format
            transformed_leaves = []
            for leave in leaves:
                transformed_leaves.append({
                    "leave_id": leave.get("crc6f_leaveid", ""),
                    "leave_type": leave.get("crc6f_leavetype", ""),
                    "start_date": leave.get("crc6f_startdate", ""),
                    "end_date": leave.get("crc6f_enddate", ""),
                    "paid_unpaid": leave.get("crc6f_paidunpaid", ""),
                    "status": leave.get("crc6f_status", "Pending"),
                    "total_days": leave.get("crc6f_totaldays", "0"),
                    "employee_id": leave.get("crc6f_employeeid", ""),
                    "approved_by": leave.get("crc6f_approvedby", "")
                })
            
            print(f"   ✅ Successfully fetched {len(transformed_leaves)} leave records")
            return jsonify({"success": True, "leaves": transformed_leaves}), 200
        else:
            error_msg = f"Error fetching leaves: {response.status_code} - {response.text}"
            print(f"   ❌ {error_msg}")
            return jsonify({"success": False, "error": error_msg}), 500
            
    except Exception as e:
        error_msg = f"Exception fetching leaves: {str(e)}"
        print(f"   ❌ {error_msg}")
        traceback.print_exc()
        return jsonify({"success": False, "error": error_msg}), 500
@app.route('/api/leave-balance/<employee_id>/<leave_type>', methods=['GET'])
def api_leave_balance(employee_id, leave_type):
    try:
        token = get_access_token()
        headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/json",
            "OData-MaxVersion": "4.0",
            "OData-Version": "4.0"
        }
        resource = os.getenv('RESOURCE')
        candidates = [
            "crc6f_hr_leavemangements",
            "crc6f_hr_leavemangement",
            "crc6f_leave_mangement",
            "crc6f_leave_mangements"
        ]
        emp = employee_id.upper().strip()
        if emp.isdigit():
            emp = f"EMP{int(emp):03d}"
        for entity in candidates:
            # try both FK field names
            for fk in ["crc6f_empid", "crc6f_employeeid"]:
                url = f"{resource}/api/data/v9.2/{entity}?$filter={fk} eq '{emp}'&$top=1"
                r = requests.get(url, headers=headers)
                if r.status_code == 200:
                    vals = r.json().get('value', [])
                    if vals:
                        row = vals[0]
                        lt = leave_type.lower()
                        if 'casual' in lt:
                            available = float(row.get('crc6f_cl', 0) or 0)
                        elif 'sick' in lt:
                            available = float(row.get('crc6f_sl', 0) or 0)
                        else:
                            available = float(row.get('crc6f_compoff', 0) or 0)
                        return jsonify({"success": True, "employee_id": emp, "leave_type": leave_type, "available": available})
        return jsonify({"success": True, "employee_id": emp, "leave_type": leave_type, "available": 0})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/test_connection', methods=['GET'])
def test_connection():
    try:
        test_record = {
            "crc6f_employeeid": format_employee_id(1),
            "crc6f_leavetype": "Test Leave",
            "crc6f_paidunpaid": "Paid",
            "crc6f_startdate": "2025-10-14",
            "crc6f_enddate": "2025-10-15",
            "crc6f_status": "Pending",
            "crc6f_totaldays": "2",
            "crc6f_leaveid": generate_leave_id(),
            "crc6f_approvedby": "System"
        }
        result = create_record("crc6f_table14s", test_record)
        return jsonify({"success": True, "dataverse_result": result}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == '__main__':
    print("\n🚀 Starting Flask Leave Tracker Backend on port 3001")
    app.run(debug=True, host='0.0.0.0', port=3001)
