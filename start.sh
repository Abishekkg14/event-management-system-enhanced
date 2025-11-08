#!/bin/bash

echo "Starting Event Management System..."
echo

echo "Installing dependencies..."
npm install
cd client
npm install
cd ..

echo
echo "Starting the application..."
echo "Backend will run on http://localhost:5000"
echo "Frontend will run on http://localhost:3000"
echo

npm run dev



