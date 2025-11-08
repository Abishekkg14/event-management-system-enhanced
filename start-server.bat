@echo off
echo Starting Event Management System Server...
echo.
echo Server will run on http://localhost:5000
echo Press Ctrl+C to stop the server
echo.
cd /d "%~dp0"
node server/index.js
pause
