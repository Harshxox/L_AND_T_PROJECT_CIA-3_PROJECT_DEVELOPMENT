const express = require('express');
const { createReview, getTrainerReviews, getClassReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/trainer/:trainerId', getTrainerReviews);
router.get('/class/:classId', getClassReviews);
router.post('/', protect, createReview);

module.exports = router;
