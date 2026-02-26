import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ThreeBackground from '../components/ThreeBackground';

function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const backendBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const checkApi = async () => {
      try {
        const res = await fetch(`${backendBaseUrl}/api/health`);
        if (!res.ok) setError('Backend API is not reachable. Ensure the server is running.');
      } catch {
        setError('Cannot reach backend API. Start the server on port 5000.');
      }
    };
    checkApi();
  }, [backendBaseUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please enter both email and password'); return; }
    setLoading(true);
    try {
      const response = await fetch(`${backendBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      let data = {};
      try { data = await response.json(); } catch { }
      if (response.ok && data?.token && data?.user) {
        localStorage.setItem('token', data.token);
        login({ id: data.user._id, email: data.user.email, firstName: data.user.firstName, lastName: data.user.lastName, role: data.user.role, avatar: data.user.avatar }, rememberMe);
      } else {
        setError(data?.message || `Login failed (${response.status})`);
      }
    } catch {
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-web" style={{ position: 'relative', overflow: 'hidden' }}>
      <ThreeBackground />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420, padding: '0 1rem' }}
      >
        <div className="premium-card" style={{ padding: '2.5rem', borderRadius: 24 }}>
          <div className="text-center mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              style={{
                width: 56, height: 56, borderRadius: 16, margin: '0 auto 1rem',
                background: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <i className="bi bi-calendar2-event text-white" style={{ fontSize: '1.5rem' }}></i>
            </motion.div>
            <h3 className="fw-bold text-dark mb-1">EventPro</h3>
            <p className="text-secondary mb-0" style={{ fontSize: '0.95rem' }}>Sign in to your account</p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="alert alert-danger py-2" style={{ fontSize: '0.85rem' }}>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-medium text-secondary" style={{ fontSize: '0.9rem' }}>Email</label>
              <div className="input-group shadow-sm">
                <span className="input-group-text bg-white border-end-0 text-secondary"><i className="bi bi-envelope"></i></span>
                <input type="email" className="form-control border-start-0 ps-0" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label fw-medium text-secondary" style={{ fontSize: '0.9rem' }}>Password</label>
              <div className="input-group shadow-sm">
                <span className="input-group-text bg-white border-end-0 text-secondary"><i className="bi bi-lock"></i></span>
                <input type={showPassword ? 'text' : 'password'} className="form-control border-start-0 border-end-0 ps-0" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" className="input-group-text bg-white border-start-0 text-secondary" onClick={() => setShowPassword(!showPassword)} style={{ cursor: 'pointer' }}>
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="rememberMe" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                <label className="form-check-label text-secondary" htmlFor="rememberMe" style={{ fontSize: '0.9rem' }}>Remember me</label>
              </div>
            </div>
            <div className="d-grid">
              <motion.button
                type="submit"
                className="btn btn-primary py-2 shadow-sm"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <><span className="spinner-border spinner-border-sm me-2"></span>Signing in...</>
                ) : 'Sign In'}
              </motion.button>
            </div>
          </form>

          <div className="text-center mt-4">
            <p className="text-secondary mb-0" style={{ fontSize: '0.95rem' }}>
              Don't have an account? <Link to="/signup" className="text-primary text-decoration-none fw-medium">Sign up</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;
