import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Add keyboard shortcut to clear all notifications (Ctrl+Shift+C)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'C') {
        clearAllNotifications();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addNotification = (notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: 'info', // 'success', 'error', 'warning', 'info'
      title: '',
      message: '',
      duration: 5000,
      ...notification
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto remove notification after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Convenience methods
  const showSuccess = (message, title = 'Success', duration = 5000) => {
    return addNotification({ type: 'success', title, message, duration });
  };

  const showError = (message, title = 'Error', duration = 7000) => {
    return addNotification({ type: 'error', title, message, duration });
  };

  const showWarning = (message, title = 'Warning', duration = 6000) => {
    return addNotification({ type: 'warning', title, message, duration });
  };

  const showInfo = (message, title = 'Info', duration = 5000) => {
    return addNotification({ type: 'info', title, message, duration });
  };

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

const NotificationContainer = () => {
  const { notifications, removeNotification, clearAllNotifications } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="position-fixed" style={{ top: '20px', right: '20px', zIndex: 9999 }}>
      {notifications.length > 1 && (
        <div className="mb-2">
          <button 
            className="btn btn-sm btn-outline-secondary"
            onClick={clearAllNotifications}
            style={{ fontSize: '12px' }}
          >
            Clear All ({notifications.length})
          </button>
        </div>
      )}
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>
  );
};

const NotificationItem = ({ notification, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(notification.id), 200);
  };

  const getAlertClass = () => {
    const baseClass = 'alert alert-dismissible fade';
    const visibilityClass = isVisible ? 'show' : '';
    
    switch (notification.type) {
      case 'success':
        return `${baseClass} alert-success ${visibilityClass}`;
      case 'error':
        return `${baseClass} alert-danger ${visibilityClass}`;
      case 'warning':
        return `${baseClass} alert-warning ${visibilityClass}`;
      default:
        return `${baseClass} alert-info ${visibilityClass}`;
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return 'bi-check-circle';
      case 'error':
        return 'bi-exclamation-triangle';
      case 'warning':
        return 'bi-exclamation-circle';
      default:
        return 'bi-info-circle';
    }
  };

  return (
    <div className={getAlertClass()} role="alert" style={{ minWidth: '300px', marginBottom: '10px' }}>
      <div className="d-flex align-items-start">
        <i className={`bi ${getIcon()} me-2 mt-1`}></i>
        <div className="flex-grow-1">
          {notification.title && (
            <h6 className="alert-heading mb-1">{notification.title}</h6>
          )}
          <p className="mb-0">{notification.message}</p>
        </div>
        <button
          type="button"
          className="btn-close"
          onClick={handleRemove}
          aria-label="Close"
          style={{ 
            cursor: 'pointer',
            fontSize: '16px',
            padding: '8px',
            margin: '-8px'
          }}
          title="Close notification"
        ></button>
      </div>
    </div>
  );
};

export default NotificationProvider;
