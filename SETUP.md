# Event Management System

A comprehensive event management system built with React, Bootstrap, Node.js, Express, and MongoDB. This application allows you to manage events, clients, vendors, staff, and payments with a clean and intuitive interface.

## Quick Start

### Windows Users
```
start-project.bat
```

### Mac/Linux Users
```
chmod +x start-project.sh
./start-project.sh
```

## Login Information
- **Email:** admin@example.com
- **Password:** password

## Features

- **Dashboard:** Overview of upcoming events, revenue, and key metrics
- **Events Management:** Create, update, and manage events with detailed tracking
- **Client Management:** Store and manage client information and history
- **Vendor Management:** Track vendors, services, and costs
- **Staff Management:** Assign staff to events and track responsibilities
- **Payments Tracking:** Monitor invoices and payment status

## Technical Details

### Frontend
- React with JavaScript
- Bootstrap 5 for responsive UI
- Chart.js for data visualization
- React Router for navigation

### Backend
- Node.js & Express
- MongoDB database
- JWT authentication
- REST API

## Project Structure
```
├── client/               # React frontend
│   ├── public/           # Static files
│   └── src/              # Source files
│       ├── components/   # React components
│       ├── contexts/     # Context API files
│       └── pages/        # Page components
├── server/               # Node.js backend
│   ├── middleware/       # Express middleware
│   ├── models/           # Mongoose models
│   └── routes/           # API routes
├── .env                  # Environment variables
└── package.json          # Project dependencies
```

## Development Notes

### Adding New Pages
1. Create a new JavaScript file in the `client/src/pages` directory
2. Import necessary components from Bootstrap
3. Add the new route in `App.js`

### MongoDB Setup
The application requires MongoDB. The default connection string is:
```
mongodb://localhost:27017/event-management
```

You can modify this in the `.env` file if needed.

### API Endpoints

#### Auth Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user (admin only)

#### Events Endpoints
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

And more endpoints for clients, vendors, staff, and payments management.
