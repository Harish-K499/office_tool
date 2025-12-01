import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from dataverse_helper import get_access_token

# -------------------- Load Environment --------------------
load_dotenv("id.env")

# -------------------- Flask App --------------------
app = Flask(__name__)
CORS(app)

# -------------------- Dataverse Configuration --------------------
RESOURCE = os.getenv("RESOURCE")
API_BASE = f"{RESOURCE}/api/data/v9.2"
ENTITY_NAME = "crc6f_hr_assetdetailses"  # logical table name

# -------------------- CRUD Functions --------------------
def get_all_assets():
    token = get_access_token()
    url = f"{API_BASE}/{ENTITY_NAME}"
    headers = {"Authorization": f"Bearer {token}", "Accept": "application/json"}
    res = requests.get(url, headers=headers)
    if res.status_code == 200:
        return res.json().get("value", [])
    raise Exception(f"Error fetching assets: {res.status_code} - {res.text}")

def get_asset_by_empid(emp_id):
    token = get_access_token()
    url = f"{API_BASE}/{ENTITY_NAME}?$filter=crc6f_employeeid eq '{emp_id}'"
    headers = {"Authorization": f"Bearer {token}", "Accept": "application/json"}
    res = requests.get(url, headers=headers)
    if res.status_code == 200:
        data = res.json().get("value", [])
        return data[0] if data else None
    raise Exception(f"Error fetching asset by emp id: {res.status_code} - {res.text}")

def get_asset_by_assetid(asset_id):
    token = get_access_token()
    # Query by the UI-generated asset id field crc6f_assetid
    url = f"{API_BASE}/{ENTITY_NAME}?$filter=crc6f_assetid eq '{asset_id}'"
    headers = {"Authorization": f"Bearer {token}", "Accept": "application/json"}
    res = requests.get(url, headers=headers)
    if res.status_code == 200:
        data = res.json().get("value", [])
        return data[0] if data else None
    raise Exception(f"Error fetching asset by asset id: {res.status_code} - {res.text}")

def create_asset(data):
    # Basic validation server-side
    assigned_to = data.get("crc6f_assignedto", "").strip()
    emp_id = data.get("crc6f_employeeid", "").strip()
    asset_id = data.get("crc6f_assetid", "").strip()

    if not assigned_to or not emp_id:
        return {"error": "Assigned To (crc6f_assignedto) and Employee ID (crc6f_employeeid) are required."}, 400

    if not asset_id:
        return {"error": "Asset ID (crc6f_assetid) is required."}, 400

    # check duplicate asset id
    existing = get_asset_by_assetid(asset_id)
    if existing:
        return {"error": f"Asset with id {asset_id} already exists."}, 409

    token = get_access_token()
    url = f"{API_BASE}/{ENTITY_NAME}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    res = requests.post(url, headers=headers, json=data)
    if res.status_code in (200, 201):
        return res.json()
    raise Exception(f"Error creating asset: {res.status_code} - {res.text}")

def update_asset_by_assetid(asset_id, data):
    # FIXED: use the record GUID from Dataverse query and PATCH the correct record URL
    asset = get_asset_by_assetid(asset_id)
    if not asset:
        raise Exception("Asset not found for update.")
    # crc6f_hr_assetdetailsid should be the record GUID field - use it directly
    record_id = asset.get("crc6f_hr_assetdetailsid")
    if not record_id:
        raise Exception("Record id missing from Dataverse response; cannot update.")
    token = get_access_token()
    url = f"{API_BASE}/{ENTITY_NAME}({record_id})"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "If-Match": "*"
    }
    res = requests.patch(url, headers=headers, json=data)
    # Dataverse returns 204 (No Content) for successful patch
    if res.status_code in (204, 1223):
        return {"message": "Asset updated successfully"}
    # Some environments may return other statuses; include text for debugging
    raise Exception(f"Error updating asset: {res.status_code} - {res.text}")

def delete_asset_by_assetid(asset_id):
    # FIXED: use the record GUID from Dataverse query and DELETE the correct record URL
    asset = get_asset_by_assetid(asset_id)
    if not asset:
        raise Exception("Asset not found for deletion.")
    record_id = asset.get("crc6f_hr_assetdetailsid")
    if not record_id:
        raise Exception("Record id missing from Dataverse response; cannot delete.")
    token = get_access_token()
    url = f"{API_BASE}/{ENTITY_NAME}({record_id})"
    headers = {"Authorization": f"Bearer {token}", "If-Match": "*"}
    res = requests.delete(url, headers=headers)
    if res.status_code == 204:
        return {"message": "Asset deleted successfully"}
    raise Exception(f"Error deleting asset: {res.status_code} - {res.text}")

# -------------------- Flask Routes --------------------
@app.route("/assets", methods=["GET"])
def fetch_assets():
    try:
        data = get_all_assets()
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/assets", methods=["POST"])
def add_asset():
    try:
        data = request.json
        result = create_asset(data)
        # create_asset might return (dict, status) tuple for validation errors
        if isinstance(result, tuple):
            return jsonify(result[0]), result[1]
        return jsonify(result), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Update by asset id (crc6f_assetid)
@app.route("/assets/update/<asset_id>", methods=["PATCH"])
def edit_asset(asset_id):
    try:
        data = request.json
        result = update_asset_by_assetid(asset_id, data)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Delete by asset id
@app.route("/assets/delete/<asset_id>", methods=["DELETE"])
def remove_asset(asset_id):
    try:
        result = delete_asset_by_assetid(asset_id)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# -------------------- Run --------------------
if __name__ == "__main__":
    app.run(debug=True, port=5000)