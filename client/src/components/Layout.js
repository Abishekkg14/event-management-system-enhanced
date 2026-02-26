import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: 'bi-grid-1x2' },
  { path: '/events', label: 'Events', icon: 'bi-calendar-event' },
  { path: '/clients', label: 'Clients', icon: 'bi-people' },
  { path: '/vendors', label: 'Vendors', icon: 'bi-shop' },
  { path: '/staff', label: 'Staff', icon: 'bi-person-badge' },
  { path: '/payments', label: 'Payments', icon: 'bi-credit-card-2-front' },
];

const adminItems = [
  { path: '/data-viewer', label: 'Data Viewer', icon: 'bi-database' },
];

function Layout({ children }) {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (location.pathname === '/login' || location.pathname === '/signup') {
    return children;
  }

  const isActive = (path) => {
    if (path === '/events') return location.pathname.includes('/events');
    return location.pathname === path;
  };

  const displayName = currentUser?.firstName && currentUser?.lastName
    ? `${currentUser.firstName} ${currentUser.lastName}`
    : currentUser?.email || 'User';

  const initials = currentUser?.firstName && currentUser?.lastName
    ? `${currentUser.firstName[0]}${currentUser.lastName[0]}`
    : (currentUser?.email?.[0] || 'U').toUpperCase();

  return (
    <div className="d-flex flex-column min-vh-100">
      <nav className="navbar navbar-expand-lg sticky-top" style={{ zIndex: 1030 }}>
        <div className="container-fluid px-3 px-lg-4">
          <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <i className="bi bi-calendar2-event text-white" style={{ fontSize: '1rem' }}></i>
            </div>
            <span style={{ fontSize: '1.2rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>EventPro</span>
          </Link>

          <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="mainNav">
            <ul className="navbar-nav mx-auto gap-1">
              {navItems.map(item => (
                <li className="nav-item" key={item.path}>
                  <Link
                    className={`nav-link d-flex align-items-center gap-2 ${isActive(item.path) ? 'active' : ''}`}
                    to={item.path}
                  >
                    <i className={`bi ${item.icon}`} style={{ fontSize: '0.9rem' }}></i>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
              {currentUser?.role === 'admin' && adminItems.map(item => (
                <li className="nav-item" key={item.path}>
                  <Link
                    className={`nav-link d-flex align-items-center gap-2 ${isActive(item.path) ? 'active' : ''}`}
                    to={item.path}
                  >
                    <i className={`bi ${item.icon}`} style={{ fontSize: '0.9rem' }}></i>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <ul className="navbar-nav ms-auto">
              <li className="nav-item dropdown" ref={dropdownRef}>
                <button
                  className="nav-link btn btn-link d-flex align-items-center gap-2 p-1"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{ border: 'none', background: 'none', color: 'inherit' }}
                >
                  {currentUser?.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt="Profile"
                      className="rounded-circle"
                      style={{
                        width: 34, height: 34, objectFit: 'cover',
                        border: '2px solid var(--border-color)'
                      }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%',
                      background: 'var(--primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.8rem', fontWeight: 600, color: '#fff'
                    }}>
                      {initials}
                    </div>
                  )}
                  <span className="d-none d-md-inline" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {displayName}
                  </span>
                  <i className="bi bi-chevron-down" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}></i>
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.ul
                      className="dropdown-menu dropdown-menu-end show"
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      style={{ display: 'block', minWidth: '220px', border: '1px solid var(--border-color)', boxShadow: '0 10px 40px rgba(15, 30, 58, 0.08)' }}
                    >
                      <li className="dropdown-header d-flex flex-column align-items-center text-center gap-2 py-3">
                        {currentUser?.avatar ? (
                          <img
                            src={currentUser.avatar}
                            alt="Profile"
                            className="rounded-circle"
                            style={{ width: 40, height: 40, objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{
                            width: 48, height: 48, borderRadius: '50%',
                            background: 'var(--primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.2rem', fontWeight: 600, color: '#fff'
                          }}>
                            {initials}
                          </div>
                        )}
                        <div>
                          <div className="fw-bold" style={{ fontSize: '0.875rem' }}>{displayName}</div>
                          <small className="text-muted">{currentUser?.email}</small>
                        </div>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <Link className="dropdown-item d-flex align-items-center gap-2" to="/profile" onClick={() => setDropdownOpen(false)}>
                          <i className="bi bi-person"></i> Profile Settings
                        </Link>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <button
                          className="dropdown-item d-flex align-items-center gap-2 text-danger"
                          onClick={() => { setDropdownOpen(false); logout(); }}
                          style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left' }}
                        >
                          <i className="bi bi-box-arrow-right"></i> Logout
                        </button>
                      </li>
                    </motion.ul>
                  )}
                </AnimatePresence>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <main className="flex-grow-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="container-fluid px-3 px-lg-4 py-4"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="py-4 text-center" style={{ fontSize: '0.85rem', background: 'var(--bg-section)', borderTop: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
        <div className="container">
          <p className="mb-0">
            EventPro &copy; {new Date().getFullYear()} &middot; Designed for excellence.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
