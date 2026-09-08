const express = require('express');
const { register, login, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// Test route for BRANCH ADMIN
router.get('/admin-only', protect, requireRole('BRANCH ADMIN'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome Admin',
    data: {}
  });
});

module.exports = router;

