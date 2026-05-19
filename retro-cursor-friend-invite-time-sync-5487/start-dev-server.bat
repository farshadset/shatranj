@echo off
echo Starting Retro Digital Menu Development Server...
echo.
echo This will start the development server on http://localhost:3000
echo The server will automatically reload when you make changes to the code.
echo.
echo Press Ctrl+C to stop the server
echo.
cd /d "%~dp0"
npm run dev
pause
