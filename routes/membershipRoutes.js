const express = require('express');
const {
  purchaseMembership,
  renewMembership,
  freezeMembership,
  unfreezeMembership,
  getMyMemberships,
  getMembershipById
} = require('../controllers/membershipController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All membership routes require auth

router.post('/', purchaseMembership);
router.post('/:id/renew', renewMembership);
router.put('/:id/freeze', freezeMembership);
router.put('/:id/unfreeze', unfreezeMembership);
router.get('/my', getMyMemberships);
router.get('/:id', getMembershipById);

module.exports = router;

