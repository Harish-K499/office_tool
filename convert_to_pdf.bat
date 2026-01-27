@echo off
echo Converting HTML files to PDF using Chrome...
echo.

REM Check if Chrome is installed
where chrome >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Chrome not found. Please install Google Chrome.
    echo Alternatively, open the HTML files manually and print to PDF.
    pause
    exit /b 1
)

REM Convert Architecture Guide
echo Converting VTAB_Architecture_Guide.html to PDF...
chrome --headless --disable-gpu --print-to-pdf="VTAB_Office_Tool_Architecture_Guide.pdf" --print-to-pdf-no-header "file:///%~dp0VTAB_Architecture_Guide.html"

REM Convert Architecture Diagrams
echo Converting VTAB_Architecture_Diagrams.html to PDF...
chrome --headless --disable-gpu --print-to-pdf="VTAB_Office_Tool_Architecture_Diagrams.pdf" --print-to-pdf-no-header "file:///%~dp0VTAB_Architecture_Diagrams.html"

echo.
echo ✅ Conversion complete!
echo.
echo Generated PDF files:
echo   - VTAB_Office_Tool_Architecture_Guide.pdf
echo   - VTAB_Office_Tool_Architecture_Diagrams.pdf
echo.
pause
