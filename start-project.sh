#!/bin/bash

echo "Starting Event Management System..."
echo

echo "Installing dependencies..."
npm install
cd client
npm install
cd ..

echo
echo "Creating MongoDB database and seeding data..."
node server/seed.js

echo
echo "Starting the application..."
echo "Backend will run on http://localhost:5000"
echo "Frontend will run on http://localhost:3000"
echo
echo "Login with:"
echo "Email: admin@example.com"
echo "Password: password"
echo

# Start the server in the background
node server/index.js &
SERVER_PID=$!

# Start the client
cd client
npm start

# When client is terminated, also kill the server
kill $SERVER_PID
