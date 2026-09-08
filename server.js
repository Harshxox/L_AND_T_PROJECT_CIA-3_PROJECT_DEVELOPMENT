require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Connect to Database
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Basic route for testing
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running successfully',
    data: {}
  });
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const planRoutes = require('./routes/planRoutes');
const membershipRoutes = require('./routes/membershipRoutes');
const trainerRoutes = require('./routes/trainerRoutes');
const classRoutes = require('./routes/classRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const waitlistRoutes = require('./routes/waitlistRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const workoutPlanRoutes = require('./routes/workoutPlanRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const reportRoutes = require('./routes/reportRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const progressRoutes = require('./routes/progressRoutes');
const equipmentRoutes = require('./routes/equipmentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const { runExpiryCheck } = require('./services/notificationService');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/trainers', trainerRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/waitlist', waitlistRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/workout-plans', workoutPlanRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin/reports', reportRoutes);
app.use('/api/admin/manage', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/reviews', reviewRoutes);


// Background Jobs
// Run the expiry check daily (every 24 hours)
if (process.env.NODE_ENV !== 'test') {
  setInterval(runExpiryCheck, 24 * 60 * 60 * 1000);
}

// Handle undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Can't find ${req.originalUrl} on this server!`,
    errorCode: 'NOT_FOUND'
  });
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

let server;
if (require.main === module) {
  server = app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

module.exports = app;
