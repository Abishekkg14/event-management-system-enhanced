@echo off
echo Restarting Event Management System...
echo.

echo Cleaning cache...
cd client
call npm cache clean --force
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache
)
cd ..

echo.
echo Starting MongoDB (if not already running)...
start /b mongod

echo.
echo Starting the application...
echo Backend will run on http://localhost:5000
echo Frontend will run on http://localhost:3000
echo.

start cmd /k "cd server && npm start"
timeout /t 5
start cmd /k "cd client && npm start"

echo.
echo Application started! Check the browser at http://localhost:3000
echo.
echo Login with the following credentials:
echo Email: admin@example.com
echo Password: password
