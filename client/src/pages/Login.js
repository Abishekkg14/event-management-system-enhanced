import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [apiOk, setApiOk] = useState(true);

  // Use a single backend base URL
  const backendBaseUrl = 'http://localhost:5000';

  useEffect(() => {
    const checkApi = async () => {
      try {
        const res = await fetch(`${backendBaseUrl}/api/health`);
        setApiOk(res.ok);
        if (!res.ok) setError('Backend API is not reachable. Please ensure the server is running on port 5000.');
      } catch (e) {
        setApiOk(false);
        setError('Cannot reach backend API. Start the server on port 5000.');
      }
    };
    checkApi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate form
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    if (!apiOk) {
      setError('Backend API is not reachable. Please start the server on port 5000.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${backendBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch (_) {
        // No JSON body
      }

      if (response.ok) {
        if (!data || !data.token || !data.user) {
          setError('Unexpected server response. Please try again.');
          return;
        }
        localStorage.setItem('token', data.token);
        login({
          id: data.user._id,
          email: data.user.email,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          role: data.user.role
        }, rememberMe);
      } else {
        const validationMsg = Array.isArray(data?.errors) ? data.errors.map(e => e.msg).join(', ') : '';
        const msg = data?.message || validationMsg || `Login failed (status ${response.status}).`;
        setError(msg);
      }
    } catch (error) {
      setError('Unable to connect to server. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid bg-light min-vh-100 d-flex align-items-center justify-content-center py-5">
      <div className="row justify-content-center w-100">
        <div className="col-12 col-md-8 col-lg-6 col-xl-4">
          <div className="card shadow-lg border-0">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold text-primary">Event Management System</h2>
                <p className="text-muted">Sign in to your account</p>
              </div>
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email address</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-envelope"></i>
                    </span>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-lock"></i>
                    </span>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="rememberMe">
                      Remember me
                    </label>
                  </div>
                  <a href="#" className="text-decoration-none" onClick={(e) => e.preventDefault()}>Forgot password?</a>
                </div>
                
                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-primary py-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </div>
              </form>
              
              <div className="text-center mt-4">
                <p className="text-muted">
                  Please use your registered credentials to login
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-3">
            <p className="text-muted">
              Don't have an account? <Link to="/signup" className="text-decoration-none">Sign up here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
