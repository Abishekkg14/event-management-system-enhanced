# Event Management System

A comprehensive event management platform built with React, Node.js, Express, and MongoDB. This system provides a centralized platform to manage events, clients, vendors, staff, and payments with a clean and responsive user interface.

## Features

### 🎯 Core Features
- **Event Management**: Create, edit, and manage events with detailed information
- **Client Management**: Track client relationships and company information
- **Vendor Management**: Manage vendor partnerships and services
- **Staff Management**: Handle team members and their roles
- **Payment Tracking**: Comprehensive financial management and payment tracking
- **Dashboard Analytics**: Real-time insights and data visualization

### 🎨 UI/UX Features
- Modern Bootstrap 5 design system
- Responsive layout for all devices
- Interactive data tables with filtering and sorting
- Charts and analytics
- Intuitive navigation and user experience
- Role-based access control

### 🔧 Technical Features
- JWT-based authentication
- RESTful API architecture
- MongoDB database with optimized schemas
- Comprehensive error handling
- Security middleware and validation

## Tech Stack

### Frontend
- React 18 with JavaScript
- Bootstrap 5 for components
- React Router for navigation
- Axios for API calls
- Chart.js for data visualization

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- Express validators for input validation
- CORS and security middleware

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

2. **Environment Setup**
   The project includes a `.env` file in the root directory with the following settings:
   ```env
   MONGODB_URI=mongodb://localhost:27017/event-management
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   CLIENT_URL=http://localhost:3000
   NODE_ENV=development
   PORT=5000
   ```
   You can modify these settings as needed for your environment.

3. **Database Setup**
   Make sure MongoDB is installed and running on your system.
   
   For Windows:
   ```
   mongod
   ```
   
   For macOS/Linux:
   ```
   sudo service mongod start
   ```
   
   The application will automatically connect to the MongoDB instance defined in your `.env` file.

4. **Quick Start with Scripts**
   
   **For Windows users:**
   ```
   start.bat
   ```
   
   **For PowerShell users:**
   ```
   .\start.ps1
   ```
   
   **For macOS/Linux users:**
   ```
   bash start.sh
   ```
   
   Or start manually with:
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start them separately:
   # Backend only
   npm run server
   
   # Frontend only
   npm run client
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Default Login Credentials

After starting the application, you can register a new account or use these default credentials:

- **Email**: admin@eventpro.com
- **Password**: admin123

## Project Structure

```
event-management-system1/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   └── App.tsx         # Main app component
│   └── package.json
├── server/                 # Node.js backend
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   └── index.js            # Server entry point
├── package.json            # Root package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create event
- `GET /api/events/:id` - Get event details
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Clients
- `GET /api/clients` - Get all clients
- `POST /api/clients` - Create client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Vendors
- `GET /api/vendors` - Get all vendors
- `POST /api/vendors` - Create vendor
- `PUT /api/vendors/:id` - Update vendor
- `DELETE /api/vendors/:id` - Delete vendor

### Staff
- `GET /api/staff` - Get all staff
- `POST /api/staff` - Create staff member
- `PUT /api/staff/:id` - Update staff member
- `DELETE /api/staff/:id` - Delete staff member

### Payments
- `GET /api/payments` - Get all payments
- `POST /api/payments` - Create payment
- `PUT /api/payments/:id` - Update payment
- `DELETE /api/payments/:id` - Delete payment

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## Features Overview

### Dashboard
- Real-time statistics and metrics
- Event trends and analytics
- Recent events and upcoming events
- Revenue tracking and financial overview

### Event Management
- Create and manage events with detailed information
- Event types: Conference, Seminar, Workshop, Meeting, Exhibition, Trade Show, Webinar, Virtual, Hybrid
- Venue management and location tracking
- Capacity management and registration tracking
- Vendor and staff assignment
- Budget planning and tracking

### Client Management
- Company information and contact details
- Industry classification and company size
- Event history and spending tracking
- Client status management (Active, Prospect, Inactive, Blacklisted)

### Vendor Management
- Service provider information
- Service categories and pricing
- Rating and review system
- Availability and scheduling
- Portfolio and certification tracking

### Staff Management
- Team member profiles and roles
- Permission management
- Activity tracking and last login
- Role-based access control (Admin, Manager, Staff)

### Payment Management
- Payment tracking and processing
- Multiple payment methods support
- Invoice and receipt management
- Financial reporting and analytics
- Refund and adjustment handling

## Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Input validation and sanitization
- CORS protection
- Rate limiting
- Helmet security headers
- Role-based access control

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Built with ❤️ for efficient event management**

BY ABISHEK K G

