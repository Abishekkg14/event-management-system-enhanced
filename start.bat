@echo off
echo Starting Event Management System...
echo.

echo Installing dependencies...
call npm install
cd client
call npm install
cd ..

echo.
echo Starting the application...
echo Backend will run on http://localhost:5000
echo Frontend will run on http://localhost:3000
echo.

call npm run dev

pause

