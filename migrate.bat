@echo off
echo Event Management System - Migration Helper
echo ---------------------------------------------
echo This script will help update your application after the migration
echo from TypeScript/MUI to JavaScript/Bootstrap
echo.

echo Step 1: Installing new dependencies...
cd client
call npm install bootstrap bootstrap-icons chart.js react-bootstrap react-chartjs-2 --save
cd ..

echo.
echo Step 2: Removing old TypeScript dependencies...
cd client
call npm uninstall @emotion/react @emotion/styled @mui/icons-material @mui/lab @mui/material @mui/x-data-grid @mui/x-date-pickers @types/react @types/react-dom @types/react-router-dom recharts typescript
cd ..

echo.
echo Step 3: Running database seed script...
call node server/seed.js

echo.
echo Step 4: Starting the application...
echo.
echo Your application will open at:
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:5000
echo.
echo Login with these credentials:
echo - Email: admin@example.com
echo - Password: password
echo.

call npm run dev

pause
