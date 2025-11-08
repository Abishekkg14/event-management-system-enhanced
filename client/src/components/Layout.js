import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function Layout({ children }) {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Check if current page is login
  if (location.pathname === '/login') {
    return children;
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
          <div className="container-fluid">
            <Link className="navbar-brand" to="/">Event Management System</Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav">
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`} 
                    to="/dashboard"
                  >
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${location.pathname.includes('/events') ? 'active' : ''}`} 
                    to="/events"
                  >
                    Events
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${location.pathname === '/clients' ? 'active' : ''}`} 
                    to="/clients"
                  >
                    Clients
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${location.pathname === '/vendors' ? 'active' : ''}`} 
                    to="/vendors"
                  >
                    Vendors
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${location.pathname === '/staff' ? 'active' : ''}`} 
                    to="/staff"
                  >
                    Staff
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${location.pathname === '/payments' ? 'active' : ''}`} 
                    to="/payments"
                  >
                    Payments
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${location.pathname === '/map-test' ? 'active' : ''}`} 
                    to="/map-test"
                  >
                    Map Test
                  </Link>
                </li>
                {currentUser?.role === 'admin' && (
                  <li className="nav-item">
                    <Link 
                      className={`nav-link ${location.pathname === '/data-viewer' ? 'active' : ''}`} 
                      to="/data-viewer"
                    >
                      Data Viewer
                    </Link>
                  </li>
                )}
              </ul>
              <ul className="navbar-nav ms-auto">
                <li className="nav-item dropdown" ref={dropdownRef}>
                  <button 
                    className="nav-link dropdown-toggle btn btn-link d-flex align-items-center" 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    style={{ border: 'none', background: 'none', color: 'inherit' }}
                  >
                    <img
                      src={currentUser?.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjE2IiBjeT0iMTIiIHI9IjYiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTggMjRDNCAyMCA0IDE2IDggMTZIMjRDMjggMTYgMjggMjAgMjggMjRWMjRIOFYyNFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+Cg=='}
                      alt="Profile"
                      className="rounded-circle me-2"
                      style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjE2IiBjeT0iMTIiIHI9IjYiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTggMjRDNCAyMCA0IDE2IDggMTZIMjRDMjggMTYgMjggMjAgMjggMjRWMjRIOFYyNFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+Cg==';
                      }}
                    />
                    <span className="d-none d-md-inline">{currentUser?.firstName && currentUser?.lastName ? `${currentUser.firstName} ${currentUser.lastName}` : currentUser?.email || 'User'}</span>
                    <span className="d-md-none">{currentUser?.firstName || currentUser?.email || 'User'}</span>
                  </button>
                  {dropdownOpen && (
                    <ul className="dropdown-menu dropdown-menu-end show" style={{ display: 'block' }}>
                      <li className="dropdown-header d-flex align-items-center">
                        <img
                          src={currentUser?.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjIwIiBjeT0iMTUiIHI9IjciIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTEwIDMwQzEwIDI1IDx0IDEwIDIwIDEwSDIwQzI1IDEwIDMwIDE1IDMwIDMwVjMwSDEwVjMwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K'}
                          alt="Profile"
                          className="rounded-circle me-2"
                          style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjIwIiBjeT0iMTUiIHI9IjciIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTEwIDMwQzEwIDI1IDx0IDEwIDIwIDEwSDIwQzI1IDEwIDMwIDE1IDMwIDMwVjMwSDEwVjMwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                          }}
                        />
                        <div>
                          <div className="fw-bold">
                            {currentUser?.firstName && currentUser?.lastName 
                              ? `${currentUser.firstName} ${currentUser.lastName}`
                              : currentUser?.email || 'User'
                            }
                          </div>
                          <small className="text-muted">{currentUser?.email}</small>
                        </div>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <Link 
                          className="dropdown-item" 
                          to="/profile"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <i className="bi bi-person me-2"></i> Profile Settings
                        </Link>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <button 
                          className="dropdown-item" 
                          onClick={() => {
                            setDropdownOpen(false);
                            logout();
                          }}
                          style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left' }}
                        >
                          <i className="bi bi-box-arrow-right me-2"></i> Logout
                        </button>
                      </li>
                    </ul>
                  )}
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </div>

      <div className="container mt-4">
        {children}
      </div>

      <footer className="mt-5 py-3 bg-light text-center">
        <div className="container">
          <p className="mb-1">© 2023 Event Management System</p>
          <p className="text-muted small">Version 1.0.0</p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
