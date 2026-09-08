const express = require('express');
const { createWorkoutPlan, updateWorkoutPlan, getWorkoutPlan, getMyWorkoutPlans, getTrainerWorkoutPlans } = require('../controllers/workoutPlanController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

const router = express.Router();

router.use(protect);

// Member views
router.get('/my', getMyWorkoutPlans);
router.get('/:id', getWorkoutPlan);

// Trainer views and management
router.get('/trainer/assigned', requireRole(['TRAINER', 'BRANCH ADMIN']), getTrainerWorkoutPlans);
router.post('/', requireRole(['TRAINER', 'BRANCH ADMIN']), createWorkoutPlan);
router.put('/:id', requireRole(['TRAINER', 'BRANCH ADMIN']), updateWorkoutPlan);

module.exports = router;
