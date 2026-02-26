const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const clientRoutes = require('./routes/clients');
const vendorRoutes = require('./routes/vendors');
const staffRoutes = require('./routes/staff');
const paymentRoutes = require('./routes/payments');
const dashboardRoutes = require('./routes/dashboard');
const dataViewerRoutes = require('./routes/data-viewer');
const videosRoutes = require('./routes/videos');
const contractsRoutes = require('./routes/contracts');
const checkinRoutes = require('./routes/checkin');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/event-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/data', dataViewerRoutes);
app.use('/api/videos', videosRoutes);
app.use('/api/contracts', contractsRoutes);
app.use('/api/checkin', checkinRoutes);

app.get('/api/health', async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.json({ status: 'OK', message: 'Event Management System API is running', database: 'connected' });
  } catch (error) {
    console.error('Health check DB error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Event Management System API is degraded', database: 'disconnected' });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

const path = require('path');
const buildPath = path.join(__dirname, '../client/build');

if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access the application at http://localhost:${PORT}`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});

process.stdin.resume();
