const express = require('express');
const { getMyNotifications, markAsRead, triggerJob } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

const router = express.Router();

router.use(protect);

router.get('/', getMyNotifications);
router.patch('/:id/read', markAsRead);

// Manual trigger for testing/admin purposes
router.post('/trigger-expiry-job', requireRole('BRANCH ADMIN'), triggerJob);

module.exports = router;
