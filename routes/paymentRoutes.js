const express = require('express');
const {
  processDummyCheckout,
  validateCoupon,
  getMyTransactions,
  getAllTransactions
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

const router = express.Router();

router.use(protect);

router.post('/checkout', processDummyCheckout);
router.post('/validate-coupon', validateCoupon);
router.get('/my-receipts', getMyTransactions);
router.get('/admin/ledger', requireRole('BRANCH ADMIN'), getAllTransactions);

module.exports = router;
