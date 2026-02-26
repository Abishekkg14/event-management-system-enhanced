import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ThreeBackground from '../components/ThreeBackground';

function SignUp() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '',
    confirmPassword: '', phone: '', role: 'Attendee'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const checkApi = async () => {
      try {
        const res = await fetch(`${API}/api/health`);
        if (!res.ok) setError('Backend API is not reachable.');
      } catch {
        setError('Cannot reach backend API. Start the server on port 5000.');
      }
    };
    checkApi();
  }, [API]);

  const checkPasswordStrength = (password) => {
    let s = 0;
    if (password.length >= 6) s++;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[a-z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'password') setPasswordStrength(checkPasswordStrength(value));
  };

  const validateForm = () => {
    const { firstName, lastName, email, password, confirmPassword } = formData;
    if (!firstName.trim()) { setError('First name is required'); return false; }
    if (!lastName.trim()) { setError('Last name is required'); return false; }
    if (!email.trim()) { setError('Email is required'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email'); return false; }
    if (!password) { setError('Password is required'); return false; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return false; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName.trim(), lastName: formData.lastName.trim(),
          email: formData.email.trim(), password: formData.password,
          phone: formData.phone.trim(), role: formData.role
        }),
      });
      let data = {};
      try { data = await response.json(); } catch { }
      if (response.ok && data?.token && data?.user) {
        localStorage.setItem('token', data.token);
        login({ id: data.user.id, email: data.user.email, firstName: data.user.firstName, lastName: data.user.lastName, role: data.user.role, avatar: data.user.avatar || '' }, true);
      } else {
        setError(data?.message || `Registration failed (${response.status})`);
      }
    } catch {
      setError('Unable to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const strengthColor = passwordStrength <= 2 ? 'danger' : passwordStrength <= 4 ? 'warning' : 'success';
  const strengthText = passwordStrength <= 2 ? 'Weak' : passwordStrength <= 4 ? 'Medium' : 'Strong';

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-web" style={{ position: 'relative', overflow: 'hidden' }}>
      <ThreeBackground />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 480, padding: '0 1rem' }}
      >
        <div className="premium-card" style={{ padding: '2rem', borderRadius: 24 }}>
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
              <i className="bi bi-person-plus text-white" style={{ fontSize: '1.5rem' }}></i>
            </motion.div>
            <h3 className="fw-bold text-dark mb-1">Create Account</h3>
            <p className="text-secondary mb-0" style={{ fontSize: '0.95rem' }}>Join EventPro today</p>
          </div>

          {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="alert alert-danger py-2" style={{ fontSize: '0.85rem' }}>{error}</motion.div>}

          <form onSubmit={handleSubmit}>
            <div className="row g-2 mb-3">
              <div className="col-6">
                <label className="form-label fw-medium text-secondary" style={{ fontSize: '0.9rem' }}>First Name</label>
                <input type="text" className="form-control shadow-sm" name="firstName" placeholder="First name" value={formData.firstName} onChange={handleInputChange} required />
              </div>
              <div className="col-6">
                <label className="form-label fw-medium text-secondary" style={{ fontSize: '0.9rem' }}>Last Name</label>
                <input type="text" className="form-control shadow-sm" name="lastName" placeholder="Last name" value={formData.lastName} onChange={handleInputChange} required />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-medium text-secondary" style={{ fontSize: '0.9rem' }}>Email</label>
              <div className="input-group shadow-sm">
                <span className="input-group-text bg-white border-end-0 text-secondary"><i className="bi bi-envelope"></i></span>
                <input type="email" className="form-control border-start-0 ps-0" name="email" placeholder="name@example.com" value={formData.email} onChange={handleInputChange} required />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-medium text-secondary" style={{ fontSize: '0.9rem' }}>Phone</label>
              <div className="input-group shadow-sm">
                <span className="input-group-text bg-white border-end-0 text-secondary"><i className="bi bi-phone"></i></span>
                <input type="tel" className="form-control border-start-0 ps-0" name="phone" placeholder="Phone number" value={formData.phone} onChange={handleInputChange} />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-medium text-secondary" style={{ fontSize: '0.9rem' }}>Role</label>
              <select className="form-select shadow-sm" name="role" value={formData.role} onChange={handleInputChange}>
                <option value="Attendee">Attendee</option>
                <option value="Organizer">Organizer</option>
                <option value="Client">Client</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label fw-medium text-secondary" style={{ fontSize: '0.9rem' }}>Password</label>
              <div className="input-group shadow-sm">
                <span className="input-group-text bg-white border-end-0 text-secondary"><i className="bi bi-lock"></i></span>
                <input type={showPassword ? 'text' : 'password'} className="form-control border-start-0 border-end-0 ps-0" name="password" placeholder="Create a password" value={formData.password} onChange={handleInputChange} required />
                <button type="button" className="input-group-text bg-white border-start-0 text-secondary" onClick={() => setShowPassword(!showPassword)} style={{ cursor: 'pointer' }}>
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
              {formData.password && (
                <div className="mt-2">
                  <div className="progress" style={{ height: 4 }}>
                    <div className={`progress-bar bg-${strengthColor}`} style={{ width: `${(passwordStrength / 6) * 100}%` }}></div>
                  </div>
                  <small className={`text-${strengthColor}`} style={{ fontSize: '0.75rem' }}>
                    Password strength: {strengthText}
                  </small>
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="form-label fw-medium text-secondary" style={{ fontSize: '0.9rem' }}>Confirm Password</label>
              <div className="input-group shadow-sm">
                <span className="input-group-text bg-white border-end-0 text-secondary"><i className="bi bi-lock-fill"></i></span>
                <input type="password" className="form-control border-start-0 ps-0" name="confirmPassword" placeholder="Confirm password" value={formData.confirmPassword} onChange={handleInputChange} required />
              </div>
            </div>

            <div className="d-grid">
              <motion.button type="submit" className="btn btn-primary py-2 shadow-sm" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Creating Account...</> : 'Create Account'}
              </motion.button>
            </div>
          </form>

          <div className="text-center mt-3">
            <p className="text-secondary mb-0" style={{ fontSize: '0.95rem' }}>
              Already have an account? <Link to="/login" className="text-primary text-decoration-none fw-medium">Sign in</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default SignUp;
