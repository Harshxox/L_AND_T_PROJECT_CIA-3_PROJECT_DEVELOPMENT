const express = require('express');
const { getMyBookings, cancelBooking } = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/my', getMyBookings);
router.delete('/:id', cancelBooking);

module.exports = router;
