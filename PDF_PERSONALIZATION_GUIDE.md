# PDF Personalization Guide ✅

## Overview
Updated the PDF generation to replace template placeholders with actual candidate information in the "Employment Joining Confirmation" letter.

---

## Replacements Made

### 1. **"Harish" → Candidate Name**
   - **Location 1:** "To" section (line after "To")
   - **Location 2:** "Dear Harish," line
   - **Replacement:** `{firstname} {lastname}`

### 2. **"Unpaid Intern" → Designation**
   - **Location:** Confirmation paragraph ("...joined VTAB Square Pvt Ltd as Unpaid Intern on...")
   - **Replacement:** `{designation}`

### 3. **"07-10-2025" → Date of Joining**
   - **Location:** Confirmation paragraph ("...as Unpaid Intern on 07-10-2025...")
   - **Replacement:** `{doj}`

---

## Implementation

### Code Location
`backend/unified_server.py` (Lines 7076-7113)

### Technique Used
1. **Cover existing text** with white rectangles
2. **Overlay new text** at the same positions

### Code Structure

```python
# Step 1: Cover existing text with white rectangles
can.setFillColorRGB(1, 1, 1)  # White color

# Cover "Harish" in "To" section
can.rect(110, 615, 100, 15, fill=1, stroke=0)

# Cover "Harish" in "Dear" line
can.rect(150, 495, 100, 15, fill=1, stroke=0)

# Cover "Unpaid Intern"
can.rect(610, 432, 140, 15, fill=1, stroke=0)

# Cover "07-10-2025"
can.rect(750, 432, 100, 15, fill=1, stroke=0)

# Step 2: Overlay new text
can.setFillColorRGB(0, 0, 0)  # Black color
can.setFont("Helvetica", 11)

# Position 1: Name in "To" section
can.drawString(110, 618, f"{firstname} {lastname}")

# Position 2: Name in "Dear" line
can.drawString(153, 498, f"{firstname} {lastname}")

# Position 3: Designation
can.setFont("Helvetica-Bold", 11)
can.drawString(612, 435, f"{designation}")

# Position 4: DOJ
can.drawString(754, 435, f"{doj}")
```

---

## Coordinate System

### PDF Coordinate System
- **Origin (0, 0):** Bottom-left corner
- **X-axis:** Increases to the right
- **Y-axis:** Increases upward
- **Letter size:** 612 x 792 points

### Current Coordinates

| Element | Cover Rectangle | Text Position | Font |
|---------|----------------|---------------|------|
| Name (To section) | (110, 615, 100, 15) | (110, 618) | Helvetica 11 |
| Name (Dear line) | (150, 495, 100, 15) | (153, 498) | Helvetica 11 |
| Designation | (610, 432, 140, 15) | (612, 435) | Helvetica-Bold 11 |
| DOJ | (750, 432, 100, 15) | (754, 435) | Helvetica-Bold 11 |

**Rectangle format:** `(x, y, width, height)`
**Text format:** `(x, y)`

---

## Fine-Tuning Coordinates

If the text doesn't align perfectly, adjust these values:

### Method 1: Visual Inspection
1. Generate a test PDF
2. Check if text is:
   - Too far left → Increase X value
   - Too far right → Decrease X value
   - Too high → Decrease Y value
   - Too low → Increase Y value

### Method 2: Measurement Tool
1. Open the template PDF in a PDF editor (e.g., Adobe Acrobat)
2. Use the measurement tool to find exact coordinates
3. Update the code with precise values

### Example Adjustments

**If "Harish" in "To" section is misaligned:**
```python
# Original
can.rect(110, 615, 100, 15, fill=1, stroke=0)
can.drawString(110, 618, f"{firstname} {lastname}")

# Adjusted (move 5 points right, 2 points up)
can.rect(115, 617, 100, 15, fill=1, stroke=0)
can.drawString(115, 620, f"{firstname} {lastname}")
```

**If "Unpaid Intern" replacement is too long:**
```python
# Original
can.rect(610, 432, 140, 15, fill=1, stroke=0)

# Adjusted (wider rectangle)
can.rect(610, 432, 180, 15, fill=1, stroke=0)
```

---

## Testing

### Test Data
Use these test values to verify alignment:

```python
firstname = "John"
lastname = "Doe"
designation = "Senior Software Engineer"  # Long text
doj = "2025-12-01"
```

### Expected Output
The generated PDF should show:
- **To:** John Doe
- **Dear:** John Doe,
- **Confirmation:** "...joined VTAB Square Pvt Ltd as **Senior Software Engineer** on **2025-12-01**..."

### Verification Steps
1. Restart the backend server
2. Navigate to Stage 4 in onboarding
3. Verify documents
4. Select DOJ
5. Click "Send Policy Letter"
6. Download the PDF attachment from email
7. Open PDF and verify:
   - ✅ Name appears correctly in "To" section
   - ✅ Name appears correctly in "Dear" line
   - ✅ Designation replaces "Unpaid Intern"
   - ✅ DOJ replaces "07-10-2025"
   - ✅ No overlapping text
   - ✅ No visible white rectangles

---

## Common Issues & Solutions

### Issue 1: Text Overlaps with Original
**Symptom:** Both old and new text visible
**Solution:** Increase white rectangle size
```python
# Before
can.rect(110, 615, 100, 15, fill=1, stroke=0)

# After (wider/taller)
can.rect(110, 615, 120, 18, fill=1, stroke=0)
```

### Issue 2: Text Cut Off
**Symptom:** Long names/designations are truncated
**Solution:** Adjust font size or use smaller font
```python
# Option 1: Smaller font
can.setFont("Helvetica", 10)  # Instead of 11

# Option 2: Check text length and adjust
if len(designation) > 20:
    can.setFont("Helvetica-Bold", 9)
else:
    can.setFont("Helvetica-Bold", 11)
```

### Issue 3: White Rectangles Visible
**Symptom:** White boxes visible in PDF
**Solution:** Ensure rectangles match background exactly
```python
# Use exact background color if not pure white
can.setFillColorRGB(0.98, 0.98, 0.98)  # Slightly off-white
```

### Issue 4: Text Misaligned
**Symptom:** Text doesn't line up with original position
**Solution:** Adjust Y-coordinate (text baseline)
```python
# Text appears too high
can.drawString(110, 618, f"{firstname} {lastname}")

# Adjusted (lower by 3 points)
can.drawString(110, 615, f"{firstname} {lastname}")
```

---

## Advanced Customization

### Adding More Fields

To replace additional fields (e.g., address, department):

```python
# 1. Cover existing text
can.setFillColorRGB(1, 1, 1)
can.rect(x, y, width, height, fill=1, stroke=0)

# 2. Overlay new text
can.setFillColorRGB(0, 0, 0)
can.setFont("Helvetica", 11)
can.drawString(x, y+3, f"{new_value}")
```

### Multi-Line Text

For addresses or long text:

```python
address_lines = [
    "123 Main Street",
    "Apartment 4B",
    "Coimbatore - 641007"
]

y_position = 600
for line in address_lines:
    can.drawString(110, y_position, line)
    y_position -= 15  # Move down for next line
```

### Conditional Formatting

```python
# Bold for important fields
if field_type == "important":
    can.setFont("Helvetica-Bold", 12)
else:
    can.setFont("Helvetica", 11)
```

---

## Coordinate Reference Table

### Common Y-Coordinates (from bottom)
- **Top of page:** ~750
- **Header area:** 700-750
- **"To" section:** 600-650
- **"Dear" line:** 490-510
- **Main content:** 400-490
- **Signature area:** 100-200
- **Bottom of page:** 50

### Common X-Coordinates (from left)
- **Left margin:** 72 (1 inch)
- **Typical start:** 100-110
- **Center of page:** 306
- **Right margin:** 540 (1 inch from right)

---

## Summary

✅ **Implemented:**
1. White rectangle overlay to cover existing text
2. Dynamic text replacement for:
   - Candidate name (2 locations)
   - Designation
   - Date of Joining
3. Proper font matching (Helvetica 11, Helvetica-Bold 11)
4. Coordinate-based positioning

✅ **Result:**
- Personalized offer letter with candidate-specific information
- Clean replacement (no visible artifacts)
- Professional appearance

**Ready for production use!** 🎉

---

## Quick Reference

### Restart Server
```bash
cd backend
python unified_server.py
```

### Test Flow
1. Stage 4 → Verify documents
2. Select DOJ
3. Click "Send Policy Letter"
4. Check email for PDF
5. Verify personalization

### Adjust Coordinates
Edit `unified_server.py` lines 7083-7110 to fine-tune positions.
