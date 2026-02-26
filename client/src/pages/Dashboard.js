import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
  ArcElement, PointElement, LineElement, Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement, Title, Tooltip, Legend, Filler
);

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: 'var(--text-secondary)', font: { size: 12 } } },
    tooltip: {
      backgroundColor: 'var(--bg-web)',
      borderColor: 'var(--border-color)',
      borderWidth: 1,
      titleColor: 'var(--text-primary)',
      bodyColor: 'var(--text-secondary)',
      padding: 12,
      cornerRadius: 10,
      boxShadow: '0 4px 20px rgba(15, 30, 58, 0.1)'
    }
  },
  scales: {
    x: { ticks: { color: 'var(--text-secondary)' }, grid: { color: 'var(--border-color)' } },
    y: { ticks: { color: 'var(--text-secondary)' }, grid: { color: 'var(--border-color)' } },
  }
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom', labels: { color: 'var(--text-secondary)', padding: 16, usePointStyle: true } },
    tooltip: {
      backgroundColor: 'var(--bg-web)',
      borderColor: 'var(--border-color)',
      borderWidth: 1,
      titleColor: 'var(--text-primary)',
      bodyColor: 'var(--text-secondary)',
      padding: 12,
      cornerRadius: 10,
      boxShadow: '0 4px 20px rgba(15, 30, 58, 0.1)'
    }
  },
  cutout: '70%',
};

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: [0.4, 0, 0.2, 1] } })
};

function Dashboard() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/dashboard/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const loadVideos = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/videos/list`);
      const data = await res.json();
      setVideos(data);
      if (data.length > 0) setSelectedVideo(data[0].id);
    } catch (err) {
      console.error('Failed to load videos:', err);
    }
  }, []);

  useEffect(() => {
    loadStats();
    loadVideos();
  }, [loadStats, loadVideos]);

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch(`${API}/api/videos/upload`, { method: 'POST', body: fd });
      if (res.ok) {
        const data = await res.json();
        if (data.fileId) {
          loadVideos();
          setSelectedVideo(data.fileId);
        }
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const statCards = [
    {
      label: 'Total Events', value: stats?.events?.total || 0,
      sub: `${stats?.events?.active || 0} active`, icon: 'bi-calendar-event',
      variant: '', gradient: 'var(--bg-web)'
    },
    {
      label: 'Total Clients', value: stats?.clients?.total || 0,
      sub: `${stats?.clients?.active || 0} active`, icon: 'bi-people',
      variant: 'success', gradient: 'var(--bg-web)'
    },
    {
      label: 'Revenue', value: `$${(stats?.revenue?.total || 0).toLocaleString()}`,
      sub: `$${(stats?.revenue?.monthly || 0).toLocaleString()} this month`, icon: 'bi-graph-up-arrow',
      variant: 'info', gradient: 'var(--bg-web)'
    },
    {
      label: 'Active Vendors', value: stats?.vendors?.active || 0,
      sub: `${stats?.vendors?.total || 0} total`, icon: 'bi-shop',
      variant: 'warning', gradient: 'var(--bg-web)'
    },
  ];

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const trendData = new Array(12).fill(0);
  (stats?.monthlyTrends || []).forEach(t => {
    if (t._id?.month) trendData[t._id.month - 1] = t.count;
  });

  const eventChartData = {
    labels: months,
    datasets: [{
      label: 'Events Created',
      data: trendData,
      backgroundColor: 'var(--primary-light)',
      borderColor: 'var(--primary)',
      borderWidth: 2,
      borderRadius: 6,
    }],
  };

  const statusData = {
    labels: ['Published', 'Completed', 'Draft', 'Cancelled'],
    datasets: [{
      data: [
        stats?.events?.active || 0,
        stats?.events?.completed || 0,
        stats?.events?.draft || 0,
        stats?.events?.cancelled || 0
      ],
      backgroundColor: ['#3b82f6', '#10b981', '#9ca3af', '#ef4444'],
      borderColor: 'var(--bg-web)',
      borderWidth: 2,
    }],
  };

  const revenueData = new Array(12).fill(0);
  (stats?.monthlyGrowth || []).forEach(t => {
    if (t._id?.month) revenueData[t._id.month - 1] = t.revenue;
  });

  const revenueChartData = {
    labels: months,
    datasets: [{
      label: 'Revenue',
      data: revenueData,
      fill: true,
      backgroundColor: 'var(--primary-light)',
      borderColor: 'var(--primary)',
      borderWidth: 2,
      tension: 0.4,
      pointBackgroundColor: 'var(--primary)',
      pointRadius: 3,
    }],
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
        <div className="text-center">
          <div className="spinner-border mb-3" style={{ width: '3rem', height: '3rem' }}></div>
          <p className="text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <motion.h2
            className="mb-1 fw-bold"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            Welcome back, {currentUser?.firstName || 'User'}
          </motion.h2>
          <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
            Here is what is happening with your events today.
          </p>
        </div>
        <div className="text-muted d-flex align-items-center gap-2" style={{ fontSize: '0.875rem' }}>
          <i className="bi bi-calendar3"></i>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="row g-3 mb-4">
        {statCards.map((card, i) => (
          <div className="col-sm-6 col-xl-3" key={card.label}>
            <motion.div
              className={`stat-card ${card.variant}`}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              style={{ background: card.gradient }}
            >
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: '0.8rem', fontWeight: 500 }}>{card.label}</p>
                  <h3 className="fw-bold mb-1">{card.value}</h3>
                  <small className="text-muted">{card.sub}</small>
                </div>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: 'var(--primary-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <i className={`bi ${card.icon}`} style={{ fontSize: '1.4rem', color: 'var(--primary)' }}></i>
                </div>
              </div>
            </motion.div>
          </div>
        ))}
      </div>

      <div className="row g-3 mb-4">
        <div className="col-lg-8">
          <motion.div className="card" custom={4} initial="hidden" animate="visible" variants={fadeUp}>
            <div className="card-header d-flex justify-content-between align-items-center bg-transparent border-bottom-0 pb-0 pt-4 px-4">
              <span className="fw-bold" style={{ fontSize: '1.1rem' }}>Monthly Event Trends</span>
              <span className="badge bg-primary px-3 py-2" style={{ borderRadius: 8 }}>{new Date().getFullYear()}</span>
            </div>
            <div className="card-body p-4" style={{ height: 320 }}>
              <Bar data={eventChartData} options={chartOptions} />
            </div>
          </motion.div>
        </div>
        <div className="col-lg-4">
          <motion.div className="card" custom={5} initial="hidden" animate="visible" variants={fadeUp}>
            <div className="card-header fw-bold bg-transparent border-bottom-0 pb-0 pt-4 px-4" style={{ fontSize: '1.1rem' }}>Event Status</div>
            <div className="card-body d-flex align-items-center justify-content-center p-4" style={{ height: 320 }}>
              <Doughnut data={statusData} options={doughnutOptions} />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-lg-8">
          <motion.div className="card" custom={6} initial="hidden" animate="visible" variants={fadeUp}>
            <div className="card-header fw-bold bg-transparent border-bottom-0 pb-0 pt-4 px-4" style={{ fontSize: '1.1rem' }}>Revenue Trend</div>
            <div className="card-body p-4" style={{ height: 300 }}>
              <Line data={revenueChartData} options={{
                ...chartOptions,
                scales: {
                  ...chartOptions.scales,
                  y: { ...chartOptions.scales.y, ticks: { ...chartOptions.scales.y.ticks, callback: v => `$${v.toLocaleString()}` } }
                }
              }} />
            </div>
          </motion.div>
        </div>
        <div className="col-lg-4">
          <motion.div className="card" custom={7} initial="hidden" animate="visible" variants={fadeUp}>
            <div className="card-header d-flex justify-content-between align-items-center bg-transparent border-bottom-0 pb-0 pt-4 px-4">
              <span className="fw-bold" style={{ fontSize: '1.1rem' }}>Upcoming Events</span>
              <span className="badge bg-primary px-3 py-2" style={{ borderRadius: 8 }}>{(stats?.upcomingEvents || []).length} events</span>
            </div>
            <div className="card-body p-2">
              {(stats?.upcomingEvents || []).length === 0 ? (
                <div className="text-center text-muted py-4">
                  <i className="bi bi-calendar-x" style={{ fontSize: '2rem' }}></i>
                  <p className="mt-2 mb-0">No upcoming events</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {(stats?.upcomingEvents || []).slice(0, 5).map(ev => {
                    const daysUntil = Math.ceil((new Date(ev.startDate) - new Date()) / (1000 * 60 * 60 * 24));
                    const statusColor = ev.status === 'published' ? 'success' : ev.status === 'draft' ? 'secondary' : 'warning';
                    const statusLabel = ev.status === 'published' ? 'Published' : ev.status === 'draft' ? 'Draft' : ev.status;
                    return (
                      <div key={ev._id} className="list-group-item border-0 px-3 py-3 mb-2 rounded premium-card" style={{ background: 'var(--bg-section)' }}>
                        <div className="d-flex justify-content-between align-items-start">
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h6 className="mb-1 text-truncate" style={{ fontSize: '0.875rem' }}>{ev.title}</h6>
                            <div className="d-flex align-items-center gap-2 flex-wrap">
                              <small className="text-muted">
                                <i className="bi bi-building me-1"></i>{ev.client?.companyName || 'N/A'}
                              </small>
                              <small className="text-muted">
                                <i className="bi bi-calendar3 me-1"></i>{new Date(ev.startDate).toLocaleDateString()}
                              </small>
                            </div>
                          </div>
                          <div className="d-flex flex-column align-items-end gap-1 ms-2">
                            <span className={`badge bg-${statusColor}`} style={{ fontSize: '0.7rem' }}>{statusLabel}</span>
                            <small className={`fw-bold ${daysUntil <= 7 ? 'text-danger' : daysUntil <= 30 ? 'text-warning' : 'text-muted'}`} style={{ fontSize: '0.75rem' }}>
                              {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                            </small>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12">
          <motion.div className="card" custom={8} initial="hidden" animate="visible" variants={fadeUp}>
            <div className="card-header d-flex justify-content-between align-items-center bg-transparent border-bottom-0 pb-0 pt-4 px-4">
              <span className="fw-bold" style={{ fontSize: '1.1rem' }}>
                <i className="bi bi-play-circle me-2 text-primary"></i>
                Video Library
              </span>
              <label className="btn btn-sm btn-primary mb-0 px-3 py-2">
                <i className="bi bi-upload me-2"></i>
                {uploading ? 'Uploading...' : 'Upload Video'}
                <input type="file" accept="video/*" onChange={handleVideoUpload} style={{ display: 'none' }} disabled={uploading} />
              </label>
            </div>
            <div className="card-body">
              {videos.length === 0 && !uploading ? (
                <div className="text-center text-muted py-4">
                  <i className="bi bi-film" style={{ fontSize: '2.5rem' }}></i>
                  <p className="mt-2 mb-0">No videos uploaded yet. Upload your first video to get started.</p>
                </div>
              ) : (
                <div className="row">
                  <div className="col-md-9">
                    {selectedVideo && (
                      <video
                        key={selectedVideo}
                        controls
                        crossOrigin="anonymous"
                        style={{ width: '100%', maxHeight: '420px', backgroundColor: '#000', borderRadius: 12 }}
                        src={`${API}/api/videos/${selectedVideo}`}
                      />
                    )}
                  </div>
                  <div className="col-md-3">
                    <h6 className="mb-3 text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Videos ({videos.length})
                    </h6>
                    <div className="list-group" style={{ maxHeight: '380px', overflowY: 'auto' }}>
                      {videos.map(video => (
                        <button
                          key={video.id}
                          className={`list-group-item list-group-item-action ${selectedVideo === video.id ? 'active' : ''}`}
                          onClick={() => setSelectedVideo(video.id)}
                        >
                          <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-file-play"></i>
                            <div className="text-truncate">
                              <div className="text-truncate" style={{ fontSize: '0.85rem' }}>{video.filename}</div>
                              <small className="text-muted">{(video.size / (1024 * 1024)).toFixed(2)} MB</small>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-lg-6">
          <motion.div className="card" custom={9} initial="hidden" animate="visible" variants={fadeUp}>
            <div className="card-header fw-bold bg-transparent border-bottom-0 pb-0 pt-4 px-4" style={{ fontSize: '1.1rem' }}>Recent Events</div>
            <div className="card-body p-2">
              {(stats?.recentEvents || []).length === 0 ? (
                <div className="text-center text-muted py-4">No recent events</div>
              ) : (
                <div className="list-group list-group-flush">
                  {(stats?.recentEvents || []).map(ev => (
                    <div key={ev._id} className="list-group-item border-0 px-3 py-3 mb-2 rounded premium-card" style={{ background: 'var(--bg-section)' }}>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-0" style={{ fontSize: '0.875rem' }}>{ev.title}</h6>
                          <small className="text-muted">{ev.client?.companyName || 'N/A'}</small>
                        </div>
                        <span className={`badge bg-${ev.status === 'completed' ? 'success' : ev.status === 'published' ? 'primary' : 'warning'}`}>
                          {ev.status === 'published' ? 'active' : ev.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
        <div className="col-lg-6">
          <motion.div className="card" custom={10} initial="hidden" animate="visible" variants={fadeUp}>
            <div className="card-header fw-bold bg-transparent border-bottom-0 pb-0 pt-4 px-4" style={{ fontSize: '1.1rem' }}>Quick Overview</div>
            <div className="card-body p-4">
              <div className="row g-3">
                <div className="col-6">
                  <div className="text-center p-3 rounded" style={{ background: 'var(--primary-light)' }}>
                    <h4 className="fw-bold mb-1" style={{ color: 'var(--primary)' }}>{stats?.events?.completed || 0}</h4>
                    <small className="text-muted fw-medium">Completed Events</small>
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-center p-3 rounded" style={{ background: 'var(--primary-light)' }}>
                    <h4 className="fw-bold mb-1" style={{ color: 'var(--primary)' }}>{stats?.events?.upcoming || 0}</h4>
                    <small className="text-muted fw-medium">Upcoming Events</small>
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-center p-3 rounded" style={{ background: 'var(--primary-light)' }}>
                    <h4 className="fw-bold mb-1" style={{ color: 'var(--primary)' }}>{stats?.clients?.active || 0}</h4>
                    <small className="text-muted fw-medium">Active Clients</small>
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-center p-3 rounded" style={{ background: 'var(--primary-light)' }}>
                    <h4 className="fw-bold mb-1" style={{ color: 'var(--primary)' }}>{stats?.vendors?.active || 0}</h4>
                    <small className="text-muted fw-medium">Active Vendors</small>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
