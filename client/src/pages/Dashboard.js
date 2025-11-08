import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../components/NotificationSystem';
import WeatherWidget from '../components/WeatherWidget';
import 'bootstrap/dist/css/bootstrap.min.css';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const { currentUser } = useAuth();
  const { showSuccess, showInfo } = useNotifications();
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [welcomeShown, setWelcomeShown] = useState(false);
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Simulate loading recent activities
    const activities = [
      { id: 1, type: 'event', message: 'New event "Tech Conference 2023" created', time: '2 hours ago', icon: 'bi-calendar-plus' },
      { id: 2, type: 'client', message: 'Client "TechCorp Inc." updated their profile', time: '4 hours ago', icon: 'bi-person-check' },
      { id: 3, type: 'payment', message: 'Payment of $5,000 received from Hope Foundation', time: '6 hours ago', icon: 'bi-credit-card' },
      { id: 4, type: 'vendor', message: 'New vendor "Catering Plus" registered', time: '1 day ago', icon: 'bi-truck' },
      { id: 5, type: 'event', message: 'Event "Product Launch" completed successfully', time: '2 days ago', icon: 'bi-check-circle' }
    ];
    setRecentActivities(activities);

    // Simulate loading upcoming events
    const events = [
      { id: 1, name: 'Tech Conference 2023', date: '2023-10-15', location: 'Convention Center, New York', attendees: 500 },
      { id: 2, name: 'Annual Charity Gala', date: '2023-09-20', location: 'Grand Hotel, Chicago', attendees: 250 },
      { id: 3, name: 'Industry Summit 2023', date: '2023-11-30', location: 'Business Center, Boston', attendees: 600 }
    ];
    setUpcomingEvents(events);

    // Load videos from GridFS
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      // Try proxy first, then direct backend URL
      let res;
      try {
        res = await fetch('/api/videos/list');
      } catch (proxyErr) {
        console.log('Proxy failed, trying direct backend connection...');
        res = await fetch('http://localhost:5000/api/videos/list');
      }
      const data = await res.json();
      console.log('Videos loaded:', data);
      setVideos(data);
      if (data.length > 0) {
        setSelectedVideo(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load videos:', err);
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);
    
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    
    try {
      // Try direct backend URL
      const res = await fetch('http://localhost:5000/api/videos/upload', { 
        method: 'POST', 
        body: fd 
      });
      
      console.log('Upload response status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Upload failed with status:', res.status, errorText);
        showInfo(`Upload failed: ${errorText}`, 'Error');
        setUploading(false);
        return;
      }
      
      const data = await res.json();
      console.log('Upload response data:', data);
      
      if (data.fileId) {
        showSuccess('Video uploaded successfully!', 'Success');
        loadVideos();
        setSelectedVideo(data.fileId);
      } else if (data.error) {
        showInfo(`Upload failed: ${data.error}`, 'Error');
      } else {
        showInfo('Upload failed', 'Error');
      }
    } catch (err) {
      console.error('Upload error:', err);
      showInfo(`Upload failed: ${err.message}`, 'Error');
    } finally {
      setUploading(false);
    }
  };

  // Show welcome notification only once when user first loads dashboard
  useEffect(() => {
    if (currentUser && !welcomeShown) {
      showSuccess(`Welcome back, ${currentUser.firstName || 'User'}!`, 'Welcome', 3000);
      setWelcomeShown(true);
    }
  }, [currentUser, welcomeShown, showSuccess]);

  // Mock data for dashboard
  const eventData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [
      {
        label: 'Events',
        data: [12, 19, 8, 15, 12, 18],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1,
      },
    ],
  };

  const revenueData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [
      {
        label: 'Revenue',
        data: [2500, 3800, 1800, 4200, 2900, 5100],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const clientTypeData = {
    labels: ['Corporate', 'Individual', 'Non-profit', 'Government'],
    datasets: [
      {
        label: 'Client Types',
        data: [35, 25, 22, 18],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="container-fluid">
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Dashboard</h2>
          <div className="text-muted">
            <i className="bi bi-calendar3 me-2"></i>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
        
        <div className="row mb-4">
          <div className="col-md-3 mb-3">
            <div className="card text-white bg-primary">
              <div className="card-body">
                <h5 className="card-title">Upcoming Events</h5>
                <h2 className="card-text">24</h2>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card text-white bg-success">
              <div className="card-body">
                <h5 className="card-title">Total Clients</h5>
                <h2 className="card-text">156</h2>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card text-white bg-info">
              <div className="card-body">
                <h5 className="card-title">Total Revenue</h5>
                <h2 className="card-text">$98,500</h2>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card text-white bg-warning">
              <div className="card-body">
                <h5 className="card-title">Active Vendors</h5>
                <h2 className="card-text">42</h2>
              </div>
            </div>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-8 mb-3">
            <div className="card">
              <div className="card-header">
                Monthly Events
              </div>
              <div className="card-body">
                <Bar data={eventData} options={{ responsive: true }} />
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card">
              <div className="card-header">
                Client Types
              </div>
              <div className="card-body">
                <Doughnut data={clientTypeData} options={{ responsive: true }} />
              </div>
            </div>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-8">
            <div className="card">
              <div className="card-header">
                Revenue Trend
              </div>
              <div className="card-body">
                <Line data={revenueData} options={{ responsive: true }} />
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <WeatherWidget 
              location={{ lat: 40.7128, lng: -74.0060 }}
              eventDate={upcomingEvents[0]?.date}
            />
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="bi bi-play-circle me-2"></i>
                  Video Library (Stored in MongoDB)
                </h5>
                <div>
                  <label className="btn btn-sm btn-primary mb-0">
                    <i className="bi bi-upload me-1"></i>
                    {uploading ? 'Uploading...' : 'Upload Video'}
                    <input 
                      type="file" 
                      accept="video/*" 
                      onChange={handleVideoUpload} 
                      style={{ display: 'none' }}
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>
              <div className="card-body">
                {videos.length === 0 && !uploading && (
                  <div className="text-center text-muted py-4">
                    <i className="bi bi-film" style={{ fontSize: '3rem' }}></i>
                    <p className="mt-2">No videos uploaded yet. Upload your first video to get started!</p>
                  </div>
                )}
                {videos.length > 0 && (
                  <div className="row">
                    <div className="col-md-9">
                      {selectedVideo && (
                        <video
                          key={selectedVideo}
                          controls
                          style={{ width: '100%', maxHeight: '480px', backgroundColor: '#000' }}
                          src={`http://localhost:5000/api/videos/${selectedVideo}`}
                        >
                          Your browser does not support the video tag.
                        </video>
                      )}
                    </div>
                    <div className="col-md-3">
                      <h6 className="mb-3">Uploaded Videos ({videos.length})</h6>
                      <div className="list-group" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {videos.map((video) => (
                          <button
                            key={video.id}
                            className={`list-group-item list-group-item-action ${selectedVideo === video.id ? 'active' : ''}`}
                            onClick={() => setSelectedVideo(video.id)}
                          >
                            <div className="d-flex w-100 justify-content-between">
                              <h6 className="mb-1 text-truncate" style={{ maxWidth: '150px' }}>
                                <i className="bi bi-file-play me-1"></i>
                                {video.filename}
                              </h6>
                            </div>
                            <small className={selectedVideo === video.id ? 'text-white-50' : 'text-muted'}>
                              {(video.size / (1024 * 1024)).toFixed(2)} MB
                            </small>
                            <br />
                            <small className={selectedVideo === video.id ? 'text-white-50' : 'text-muted'}>
                              {new Date(video.uploadDate).toLocaleDateString()}
                            </small>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Recent Activities</h5>
              </div>
              <div className="card-body">
                <div className="list-group list-group-flush">
                  {recentActivities.map(activity => (
                    <div key={activity.id} className="list-group-item d-flex align-items-start">
                      <i className={`bi ${activity.icon} me-3 mt-1 text-primary`}></i>
                      <div className="flex-grow-1">
                        <p className="mb-1">{activity.message}</p>
                        <small className="text-muted">{activity.time}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Upcoming Events</h5>
              </div>
              <div className="card-body">
                <div className="list-group list-group-flush">
                  {upcomingEvents.map(event => (
                    <div key={event.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">{event.name}</h6>
                          <p className="mb-1 text-muted">{event.location}</p>
                          <small className="text-muted">
                            <i className="bi bi-calendar me-1"></i>
                            {new Date(event.date).toLocaleDateString()}
                            <i className="bi bi-people ms-3 me-1"></i>
                            {event.attendees} attendees
                          </small>
                        </div>
                        <span className="badge bg-warning">Upcoming</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
