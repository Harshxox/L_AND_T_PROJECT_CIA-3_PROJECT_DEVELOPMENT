const express = require('express');
const {
  getAllEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment
} = require('../controllers/equipmentController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

const router = express.Router();

router.use(protect);

router.get('/', getAllEquipment);
router.post('/', requireRole('BRANCH ADMIN'), createEquipment);
router.put('/:id', requireRole('BRANCH ADMIN'), updateEquipment);
router.delete('/:id', requireRole('BRANCH ADMIN'), deleteEquipment);

module.exports = router;
