import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './components/NotificationSystem';
import { motion } from 'framer-motion';
import ThreeBackground from './components/ThreeBackground';

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

const features = [
  { icon: 'bi-calendar-event', title: 'Event Planning', desc: 'Create, schedule, and manage events from start to finish with powerful tools.', color: '#6C63FF' },
  { icon: 'bi-people', title: 'Client Management', desc: 'Track client relationships, preferences, and history in one place.', color: '#2CB67D' },
  { icon: 'bi-shop', title: 'Vendor Network', desc: 'Coordinate with vendors, manage contracts, and track deliverables.', color: '#00D2FF' },
  { icon: 'bi-graph-up-arrow', title: 'Analytics & Reports', desc: 'Real-time dashboards with revenue trends, event stats, and insights.', color: '#FFB347' },
  { icon: 'bi-credit-card-2-front', title: 'Payment Tracking', desc: 'Track invoices, process payments, and manage budgets effortlessly.', color: '#FF6584' },
  { icon: 'bi-person-badge', title: 'Staff Coordination', desc: 'Assign roles, manage schedules, and coordinate your team efficiently.', color: '#8B83FF' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: [0.4, 0, 0.2, 1] } })
};

function HomePage() {
  return (
    <div style={{ minHeight: '100vh', overflow: 'hidden', position: 'relative' }}>
      <ThreeBackground />
      <div className="container" style={{ paddingTop: '8rem', paddingBottom: '6rem', position: 'relative', zIndex: 1 }}>
        <motion.div
          className="text-center mb-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{
              width: 80, height: 80, borderRadius: 20, margin: '0 auto 1.5rem',
              background: 'var(--primary-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <i className="bi bi-calendar2-event" style={{ fontSize: '2.2rem', color: 'var(--primary)' }}></i>
          </motion.div>
          <h1 className="fw-bold mb-3" style={{ fontSize: '3.5rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            EventPro
          </h1>
          <p className="mx-auto mb-4" style={{
            maxWidth: 600, fontSize: '1.25rem', color: 'var(--text-secondary)', lineHeight: 1.6
          }}>
            The all-in-one event management platform. Plan, coordinate, and deliver unforgettable experiences with powerful tools at your fingertips.
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link to="/signup">
              <motion.button
                className="btn btn-primary px-4 py-2"
                whileHover={{ scale: 1.05, boxShadow: '0 8px 30px rgba(108,99,255,0.45)' }}
                whileTap={{ scale: 0.97 }}
                style={{ fontSize: '1rem', fontWeight: 600 }}
              >
                <i className="bi bi-rocket-takeoff me-2"></i>Get Started Free
              </motion.button>
            </Link>
            <Link to="/login">
              <motion.button
                className="btn btn-outline-primary px-4 py-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                style={{ fontSize: '1rem', fontWeight: 600 }}
              >
                Sign In
              </motion.button>
            </Link>
          </div>
        </motion.div>

        <div className="row g-4 mt-5">
          {features.map((f, i) => (
            <div className="col-md-6 col-lg-4" key={f.title}>
              <motion.div
                className="premium-card h-100"
                style={{ padding: '2.5rem', cursor: 'default' }}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: 12, marginBottom: '1.5rem',
                  background: 'var(--primary-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <i className={`bi ${f.icon}`} style={{ fontSize: '1.4rem', color: 'var(--primary)' }}></i>
                </div>
                <h5 className="fw-bold mb-3" style={{ fontSize: '1.15rem' }}>{f.title}</h5>
                <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  {f.desc}
                </p>
              </motion.div>
            </div>
          ))}
        </div>

        <motion.div
          className="text-center mt-5 pt-5"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="premium-card" style={{ padding: '3.5rem 2rem', maxWidth: 800, margin: '0 auto', background: 'var(--bg-section)' }}>
            <h3 className="fw-bold mb-3" style={{ letterSpacing: '-0.02em' }}>Ready to elevate your events?</h3>
            <p className="text-secondary mb-4" style={{ fontSize: '1.1rem', maxWidth: 500, margin: '0 auto' }}>
              Join thousands of event professionals who trust EventPro for seamless event management.
            </p>
            <Link to="/dashboard">
              <motion.button
                className="btn btn-primary px-5 py-3"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ fontSize: '1.1rem' }}
              >
                <i className="bi bi-grid-1x2 me-2"></i>Go to Dashboard
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>


    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingPage />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  return children;
}

function LoadingPage() {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
}

function AppContent() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/events" element={<ProtectedRoute><Layout><Events /></Layout></ProtectedRoute>} />
      <Route path="/events/:id" element={<ProtectedRoute><Layout><EventDetails /></Layout></ProtectedRoute>} />
      <Route path="/clients" element={<ProtectedRoute><Layout><Clients /></Layout></ProtectedRoute>} />
      <Route path="/vendors" element={<ProtectedRoute><Layout><Vendors /></Layout></ProtectedRoute>} />
      <Route path="/staff" element={<ProtectedRoute><Layout><Staff /></Layout></ProtectedRoute>} />
      <Route path="/payments" element={<ProtectedRoute><Layout><Payments /></Layout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Layout><ProfileSettings /></Layout></ProtectedRoute>} />
      <Route path="/map-test" element={<ProtectedRoute><Layout><MapTest /></Layout></ProtectedRoute>} />
      <Route path="/data-viewer" element={<ProtectedRoute><Layout><DataViewer /></Layout></ProtectedRoute>} />
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
