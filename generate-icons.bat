@echo off
REM PWA Icon Generator Script for Windows
REM Creates simple placeholder icons for PWA

echo 🎨 Generating PWA Icons...

REM Create icons directory if it doesn't exist
if not exist "public\icons" mkdir "public\icons"

REM Create a simple SVG icon
echo ^<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"^> > "public\icons\icon.svg"
echo   ^<rect width="512" height="512" rx="64" fill="#1E3A8A"/^> >> "public\icons\icon.svg"
echo   ^<text x="256" y="320" font-family="Inter, sans-serif" font-size="192" font-weight="bold" text-anchor="middle" fill="white"^>R^</text^> >> "public\icons\icon.svg"
echo ^</svg^> >> "public\icons\icon.svg"

echo ✅ SVG icon created at public\icons\icon.svg
echo.
echo 📋 Next steps:
echo    1. Convert SVG to PNG using an online converter or ImageMagick:
echo       - 192x192: icon-192.png
echo       - 512x512: icon-512.png
echo       - 192x192 maskable: icon-192-maskable.png
echo       - 512x512 maskable: icon-512-maskable.png
echo.
echo    2. Or use this online converter:
echo       https://convertio.co/svg-png/
echo.
echo    3. Place the PNG files in public\icons\ directory
echo.
echo 🎯 For now, the app will work without icons, but they're needed for PWA functionality

pause







