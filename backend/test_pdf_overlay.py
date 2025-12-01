"""
Test PDF Overlay Coordinates
Run this script to generate a test PDF with coordinate markers to help find exact positions.
"""

from PyPDF2 import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from io import BytesIO
import os

# Test data
firstname = "Sammer"
lastname = "K"
designation = "Data Analyst"
doj = "15-11-2025"

# Paths
backend_dir = os.path.dirname(os.path.abspath(__file__))
offer_letter_path = os.path.join(backend_dir, "Offer Letter .pdf")
output_path = os.path.join(backend_dir, "Test_Overlay_Output.pdf")

print("=" * 60)
print("PDF Overlay Coordinate Tester")
print("=" * 60)
print(f"Input PDF: {offer_letter_path}")
print(f"Output PDF: {output_path}")
print(f"Test Name: {firstname} {lastname}")
print(f"Test Designation: {designation}")
print(f"Test DOJ: {doj}")
print("=" * 60)

# Create PDF writer
pdf_writer = PdfWriter()

# Read offer letter template
offer_reader = PdfReader(offer_letter_path)

# Create overlay
packet = BytesIO()
can = canvas.Canvas(packet, pagesize=letter)

# Draw coordinate grid (optional - helps visualize)
can.setStrokeColorRGB(0.9, 0.9, 0.9)
can.setLineWidth(0.5)
for x in range(0, 612, 50):
    can.line(x, 0, x, 792)
    can.setFont("Helvetica", 6)
    can.drawString(x + 2, 5, str(x))
for y in range(0, 792, 50):
    can.line(0, y, 612, y)
    can.setFont("Helvetica", 6)
    can.drawString(5, y + 2, str(y))

# Cover existing text with white rectangles
can.setFillColorRGB(1, 1, 1)  # White

# Cover "Harish" in "To" section
can.rect(108, 612, 150, 18, fill=1, stroke=0)

# Cover "Harish" in "Dear" line
can.rect(150, 492, 150, 18, fill=1, stroke=0)

# Cover "Unpaid Intern"
can.rect(608, 428, 160, 18, fill=1, stroke=0)

# Cover "07-10-2025"
can.rect(752, 428, 110, 18, fill=1, stroke=0)

# Overlay new text
can.setFillColorRGB(0, 0, 0)  # Black
can.setFont("Helvetica", 11)

# Position 1: Name in "To" section
can.drawString(110, 615, f"{firstname} {lastname}")

# Position 2: Name in "Dear" line
can.drawString(153, 495, f"{firstname} {lastname}")

# Position 3: Designation
can.setFont("Helvetica-Bold", 11)
can.drawString(610, 431, f"{designation}")

# Position 4: DOJ
can.drawString(755, 431, f"{doj}")

# Add markers to show where text was placed (red dots)
can.setFillColorRGB(1, 0, 0)  # Red
can.circle(110, 615, 3, fill=1)  # Name (To)
can.circle(153, 495, 3, fill=1)  # Name (Dear)
can.circle(610, 431, 3, fill=1)  # Designation
can.circle(755, 431, 3, fill=1)  # DOJ

can.save()
packet.seek(0)

# Merge overlay with first page
overlay_pdf = PdfReader(packet)
first_page = offer_reader.pages[0]
first_page.merge_page(overlay_pdf.pages[0])
pdf_writer.add_page(first_page)

# Add remaining pages
for page_num in range(1, len(offer_reader.pages)):
    pdf_writer.add_page(offer_reader.pages[page_num])

# Write output
with open(output_path, 'wb') as output_file:
    pdf_writer.write(output_file)

print("\n✅ Test PDF generated successfully!")
print(f"📄 Open this file to check alignment: {output_path}")
print("\nRed dots show where text was placed.")
print("Grid lines show coordinates (every 50 points).")
print("\nIf text is misaligned:")
print("  - Move RIGHT: Increase X value")
print("  - Move LEFT: Decrease X value")
print("  - Move UP: Increase Y value")
print("  - Move DOWN: Decrease Y value")
print("\nUpdate coordinates in unified_server.py lines 7095-7126")
print("=" * 60)
