# project_columns.py
from flask import Blueprint, request, jsonify, current_app
import requests, os, re, urllib.parse
from dotenv import load_dotenv
from dataverse_helper import get_access_token

bp = Blueprint("project_columns", __name__, url_prefix="/api")

load_dotenv()

# ======================
# Dataverse Config
# ======================
DATAVERSE_BASE = os.getenv("RESOURCE")
DATAVERSE_API = os.getenv("DATAVERSE_API", "/api/data/v9.2")
ENTITY_SET_COLUMNS = "crc6f_hr_boardcolumns"  # Table for board columns

# Field names
F_COLUMN_ID = "crc6f_columnid"
F_COLUMN_NAME = "crc6f_columnname"
F_COLUMN_COLOR = "crc6f_columncolor"
F_PROJECT_ID = "crc6f_projectid"
F_BOARD_ID = "crc6f_boardid"
F_SORT_ORDER = "crc6f_sortorder"
F_GUID = "crc6f_hr_boardcolumnsid"

def dv_url(path):
    return f"{DATAVERSE_BASE}{DATAVERSE_API}{path}"

def headers():
    token = get_access_token()
    return {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
        "OData-Version": "4.0",
        "Content-Type": "application/json"
    }

# Auto Generate Column ID (COL001...)
def generate_column_id():
    try:
        token = get_access_token()
        hdr = {"Authorization": f"Bearer {token}", "Accept": "application/json"}
        url = f"{DATAVERSE_BASE}{DATAVERSE_API}/{ENTITY_SET_COLUMNS}?$select={F_COLUMN_ID}&$orderby=createdon desc&$top=1"
        res = requests.get(url, headers=hdr, timeout=20)

        last_id = None
        if res.ok:
            vals = res.json().get("value", [])
            if vals and vals[0].get(F_COLUMN_ID):
                last_id = vals[0][F_COLUMN_ID]

        if last_id and re.match(r"COL\d+", last_id):
            num = int(last_id[3:])
        else:
            num = 0

        return f"COL{num+1:03d}"

    except:
        return "COL001"

# ============================================================
# 1️⃣ GET ALL COLUMNS FOR A PROJECT
# ============================================================
@bp.route("/projects/<project_code>/columns", methods=["GET"])
def get_columns(project_code):
    """Fetch all columns for a given project."""
    try:
        token = get_access_token()
        hdr = {"Authorization": f"Bearer {token}", "Accept": "application/json"}

        # Get board_id from query params if provided
        board_id = request.args.get("board_id", "")
        
        # Build filter
        filter_expr = f"{F_PROJECT_ID} eq '{project_code}'"
        if board_id:
            filter_expr += f" and {F_BOARD_ID} eq '{board_id}'"

        url = (
            f"{DATAVERSE_BASE}{DATAVERSE_API}/{ENTITY_SET_COLUMNS}"
            f"?$filter={filter_expr}"
            f"&$select={F_GUID},{F_COLUMN_ID},{F_COLUMN_NAME},{F_COLUMN_COLOR},{F_PROJECT_ID},{F_BOARD_ID},{F_SORT_ORDER}"
            f"&$orderby={F_SORT_ORDER}"
        )
        res = requests.get(url, headers=hdr, timeout=20)
        if not res.ok:
            return jsonify({"success": False, "error": res.text}), 500

        columns = []
        for r in res.json().get("value", []):
            columns.append({
                "guid": r.get(F_GUID),
                "column_id": r.get(F_COLUMN_ID),
                "column_name": r.get(F_COLUMN_NAME),
                "column_color": r.get(F_COLUMN_COLOR, "#e5e7eb"),
                "project_id": r.get(F_PROJECT_ID),
                "board_id": r.get(F_BOARD_ID),
                "sort_order": r.get(F_SORT_ORDER, 0)
            })

        return jsonify({"success": True, "columns": columns}), 200

    except Exception as e:
        current_app.logger.exception("Error fetching columns")
        return jsonify({"success": False, "error": str(e)}), 500

# ============================================================
# 2️⃣ ADD COLUMN
# ============================================================
@bp.route("/projects/<project_code>/columns", methods=["POST"])
def add_column(project_code):
    """Add a new column for a project."""
    try:
        body = request.get_json(force=True) or {}
        current_app.logger.info(f"Add column for {project_code}: {body}")

        token = get_access_token()
        hdr = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/json",
            "Content-Type": "application/json"
        }

        # Generate new column id
        column_id = generate_column_id()

        # Get next sort order
        sort_order = 0
        try:
            existing_url = f"{DATAVERSE_BASE}{DATAVERSE_API}/{ENTITY_SET_COLUMNS}?$select={F_SORT_ORDER}&$filter={F_PROJECT_ID} eq '{project_code}'&$orderby={F_SORT_ORDER} desc&$top=1"
            existing_res = requests.get(existing_url, headers=hdr, timeout=20)
            if existing_res.ok:
                existing = existing_res.json().get("value", [])
                if existing and existing[0].get(F_SORT_ORDER) is not None:
                    sort_order = existing[0][F_SORT_ORDER] + 1
        except:
            pass

        payload = {
            F_COLUMN_ID: column_id,
            F_COLUMN_NAME: body.get("column_name"),
            F_COLUMN_COLOR: body.get("column_color", "#e5e7eb"),
            F_PROJECT_ID: project_code,
            F_BOARD_ID: body.get("board_id", ""),
            F_SORT_ORDER: sort_order
        }

        payload = {k: v for k, v in payload.items() if v not in (None, "", [])}

        url = f"{DATAVERSE_BASE}{DATAVERSE_API}/{ENTITY_SET_COLUMNS}"
        res = requests.post(url, headers=hdr, json=payload, timeout=20)

        if res.status_code in (200, 201, 204):
            return jsonify({
                "success": True, 
                "message": "Column added successfully",
                "column": {
                    "column_id": column_id,
                    "column_name": body.get("column_name"),
                    "column_color": body.get("column_color", "#e5e7eb")
                }
            }), 201
        else:
            current_app.logger.error(f"Add column failed: {res.text}")
            return jsonify({"success": False, "error": res.text}), 400

    except Exception as e:
        current_app.logger.exception("Error adding column")
        return jsonify({"success": False, "error": str(e)}), 500

# ============================================================
# 3️⃣ DELETE COLUMN
# ============================================================
@bp.route("/columns/<guid>", methods=["DELETE"])
def delete_column(guid):
    """Delete a column by Dataverse GUID."""
    try:
        token = get_access_token()
        hdr = {"Authorization": f"Bearer {token}", "Accept": "application/json"}

        url = f"{DATAVERSE_BASE}{DATAVERSE_API}/{ENTITY_SET_COLUMNS}({guid})"
        res = requests.delete(url, headers=hdr, timeout=20)

        if res.status_code in (200, 204):
            return jsonify({"success": True, "message": "Column deleted"}), 200
        else:
            return jsonify({"success": False, "error": res.text}), 400

    except Exception as e:
        current_app.logger.exception("Error deleting column")
        return jsonify({"success": False, "error": str(e)}), 500
