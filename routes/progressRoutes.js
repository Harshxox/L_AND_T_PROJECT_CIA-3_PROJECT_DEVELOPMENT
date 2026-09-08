const express = require('express');
const { logProgress, getMyProgress, getMemberProgress } = require('../controllers/progressController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

const router = express.Router();

router.use(protect);

router.post('/', logProgress);
router.get('/my', getMyProgress);
router.get('/member/:memberId', requireRole(['TRAINER', 'BRANCH ADMIN']), getMemberProgress);

module.exports = router;
