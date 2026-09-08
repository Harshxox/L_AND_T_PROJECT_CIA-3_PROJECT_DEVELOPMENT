const express = require('express');
const { createClass, getClasses, getClass, updateClass, deleteClass } = require('../controllers/classController');
const { bookClass } = require('../controllers/bookingController');
const { addToWaitlist, getWaitlist } = require('../controllers/waitlistController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { requireActiveMembership } = require('../middleware/membership');

const router = express.Router();

// Public / Members can view classes
router.get('/', getClasses);
router.get('/:id', getClass);

// Members can book classes
router.post('/:id/book', protect, requireActiveMembership, bookClass);

// Members can view/join waitlist
router.post('/:id/waitlist', protect, requireActiveMembership, addToWaitlist);
router.get('/:id/waitlist', protect, getWaitlist);

// Admin only (or TRAINER for some actions, but prompt says Admin CRUD)
router.use(protect);
router.use(requireRole('BRANCH ADMIN'));

router.post('/', createClass);
router.put('/:id', updateClass);
router.delete('/:id', deleteClass);

module.exports = router;
