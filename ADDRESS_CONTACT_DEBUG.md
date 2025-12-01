# Address and Contact Number Swap Debug

## Issue
When adding a new employee:
- Address: "coimbatore" → Shows in Contact No column
- Contact No: "9876543210" → Shows in Address column

## Investigation

### Field Mapping Check
✅ **Frontend Form (employees.js line 275-276)**:
```javascript
contact_number: document.getElementById('contactNo').value,  // Correct
address: document.getElementById('承dress').value             // Correct
```

✅ **Frontend Local State (employees.js line 290)**:
```javascript
contactNumber: payload.contact_number,  // Correct
location: payload.address,               // Correct
```

✅ **Frontend Display (employees.js line 76)**:
```javascript
<td>${e.location || ''}</td>        // Address column
<td>${e.contactNumber || ''}</td>   // Contact No column
```

✅ **Backend Sending (unified_server.py line 1221-1224)**:
```python
if field_map['contact']:
    payload[field_map['contact']] = data.get("contact_number")  # Correct
if field_map['address']:
    payload[field_map['address']] = data.get("address")         # Correct
```

✅ **Backend Retrieving (unified_server.py line 1172-1173)**:
```python
"contact_number": r.get(field_map['contact']),  # Correct
"address": r.get(field_map['address']),         # Correct
```

✅ **Field Map (unified_server.py line 71-72)**:
```python
"contact": "crc6f_contactnumber",  # Correct
"address": "crc6f_address"         # Correct
```

## Root Cause Hypothesis

The field mapping appears correct in the code. The issue might be:

1. **Dataverse Field Mapping**: The Dataverse entity might have the fields swapped
2. **Data Entry Error**: User might be entering data in wrong fields
3. **Display Order**: The table columns might be swapped visually

## Next Steps

1. Check Dataverse entity structure for actual field names
2. Add debug logging to see actual values being sent/received
3. Verify the form field IDs match the document.getElementById() calls

## Debugging Code to Add

Add these console.log statements in employees.js line 283:

```javascript
console.log('🔍 DEBUG - Before API call');
console.log('contact_number:', document.getElementById('contactNo').value);
console.log('address:', document.getElementById('address').value);
console.log('Payload:', payload);
```

And in the backend create_employee function, add:

```python
print(f"🔍 DEBUG - Creating employee")
print(f"contact_number from payload: {data.get('contact_number')}")
print(f"address from payload: {data.get('address')}")
print(f"field_map['contact']: {field_map['contact']}")
print(f"field_map['address']: {field_map['address']}")
```


