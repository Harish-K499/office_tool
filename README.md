<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1fJlYh4ecoD5lrI_Ak1O1wC-XFwPn1Ou5

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Features

### Employee Management
- **Add New Employee**: Add individual employees through the form
- **Bulk Upload**: Upload multiple employees at once using a CSV file
- **Bulk Delete**: Delete multiple employees (coming soon)

### Bulk Upload CSV Format
Use the provided `sample_employees.csv` as a template. The CSV should have the following columns:
```
employee_id,first_name,last_name,email,contact_number,address,department,designation,doj,active
```

**Example:**
```csv
EMP0101,John,Doe,john.doe@company.com,1234567890,123 Main St,Engineering,Software Engineer,2024-01-15,true
```

### Leave Tracker
- Apply for leave with start and end dates
- Only current and future dates can be selected
- Leave history and status tracking
