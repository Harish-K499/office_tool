"""
Script to convert HTML documentation to PDF
Requires: pdfkit (pip install pdfkit)
Requires: wkhtmltopdf installed on system
"""

import pdfkit
import os
import sys

def convert_html_to_pdf():
    """Convert the HTML documentation to PDF"""
    
    # Path to the HTML file
    html_file = 'VTAB_Project_Documentation_With_Diagrams.html'
    pdf_file = 'VTAB_Project_Documentation.pdf'
    
    # Check if HTML file exists
    if not os.path.exists(html_file):
        print(f"❌ Error: {html_file} not found!")
        return False
    
    print("🔄 Converting HTML to PDF...")
    
    # PDF options for better quality
    options = {
        'page-size': 'A4',
        'margin-top': '0.75in',
        'margin-right': '0.75in',
        'margin-bottom': '0.75in',
        'margin-left': '0.75in',
        'encoding': "UTF-8",
        'no-outline': None,
        'enable-local-file-access': None,
        'javascript-delay': 1000,
        'load-error-handling': 'ignore',
        'load-media-error-handling': 'ignore'
    }
    
    try:
        # Convert HTML to PDF
        pdfkit.from_file(html_file, pdf_file, options=options)
        print(f"✅ Success! PDF created: {pdf_file}")
        print(f"📍 Location: {os.path.abspath(pdf_file)}")
        return True
    except Exception as e:
        print(f"❌ Error converting to PDF: {e}")
        print("\n💡 To fix this, you need to:")
        print("1. Install pdfkit: pip install pdfkit")
        print("2. Install wkhtmltopdf: https://wkhtmltopdf.org/downloads.html")
        print("   - Windows: Download and run the installer")
        print("   - Make sure wkhtmltopdf is in your PATH")
        return False

if __name__ == "__main__":
    convert_html_to_pdf()
