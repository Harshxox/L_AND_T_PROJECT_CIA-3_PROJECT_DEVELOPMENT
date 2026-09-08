const express = require('express');
const { getPlans, getPlan, createPlan, updatePlan, deletePlan, activatePlan, deactivatePlan } = require('../controllers/planController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

const router = express.Router();

// Public route to view plans (or maybe just members, let's keep it public so anyone can see plans)
router.get('/', getPlans);
router.get('/:id', getPlan);

// Admin only routes
router.use(protect);
router.use(requireRole('BRANCH ADMIN'));

router.post('/', createPlan);
router.put('/:id', updatePlan);
router.delete('/:id', deletePlan);
router.patch('/:id/activate', activatePlan);
router.patch('/:id/deactivate', deactivatePlan);

module.exports = router;
