# PDF Coordinate Adjustment Guide

## Issue
The PDF overlay is not replacing the template text correctly. "Harish" and "Unpaid Intern" are still visible instead of being replaced with candidate data.

## Diagnosis
PDF overlay coordinates need fine-tuning. The white rectangles and text positions aren't aligning exactly with the template.

---

## Solution 1: Use Test Script

I've created a test script to help you find the exact coordinates.

### Run the test script:
```bash
cd backend
python test_pdf_overlay.py
```

### What it does:
1. Generates `Test_Overlay_Output.pdf` with:
   - Your test data (Sammer K, Data Analyst, 15-11-2025)
   - Coordinate grid (every 50 points)
   - Red dots showing where text was placed
2. Open the PDF and check alignment
3. Adjust coordinates based on where the red dots appear

### Interpreting the results:
- **Red dots** = Where text was placed
- **Grid lines** = Coordinate reference (labeled with numbers)
- **If text is too far left** → Increase X value
- **If text is too far right** → Decrease X value
- **If text is too high** → Decrease Y value
- **If text is too low** → Increase Y value

---

## Solution 2: Manual Coordinate Adjustment

### Current Coordinates (unified_server.py lines 7095-7126):

```python
# White rectangles (cover old text)
can.rect(108, 612, 150, 18, fill=1, stroke=0)  # "Harish" in To section
can.rect(150, 492, 150, 18, fill=1, stroke=0)  # "Harish" in Dear line
can.rect(608, 428, 160, 18, fill=1, stroke=0)  # "Unpaid Intern"
can.rect(752, 428, 110, 18, fill=1, stroke=0)  # "07-10-2025"

# Text overlay (new text)
can.drawString(110, 615, f"{firstname} {lastname}")  # To section
can.drawString(153, 495, f"{firstname} {lastname}")  # Dear line
can.drawString(610, 431, f"{designation}")           # Designation
can.drawString(755, 431, f"{display_doj}")           # DOJ
```

### Adjustment Examples:

#### If "Harish" in "To" section is still visible:
```python
# Move rectangle and text slightly
can.rect(105, 610, 160, 20, fill=1, stroke=0)  # Wider/taller rectangle
can.drawString(107, 613, f"{firstname} {lastname}")  # Adjusted position
```

#### If "Unpaid Intern" is still visible:
```python
# Move rectangle and text
can.rect(605, 426, 170, 20, fill=1, stroke=0)  # Wider rectangle
can.drawString(607, 429, f"{designation}")  # Adjusted position
```

---

## Solution 3: Alternative Approach (If overlay doesn't work)

If the overlay approach continues to have issues, we can use a different method:

### Option A: Use form fields (if PDF has them)
Some PDFs have fillable form fields that can be populated programmatically.

### Option B: Generate PDF from scratch
Instead of overlaying, generate the entire letter using ReportLab from scratch.

### Option C: Use PDF editing library
Use a more advanced library like `pdfrw` or `pypdf` with better text replacement capabilities.

---

## Debugging Steps

### Step 1: Check console logs
When you send the policy letter, check the backend console for:
```
[PDF OVERLAY] Name: Sammer K
[PDF OVERLAY] Designation: Data Analyst
[PDF OVERLAY] DOJ: 15-11-2025
```

This confirms the correct data is being used.

### Step 2: Run test script
```bash
python test_pdf_overlay.py
```

Open `Test_Overlay_Output.pdf` and check:
- Are the red dots near the text you want to replace?
- Is the white rectangle covering the old text?
- Is the new text visible and readable?

### Step 3: Adjust coordinates
Based on the test PDF:
1. Note where the red dots are
2. Measure distance to where they should be
3. Adjust X/Y values accordingly
4. Re-run test script to verify

### Step 4: Update unified_server.py
Once you find the correct coordinates in the test script, update them in `unified_server.py` lines 7095-7126.

### Step 5: Restart server and test
```bash
python unified_server.py
```

Then test the full flow in the onboarding UI.

---

## Quick Reference

### PDF Coordinate System
- **Origin (0, 0):** Bottom-left corner
- **X-axis:** Left to right (0 to 612 for letter size)
- **Y-axis:** Bottom to top (0 to 792 for letter size)
- **Units:** Points (72 points = 1 inch)

### Common Adjustments
| Issue | Solution |
|-------|----------|
| Text too far left | Increase X by 5-10 points |
| Text too far right | Decrease X by 5-10 points |
| Text too high | Decrease Y by 5-10 points |
| Text too low | Increase Y by 5-10 points |
| Old text still visible | Make rectangle larger (increase width/height) |
| New text cut off | Decrease font size or adjust position |

---

## Alternative: Use HTML to PDF

If PDF overlay continues to be problematic, consider generating the letter as HTML and converting to PDF:

```python
from weasyprint import HTML

html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Helvetica, Arial, sans-serif; margin: 40px; }}
        h1 {{ color: #1d4ed8; }}
    </style>
</head>
<body>
    <h1>Employment Joining Confirmation</h1>
    <p><strong>Date:</strong> {current_date}</p>
    <p>To<br>{firstname} {lastname}<br>{address}</p>
    <p><strong>Subject: Confirmation of Joining</strong></p>
    <p>Dear {firstname} {lastname},</p>
    <p>This is to confirm that you have joined <strong>VTAB Square Pvt Ltd</strong> 
    as <strong>{designation}</strong> on <strong>{doj}</strong>...</p>
</body>
</html>
"""

HTML(string=html_content).write_pdf("output.pdf")
```

This approach gives you full control over the layout and avoids coordinate issues.

---

## Summary

1. **Run test script** to visualize coordinates
2. **Check console logs** to verify data
3. **Adjust coordinates** based on test output
4. **Update unified_server.py** with correct values
5. **Test full flow** in onboarding UI

If overlay continues to be problematic, consider the HTML-to-PDF approach for more reliable results.
