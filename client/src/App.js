import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './components/NotificationSystem';

// Import pages as lazy components
const Dashboard = React.lazy(() => import('./pages/Dashboard.js'));
const Events = React.lazy(() => import('./pages/Events.js'));
const EventDetails = React.lazy(() => import('./pages/EventDetails.js'));
const Clients = React.lazy(() => import('./pages/Clients.js'));
const Vendors = React.lazy(() => import('./pages/Vendors.js'));
const Staff = React.lazy(() => import('./pages/Staff.js'));
const Login = React.lazy(() => import('./pages/Login.js'));
const SignUp = React.lazy(() => import('./pages/SignUp.js'));
const ProfileSettings = React.lazy(() => import('./pages/ProfileSettings.js'));
const MapTest = React.lazy(() => import('./components/MapTest.js'));
const Payments = React.lazy(() => import('./pages/Payments.js'));
const DataViewer = React.lazy(() => import('./pages/DataViewer.js'));

// HomePage Component
function HomePage() {
  return (
    <div className="container mt-5">
      <div className="text-center">
        <h1 className="display-4 text-primary mb-4">Event Management System</h1>
        <p className="lead mb-4">Welcome to your comprehensive event management solution</p>
        
        <div className="d-flex justify-content-center gap-3 mb-5">
          <Link to="/login" className="btn btn-outline-primary">Login</Link>
          <Link to="/signup" className="btn btn-outline-success">Sign Up</Link>
          <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
        </div>
        
        <div className="row justify-content-center mt-5">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header bg-light">
                <h5 className="mb-0">Available Pages</h5>
              </div>
              <ul className="list-group list-group-flush">
                <li className="list-group-item">
                  <Link to="/dashboard" className="text-decoration-none d-block py-2">Dashboard</Link>
                </li>
                <li className="list-group-item">
                  <Link to="/events" className="text-decoration-none d-block py-2">Events</Link>
                </li>
                <li className="list-group-item">
                  <Link to="/clients" className="text-decoration-none d-block py-2">Clients</Link>
                </li>
                <li className="list-group-item">
                  <Link to="/vendors" className="text-decoration-none d-block py-2">Vendors</Link>
                </li>
                <li className="list-group-item">
                  <Link to="/staff" className="text-decoration-none d-block py-2">Staff</Link>
                </li>
                <li className="list-group-item">
                  <Link to="/payments" className="text-decoration-none d-block py-2">Payments</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingPage />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
}

// Loading Component
function LoadingPage() {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
}

// Main App Component
function AppContent() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/events" element={
        <ProtectedRoute>
          <Layout>
            <Events />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/events/:id" element={
        <ProtectedRoute>
          <Layout>
            <EventDetails />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/clients" element={
        <ProtectedRoute>
          <Layout>
            <Clients />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/vendors" element={
        <ProtectedRoute>
          <Layout>
            <Vendors />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/staff" element={
        <ProtectedRoute>
          <Layout>
            <Staff />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/payments" element={
        <ProtectedRoute>
          <Layout>
            <Payments />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Layout>
            <ProfileSettings />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/map-test" element={
        <ProtectedRoute>
          <Layout>
            <MapTest />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/data-viewer" element={
        <ProtectedRoute>
          <Layout>
            <DataViewer />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <React.Suspense fallback={<LoadingPage />}>
        <NotificationProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </NotificationProvider>
      </React.Suspense>
    </Router>
  );
}

export default App;
