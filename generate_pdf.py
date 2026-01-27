import os
import markdown
import pdfkit
from weasyprint import HTML, CSS

def convert_markdown_to_pdf(md_file_path, pdf_file_path):
    """Convert Markdown file to PDF"""
    
    # Read the markdown file
    with open(md_file_path, 'r', encoding='utf-8') as file:
        md_content = file.read()
    
    # Convert markdown to HTML
    html_content = markdown.markdown(md_content, extensions=['tables', 'fenced_code', 'codehilite'])
    
    # Add CSS styling for better PDF output
    styled_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>{os.path.basename(md_file_path)}</title>
        <style>
            @page {{
                margin: 2cm;
                size: A4;
            }}
            body {{
                font-family: Arial, sans-serif;
                font-size: 12px;
                line-height: 1.6;
                color: #333;
            }}
            h1 {{
                font-size: 24px;
                color: #2c3e50;
                border-bottom: 3px solid #3498db;
                padding-bottom: 10px;
                page-break-before: always;
            }}
            h2 {{
                font-size: 20px;
                color: #34495e;
                border-bottom: 2px solid #ecf0f1;
                padding-bottom: 5px;
                margin-top: 30px;
            }}
            h3 {{
                font-size: 16px;
                color: #2980b9;
                margin-top: 25px;
            }}
            code {{
                background-color: #f8f9fa;
                padding: 2px 5px;
                border-radius: 3px;
                font-family: 'Courier New', monospace;
                font-size: 11px;
            }}
            pre {{
                background-color: #f8f9fa;
                padding: 15px;
                border-radius: 5px;
                overflow-x: auto;
                border: 1px solid #dee2e6;
            }}
            pre code {{
                background: none;
                padding: 0;
            }}
            table {{
                border-collapse: collapse;
                width: 100%;
                margin: 20px 0;
            }}
            th, td {{
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
            }}
            th {{
                background-color: #f2f2f2;
                font-weight: bold;
            }}
            blockquote {{
                border-left: 4px solid #3498db;
                margin: 20px 0;
                padding-left: 20px;
                color: #7f8c8d;
            }}
            ul, ol {{
                margin: 10px 0;
                padding-left: 30px;
            }}
            li {{
                margin: 5px 0;
            }}
            .ascii-art {{
                font-family: 'Courier New', monospace;
                font-size: 10px;
                line-height: 1.2;
                white-space: pre;
                overflow-x: auto;
                background-color: #f8f9fa;
                padding: 10px;
                border-radius: 5px;
            }}
        </style>
    </head>
    <body>
        {html_content}
    </body>
    </html>
    """
    
    # Convert HTML to PDF
    try:
        HTML(string=styled_html).write_pdf(pdf_file_path)
        print(f"✅ Successfully converted {md_file_path} to {pdf_file_path}")
        return True
    except Exception as e:
        print(f"❌ Error converting {md_file_path}: {str(e)}")
        print("\nTrying alternative method with pdfkit...")
        
        try:
            # Try with pdfkit as fallback
            options = {
                'page-size': 'A4',
                'margin-top': '2cm',
                'margin-right': '2cm',
                'margin-bottom': '2cm',
                'margin-left': '2cm',
                'encoding': "UTF-8",
                'no-outline': None,
                'enable-local-file-access': None
            }
            pdfkit.from_string(styled_html, pdf_file_path, options=options)
            print(f"✅ Successfully converted {md_file_path} to {pdf_file_path} using pdfkit")
            return True
        except Exception as e2:
            print(f"❌ Both methods failed. Error: {str(e2)}")
            return False

if __name__ == "__main__":
    # Files to convert
    files_to_convert = [
        ("PROJECT_ARCHITECTURE_GUIDE.md", "VTAB_Office_Tool_Architecture_Guide.pdf"),
        ("ARCHITECTURE_DIAGRAMS.md", "VTAB_Office_Tool_Architecture_Diagrams.pdf")
    ]
    
    print("🚀 Starting PDF conversion...\n")
    
    for md_file, pdf_file in files_to_convert:
        print(f"📄 Converting {md_file} to PDF...")
        success = convert_markdown_to_pdf(md_file, pdf_file)
        
        if success:
            file_size = os.path.getsize(pdf_file) / (1024 * 1024)  # Size in MB
            print(f"   📊 PDF size: {file_size:.2f} MB\n")
    
    print("✨ Conversion complete!")
    print("\n📁 Generated PDF files:")
    for _, pdf_file in files_to_convert:
        if os.path.exists(pdf_file):
            print(f"   - {pdf_file}")
