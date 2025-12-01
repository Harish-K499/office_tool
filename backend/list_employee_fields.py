import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv('id.env')

TENANT_ID = os.getenv("TENANT_ID")
CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
RESOURCE = os.getenv("RESOURCE")

def get_access_token():
    """Get OAuth token for Dataverse"""
    token_url = f"https://login.microsoftonline.com/{TENANT_ID}/oauth2/v2.0/token"
    token_data = {
        'grant_type': 'client_credentials',
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'scope': f'{RESOURCE}/.default'
    }
    token_r = requests.post(token_url, data=token_data)
    token_r.raise_for_status()
    return token_r.json()['access_token']

def get_entity_metadata(entity_logical_name):
    """Fetch metadata for a specific entity"""
    token = get_access_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0"
    }
    
    # Get entity definition with attributes
    url = f"{RESOURCE}/api/data/v9.2/EntityDefinitions(LogicalName='{entity_logical_name}')?$expand=Attributes"
    
    print(f"\n🔍 Fetching metadata for entity: {entity_logical_name}")
    print(f"URL: {url}\n")
    
    resp = requests.get(url, headers=headers)
    
    if resp.status_code != 200:
        print(f"❌ Error {resp.status_code}: {resp.text}")
        return None
    
    return resp.json()

def display_entity_fields(metadata):
    """Display all fields in a readable format"""
    if not metadata:
        return
    
    entity_name = metadata.get('LogicalName')
    display_name = metadata.get('DisplayName', {}).get('UserLocalizedLabel', {}).get('Label', 'N/A')
    collection_name = metadata.get('LogicalCollectionName')
    
    print("=" * 80)
    print(f"📋 Entity: {display_name}")
    print(f"   Logical Name: {entity_name}")
    print(f"   Collection Name: {collection_name}")
    print("=" * 80)
    
    attributes = metadata.get('Attributes', [])
    
    # Filter to custom fields (crc6f prefix) and common system fields
    custom_fields = []
    for attr in attributes:
        logical_name = attr.get('LogicalName', '')
        if logical_name.startswith('crc6f_') or logical_name in ['createdon', 'modifiedon', 'statecode', 'statuscode']:
            display_name_obj = attr.get('DisplayName')
            if display_name_obj and display_name_obj.get('UserLocalizedLabel'):
                display = display_name_obj.get('UserLocalizedLabel', {}).get('Label', 'N/A')
            else:
                display = 'N/A'
            attr_type = attr.get('AttributeType', 'Unknown')
            custom_fields.append({
                'logical': logical_name,
                'display': display,
                'type': attr_type
            })
    
    # Sort by logical name
    custom_fields.sort(key=lambda x: x['logical'])
    
    print(f"\n📊 Found {len(custom_fields)} custom/relevant fields:\n")
    
    for field in custom_fields:
        print(f"   • {field['logical']:<40} → {field['display']:<30} ({field['type']})")
    
    print("\n" + "=" * 80)

if __name__ == "__main__":
    print("\n" + "🔍 " * 30)
    print("DATAVERSE ENTITY FIELD INSPECTOR")
    print("🔍 " * 30 + "\n")
    
    # Try both employee entities
    entities_to_check = [
        'crc6f_employee',      # VTAB Employees
        'crc6f_table12'        # HR_Employee_master
    ]
    
    for entity in entities_to_check:
        metadata = get_entity_metadata(entity)
        if metadata:
            display_entity_fields(metadata)
            print("\n")
