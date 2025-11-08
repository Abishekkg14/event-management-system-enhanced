import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';

function ProfileSettings() {
  const { currentUser, login } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    avatar: '',
    bio: '',
    dateOfBirth: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: ''
    },
    socialLinks: {
      website: '',
      linkedin: '',
      twitter: ''
    }
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  const backendBaseUrl = 'http://localhost:5000';
  useEffect(() => {
    if (currentUser) {
      setFormData({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        avatar: currentUser.avatar || '',
        bio: currentUser.bio || '',
        dateOfBirth: currentUser.dateOfBirth ? new Date(currentUser.dateOfBirth).toISOString().split('T')[0] : '',
        address: {
          street: currentUser.address?.street || '',
          city: currentUser.address?.city || '',
          state: currentUser.address?.state || '',
          country: currentUser.address?.country || '',
          zipCode: currentUser.address?.zipCode || ''
        },
        socialLinks: {
          website: currentUser.socialLinks?.website || '',
          linkedin: currentUser.socialLinks?.linkedin || '',
          twitter: currentUser.socialLinks?.twitter || ''
        }
      });
    }
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size must be less than 2MB');
        return;
      }
      
      setImageLoading(true);
      setError('');
      
      // Convert file to base64 for storage
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target.result;
        console.log('Image size:', base64String.length, 'characters');
        
        // Check if base64 string is too large (over 1MB)
        if (base64String.length > 1024 * 1024) {
          setError('Image is too large. Please choose a smaller image.');
          setImageLoading(false);
          return;
        }
        
        setFormData(prev => ({
          ...prev,
          avatar: base64String
        }));
        setImageLoading(false);
        setSuccess('Image uploaded successfully! Click "Update Profile" to save changes.');
      };
      reader.onerror = () => {
        setError('Failed to read the image file');
        setImageLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('First name and last name are required');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in again.');
        setLoading(false);
        return;
      }

      // Prepare data for sending
      const updateData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone?.trim() || '',
        bio: formData.bio?.trim() || '',
        dateOfBirth: formData.dateOfBirth || '',
        address: formData.address || {},
        socialLinks: formData.socialLinks || {}
      };

      // Only include avatar if it's not empty and not the default placeholder
      if (formData.avatar && !formData.avatar.includes('data:image/svg+xml')) {
        updateData.avatar = formData.avatar;
      }

      console.log('Sending profile update:', {
        ...updateData,
        avatar: updateData.avatar ? `${updateData.avatar.substring(0, 50)}...` : 'No avatar'
      });

      const response = await fetch(`${backendBaseUrl}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();
      console.log('Profile update response:', data);

      if (response.ok) {
        setSuccess('Profile updated successfully! Your changes have been saved.');
        // Update the current user in context
        login({
          ...currentUser,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          phone: data.user.phone,
          avatar: data.user.avatar,
          bio: data.user.bio,
          dateOfBirth: data.user.dateOfBirth,
          address: data.user.address,
          socialLinks: data.user.socialLinks
        }, true);
      } else {
        console.error('Profile update failed:', data);
        setError(data.message || data.errors?.[0]?.msg || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError('All password fields are required');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    setPasswordLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendBaseUrl}/api/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Password changed successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setError(data.message || 'Failed to change password');
      }
    } catch (error) {
      setError('Unable to connect to server. Please try again.');
      console.error('Password change error:', error);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-0">Profile Settings</h2>
              <p className="text-muted mb-0">
                Manage your personal information and preferences
                {currentUser && (
                  <span className="ms-2">
                    - Welcome back, <strong>{currentUser.firstName || currentUser.email}</strong>!
                  </span>
                )}
              </p>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success" role="alert">
              {success}
            </div>
          )}

          {/* Profile Summary Card */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-auto">
                  <img
                    src={currentUser?.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjQwIiBjeT0iMzAiIHI9IjE1IiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0yMCA2MEMyMCA1NS41ODE3IDIzLjU4MTcgNTIgMjggNTJINjBDNjQuNDE4MyA1MiA2OCA1NS41ODE3IDY4IDYwVjYwSDIwVjYwWiIgZmlsbD0iIzlDQTNBRiIvPgo8dGV4dCB4PSI0MCIgeT0iNzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzY5NzA4MCI+Tm8gUGhvdG88L3RleHQ+Cjwvc3ZnPgo='}
                    alt="Profile"
                    className="rounded-circle border"
                    style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjQwIiBjeT0iMzAiIHI9IjE1IiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0yMCA2MEMyMCA1NS41ODE3IDIzLjU4MTcgNTIgMjggNTJINjBDNjQuNDE4MyA1MiA2OCA1NS41ODE3IDY4IDYwVjYwSDIwVjYwWiIgZmlsbD0iIzlDQTNBRiIvPgo8dGV4dCB4PSI0MCIgeT0iNzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzY5NzA4MCI+Tm8gUGhvdG88L3RleHQ+Cjwvc3ZnPgo=';
                    }}
                  />
                </div>
                <div className="col">
                  <h5 className="mb-1">
                    {currentUser?.firstName && currentUser?.lastName 
                      ? `${currentUser.firstName} ${currentUser.lastName}`
                      : currentUser?.email || 'User'
                    }
                  </h5>
                  <p className="text-muted mb-1">{currentUser?.email}</p>
                  <p className="text-muted mb-0">
                    <span className="badge bg-primary me-2">{currentUser?.role || 'staff'}</span>
                    {currentUser?.phone && <span className="me-2"><i className="bi bi-telephone me-1"></i>{currentUser.phone}</span>}
                  </p>
                </div>
                <div className="col-auto">
                  <span className="text-success">
                    <i className="bi bi-check-circle me-1"></i>
                    Profile Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <ul className="nav nav-tabs card-header-tabs" id="profileTabs" role="tablist">
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                    type="button"
                  >
                    <i className="bi bi-person me-2"></i>Profile Information
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === 'password' ? 'active' : ''}`}
                    onClick={() => setActiveTab('password')}
                    type="button"
                  >
                    <i className="bi bi-lock me-2"></i>Change Password
                  </button>
                </li>
              </ul>
            </div>

            <div className="card-body">
              {activeTab === 'profile' && (
                <form onSubmit={handleProfileUpdate}>
                  <div className="row">
                    <div className="col-md-4 text-center mb-4">
                      <div className="position-relative d-inline-block">
                        <img
                          src={formData.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9Ijc1IiBjeT0iNTUiIHI9IjI4IiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0zNy41IDExMi41QzM3LjUgMTA0LjE2IDQ0LjE2IDk3LjUgNTIuNSA5Ny41SDk3LjVDMTA1Ljg0IDk3LjUgMTEyLjUgMTA0LjE2IDExMi41IDExMi41VjExMi41SDM3LjVWMTEyLjVaIiBmaWxsPSIjOUNBM0FGIi8+Cjx0ZXh0IHg9Ijc1IiB5PSIxMzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY5NzA4MCI+Tm8gUGhvdG88L3RleHQ+Cjwvc3ZnPgo='}
                          alt="Profile"
                          className="rounded-circle border"
                          style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9Ijc1IiBjeT0iNTUiIHI9IjI4IiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0zNy41IDExMi41QzM3LjUgMTA0LjE2IDQ0LjE2IDk3LjUgNTIuNSA5Ny41SDk3LjVDMTA1Ljg0IDk3LjUgMTEyLjUgMTA0LjE2IDExMi41IDExMi41VjExMi41SDM3LjVWMTEyLjVaIiBmaWxsPSIjOUNBM0FGIi8+Cjx0ZXh0IHg9Ijc1IiB5PSIxMzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY5NzA4MCI+Tm8gUGhvdG88L3RleHQ+Cjwvc3ZnPgo=';
                          }}
                        />
                        <label
                          className={`btn btn-primary btn-sm position-absolute ${imageLoading ? 'disabled' : ''}`}
                          style={{ bottom: '10px', right: '10px' }}
                          htmlFor="avatarUpload"
                          title="Upload new photo"
                        >
                          {imageLoading ? (
                            <div className="spinner-border spinner-border-sm" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                          ) : (
                            <i className="bi bi-camera"></i>
                          )}
                        </label>
                        {formData.avatar && (
                          <button
                            type="button"
                            className="btn btn-danger btn-sm position-absolute"
                            style={{ bottom: '10px', left: '10px' }}
                            onClick={() => setFormData(prev => ({ ...prev, avatar: '' }))}
                            title="Remove photo"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        )}
                        <input
                          type="file"
                          id="avatarUpload"
                          className="d-none"
                          accept="image/*"
                          onChange={handleFileUpload}
                        />
                      </div>
                      <p className="text-muted mt-2">
                        Click the camera icon to upload a new photo
                        <br />
                        <small>Max size: 5MB, JPG/PNG/GIF</small>
                      </p>
                    </div>

                    <div className="col-md-8">
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="firstName" className="form-label">First Name *</label>
                          <input
                            type="text"
                            className="form-control"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                          />
                        </div>

                        <div className="col-md-6 mb-3">
                          <label htmlFor="lastName" className="form-label">Last Name *</label>
                          <input
                            type="text"
                            className="form-control"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email Address</label>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          name="email"
                          value={formData.email}
                          disabled
                        />
                        <div className="form-text">Email cannot be changed. Contact administrator if needed.</div>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="phone" className="form-label">Phone Number</label>
                        <input
                          type="tel"
                          className="form-control"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Enter phone number"
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Role</label>
                        <input
                          type="text"
                          className="form-control"
                          value={currentUser?.role || ''}
                          disabled
                        />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="bio" className="form-label">Bio</label>
                        <textarea
                          className="form-control"
                          id="bio"
                          name="bio"
                          rows="3"
                          value={formData.bio}
                          onChange={handleInputChange}
                          placeholder="Tell us about yourself..."
                          maxLength="500"
                        ></textarea>
                        <div className="form-text">{formData.bio.length}/500 characters</div>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="dateOfBirth" className="form-label">Date of Birth</label>
                        <input
                          type="date"
                          className="form-control"
                          id="dateOfBirth"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                        />
                      </div>

                      <h6 className="mt-4 mb-3">Address Information</h6>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="street" className="form-label">Street Address</label>
                          <input
                            type="text"
                            className="form-control"
                            id="street"
                            name="address.street"
                            value={formData.address.street}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              address: { ...prev.address, street: e.target.value }
                            }))}
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label htmlFor="city" className="form-label">City</label>
                          <input
                            type="text"
                            className="form-control"
                            id="city"
                            name="address.city"
                            value={formData.address.city}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              address: { ...prev.address, city: e.target.value }
                            }))}
                          />
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-4 mb-3">
                          <label htmlFor="state" className="form-label">State</label>
                          <input
                            type="text"
                            className="form-control"
                            id="state"
                            name="address.state"
                            value={formData.address.state}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              address: { ...prev.address, state: e.target.value }
                            }))}
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label htmlFor="country" className="form-label">Country</label>
                          <input
                            type="text"
                            className="form-control"
                            id="country"
                            name="address.country"
                            value={formData.address.country}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              address: { ...prev.address, country: e.target.value }
                            }))}
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label htmlFor="zipCode" className="form-label">ZIP Code</label>
                          <input
                            type="text"
                            className="form-control"
                            id="zipCode"
                            name="address.zipCode"
                            value={formData.address.zipCode}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              address: { ...prev.address, zipCode: e.target.value }
                            }))}
                          />
                        </div>
                      </div>

                      <h6 className="mt-4 mb-3">Social Links</h6>
                      <div className="row">
                        <div className="col-md-4 mb-3">
                          <label htmlFor="website" className="form-label">Website</label>
                          <input
                            type="url"
                            className="form-control"
                            id="website"
                            name="socialLinks.website"
                            value={formData.socialLinks.website}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              socialLinks: { ...prev.socialLinks, website: e.target.value }
                            }))}
                            placeholder="https://yourwebsite.com"
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label htmlFor="linkedin" className="form-label">LinkedIn</label>
                          <input
                            type="url"
                            className="form-control"
                            id="linkedin"
                            name="socialLinks.linkedin"
                            value={formData.socialLinks.linkedin}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              socialLinks: { ...prev.socialLinks, linkedin: e.target.value }
                            }))}
                            placeholder="https://linkedin.com/in/yourprofile"
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label htmlFor="twitter" className="form-label">Twitter</label>
                          <input
                            type="url"
                            className="form-control"
                            id="twitter"
                            name="socialLinks.twitter"
                            value={formData.socialLinks.twitter}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              socialLinks: { ...prev.socialLinks, twitter: e.target.value }
                            }))}
                            placeholder="https://twitter.com/yourhandle"
                          />
                        </div>
                      </div>

                      <div className="d-flex justify-content-end">
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Updating...
                            </>
                          ) : (
                            'Update Profile'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              )}

              {activeTab === 'password' && (
                <form onSubmit={handlePasswordChange}>
                  <div className="row justify-content-center">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="currentPassword" className="form-label">Current Password *</label>
                        <input
                          type="password"
                          className="form-control"
                          id="currentPassword"
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordInputChange}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="newPassword" className="form-label">New Password *</label>
                        <input
                          type="password"
                          className="form-control"
                          id="newPassword"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordInputChange}
                          required
                          minLength="6"
                        />
                        <div className="form-text">Password must be at least 6 characters long</div>
                      </div>

                      <div className="mb-4">
                        <label htmlFor="confirmPassword" className="form-label">Confirm New Password *</label>
                        <input
                          type="password"
                          className="form-control"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordInputChange}
                          required
                        />
                      </div>

                      <div className="d-flex justify-content-end">
                        <button
                          type="submit"
                          className="btn btn-warning"
                          disabled={passwordLoading}
                        >
                          {passwordLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Changing...
                            </>
                          ) : (
                            'Change Password'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileSettings;
