@echo off
echo Starting Event Management System...
echo.

echo Installing dependencies...
call npm install
cd client
call npm install
cd ..

echo.
echo Creating MongoDB database and seeding data...
call node server/seed.js

echo.
echo Starting the application...
echo Backend will run on http://localhost:5000
echo Frontend will run on http://localhost:3000
echo.
echo Login with:
echo Email: admin@example.com
echo Password: password
echo.

start cmd /k "cd server && npm install && node index.js"
cd client
call npm start

pause
