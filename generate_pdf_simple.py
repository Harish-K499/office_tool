import os
import markdown
import base64
from datetime import datetime

def markdown_to_html_with_style(md_content, title):
    """Convert markdown to HTML with embedded CSS"""
    
    # Convert markdown to HTML
    html_content = markdown.markdown(md_content, extensions=['tables', 'fenced_code', 'codehilite'])
    
    # Enhanced CSS for professional PDF
    css_style = """
    <style>
        @page {
            margin: 2cm;
            size: A4;
            @bottom-center {
                content: counter(page);
                font-size: 10pt;
            }
        }
        
        * {
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #2c3e50;
            margin: 0;
            padding: 0;
        }
        
        .cover-page {
            text-align: center;
            padding: 100px 0;
        }
        
        .cover-page h1 {
            font-size: 48pt;
            color: #3498db;
            margin-bottom: 20px;
        }
        
        .cover-page .subtitle {
            font-size: 18pt;
            color: #7f8c8d;
            margin-bottom: 50px;
        }
        
        .cover-page .date {
            font-size: 14pt;
            color: #95a5a6;
        }
        
        h1 {
            font-size: 28pt;
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
            page-break-before: always;
            margin-top: 50px;
        }
        
        h2 {
            font-size: 22pt;
            color: #34495e;
            border-bottom: 2px solid #ecf0f1;
            padding-bottom: 8px;
            margin-top: 40px;
        }
        
        h3 {
            font-size: 18pt;
            color: #2980b9;
            margin-top: 30px;
        }
        
        h4 {
            font-size: 14pt;
            color: #27ae60;
            margin-top: 25px;
        }
        
        p {
            margin: 10px 0;
            text-align: justify;
        }
        
        code {
            background-color: #f8f9fa;
            padding: 3px 6px;
            border-radius: 4px;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 10pt;
            color: #e74c3c;
        }
        
        pre {
            background-color: #2c3e50;
            color: #ecf0f1;
            padding: 20px;
            border-radius: 8px;
            overflow-x: auto;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 10pt;
            line-height: 1.4;
            margin: 20px 0;
        }
        
        pre code {
            background: none;
            padding: 0;
            color: inherit;
        }
        
        blockquote {
            border-left: 4px solid #3498db;
            margin: 20px 0;
            padding: 10px 20px;
            background-color: #f8f9fa;
            color: #7f8c8d;
            font-style: italic;
        }
        
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
            font-size: 10pt;
        }
        
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        
        th {
            background-color: #3498db;
            color: white;
            font-weight: bold;
        }
        
        tr:nth-child(even) {
            background-color: #f2f2f2;
        }
        
        ul, ol {
            margin: 10px 0;
            padding-left: 30px;
        }
        
        li {
            margin: 8px 0;
        }
        
        .ascii-art {
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 8pt;
            line-height: 1.1;
            white-space: pre;
            overflow-x: auto;
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            border: 1px solid #dee2e6;
            margin: 20px 0;
        }
        
        .highlight {
            background-color: #fff3cd;
            padding: 15px;
            border-left: 4px solid #ffc107;
            margin: 20px 0;
        }
        
        .info-box {
            background-color: #d1ecf1;
            border: 1px solid #bee5eb;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
        }
        
        .page-break {
            page-break-before: always;
        }
        
        .no-break {
            page-break-inside: avoid;
        }
    </style>
    """
    
    # Create complete HTML document
    full_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>{title}</title>
        {css_style}
    </head>
    <body>
        <div class="cover-page">
            <h1>{title}</h1>
            <div class="subtitle">Complete Technical Documentation</div>
            <div class="date">Generated on {datetime.now().strftime('%B %d, %Y')}</div>
        </div>
        <div class="content">
            {html_content}
        </div>
    </body>
    </html>
    """
    
    return full_html

def create_html_file(md_file, html_file, title):
    """Create an HTML file from markdown"""
    
    # Read markdown file
    with open(md_file, 'r', encoding='utf-8') as file:
        md_content = file.read()
    
    # Convert to HTML with styling
    html_content = markdown_to_html_with_style(md_content, title)
    
    # Write HTML file
    with open(html_file, 'w', encoding='utf-8') as file:
        file.write(html_content)
    
    print(f"✅ Created HTML file: {html_file}")
    return html_file

def print_pdf_instructions(html_files):
    """Print instructions for converting HTML to PDF"""
    
    print("\n" + "="*60)
    print("📄 PDF CONVERSION INSTRUCTIONS")
    print("="*60)
    print("\nSince automatic PDF generation requires additional")
    print("system dependencies, here are 3 easy ways to convert:")
    print("\n" + "-"*40)
    
    print("\n📌 METHOD 1: Chrome Browser (Recommended)")
    print("1. Open any HTML file in Chrome")
    print("2. Right-click → Print")
    print("3. Select 'Save as PDF'")
    print("4. Adjust margins if needed")
    print("5. Click Save")
    
    print("\n📌 METHOD 2: Online Converter")
    print("1. Visit: https://html2pdf.com/")
    print("2. Upload the HTML file")
    print("3. Download the PDF")
    
    print("\n📌 METHOD 3: Edge Browser")
    print("1. Open HTML in Edge")
    print("2. Ctrl+P (Print)")
    print("3. Choose 'Microsoft Print to PDF'")
    print("4. Click Print")
    
    print("\n" + "="*60)
    print("📁 Generated HTML files:")
    for html_file in html_files:
        print(f"   • {html_file}")
    print("="*60)

if __name__ == "__main__":
    # Files to convert
    files_to_convert = [
        ("PROJECT_ARCHITECTURE_GUIDE.md", "VTAB_Architecture_Guide.html", "VTAB Office Tool - Architecture Guide"),
        ("ARCHITECTURE_DIAGRAMS.md", "VTAB_Architecture_Diagrams.html", "VTAB Office Tool - Architecture Diagrams")
    ]
    
    print("🚀 Converting Markdown to HTML...\n")
    
    html_files = []
    for md_file, html_file, title in files_to_convert:
        print(f"📄 Processing {md_file}...")
        if os.path.exists(md_file):
            created_file = create_html_file(md_file, html_file, title)
            html_files.append(created_file)
        else:
            print(f"❌ File not found: {md_file}")
    
    print("\n✨ HTML conversion complete!")
    print_pdf_instructions(html_files)
