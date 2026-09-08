const express = require('express');
const { removeFromWaitlist } = require('../controllers/waitlistController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // Require authentication

// Explicit route to remove oneself from a waitlist entry
router.delete('/:id', removeFromWaitlist);

module.exports = router;
