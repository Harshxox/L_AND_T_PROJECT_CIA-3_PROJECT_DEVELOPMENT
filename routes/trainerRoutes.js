const express = require('express');
const {
  createTrainer,
  getTrainers,
  getTrainer,
  updateTrainer,
  activateTrainer,
  deactivateTrainer,
  getMyClients,
  logPTSession,
  getEarningsSummary
} = require('../controllers/trainerController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

const router = express.Router();

// Public / Members can view trainers
router.get('/', getTrainers);

// Trainer specific routes
router.get('/portal/my-clients', protect, requireRole(['TRAINER', 'BRANCH ADMIN']), getMyClients);
router.post('/portal/log-pt-session', protect, requireRole(['TRAINER', 'BRANCH ADMIN']), logPTSession);
router.get('/portal/earnings-summary', protect, requireRole(['TRAINER', 'BRANCH ADMIN']), getEarningsSummary);

router.get('/:id', getTrainer);

// Admin only management
router.use(protect);
router.use(requireRole('BRANCH ADMIN'));

router.post('/', createTrainer);
router.put('/:id', updateTrainer);
router.patch('/:id/activate', activateTrainer);
router.patch('/:id/deactivate', deactivateTrainer);

module.exports = router;

