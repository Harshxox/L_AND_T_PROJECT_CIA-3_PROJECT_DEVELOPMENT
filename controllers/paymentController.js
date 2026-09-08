const crypto = require('crypto');
const MembershipPlan = require('../models/MembershipPlan');
const Membership = require('../models/Membership');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { createNotification } = require('../services/notificationService');

const VALID_COUPONS = {
  'WELCOME50': 0.50, // 50% off
  'IRON20': 0.20,    // 20% off
  'FITNESS10': 0.10  // 10% off
};

// Process simulated checkout
const processDummyCheckout = async (req, res, next) => {
  try {
    const memberId = req.user.id;
    const { planId, ptPackageCount, paymentMethod = 'DUMMY_CARD', couponCode = '', notes } = req.body;

    let originalAmount = 0;
    let itemName = '';
    let plan = null;

    if (planId) {
      plan = await MembershipPlan.findById(planId);
      if (!plan || plan.status !== 'ACTIVE') {
        return res.status(404).json({ success: false, message: 'Membership plan not found or inactive', errorCode: 'NOT_FOUND' });
      }
      originalAmount = plan.price;
      itemName = `${plan.name} Membership (${plan.durationMonths} Months)`;
    } else if (ptPackageCount) {
      const count = parseInt(ptPackageCount, 10);
      if (isNaN(count) || count <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid PT session count' });
      }
      const pricePerSession = 40; // $40 / session
      originalAmount = count * pricePerSession;
      itemName = `${count}x Personal Training Sessions`;
    } else {
      return res.status(400).json({ success: false, message: 'Either planId or ptPackageCount must be provided' });
    }

    // Apply Coupon
    let discountRate = 0;
    const cleanCoupon = (couponCode || '').trim().toUpperCase();
    if (cleanCoupon && VALID_COUPONS[cleanCoupon]) {
      discountRate = VALID_COUPONS[cleanCoupon];
    }
    const discountAmount = Math.round(originalAmount * discountRate * 100) / 100;
    const finalAmount = Math.max(0, Math.round((originalAmount - discountAmount) * 100) / 100);

    const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const transactionId = `TXN-${Date.now()}-${randomSuffix}`;
    const receiptNumber = `REC-${new Date().getFullYear()}-${randomSuffix}`;

    // Create Transaction Log
    const transaction = await Transaction.create({
      transactionId,
      receiptNumber,
      memberId,
      itemType: planId ? 'MEMBERSHIP_PLAN' : 'PT_PACKAGE',
      planId: plan ? plan._id : undefined,
      itemName,
      originalAmount,
      discountAmount,
      finalAmount,
      couponCode: cleanCoupon || undefined,
      paymentMethod,
      status: 'SUCCESS',
      paymentGatewayRef: `MOCK-GW-${randomSuffix}`
    });

    let membership = null;
    if (plan) {
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + plan.durationMonths);

      membership = await Membership.create({
        memberId,
        planId: plan._id,
        startDate,
        endDate,
        status: 'ACTIVE',
        paymentDetails: {
          transactionId,
          receiptNumber,
          amountPaid: finalAmount,
          paymentMethod,
          discountApplied: discountAmount,
          couponCode: cleanCoupon || undefined
        }
      });
    }

    if (ptPackageCount) {
      const count = parseInt(ptPackageCount, 10);
      await User.findByIdAndUpdate(memberId, {
        $inc: { ptSessionsBalance: count }
      });
    }

    // Send notification
    await createNotification(
      memberId,
      `Payment Successful! Receipt #${receiptNumber} generated for ${itemName}. Paid: $${finalAmount}`,
      'ALERT'
    );

    res.status(201).json({
      success: true,
      message: 'Dummy payment processed successfully',
      data: {
        transaction,
        membership,
        receipt: {
          receiptNumber,
          transactionId,
          memberName: req.user.name,
          memberEmail: req.user.email,
          item: itemName,
          originalAmount,
          discountAmount,
          finalAmount,
          paymentMethod,
          date: new Date().toISOString()
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// Validate Coupon endpoint
const validateCoupon = async (req, res, next) => {
  try {
    const { couponCode, amount } = req.body;
    const cleanCoupon = (couponCode || '').trim().toUpperCase();
    if (VALID_COUPONS[cleanCoupon]) {
      const discountRate = VALID_COUPONS[cleanCoupon];
      const discountAmount = amount ? Math.round(amount * discountRate * 100) / 100 : 0;
      return res.status(200).json({
        success: true,
        data: {
          valid: true,
          couponCode: cleanCoupon,
          discountPercent: discountRate * 100,
          discountAmount
        }
      });
    }
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired coupon code. Try WELCOME50 or IRON20.'
    });
  } catch (err) {
    next(err);
  }
};

// Member get their own transactions & receipts
const getMyTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ memberId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: { transactions } });
  } catch (err) {
    next(err);
  }
};

// Admin get all transaction records & financial ledger
const getAllTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find().populate('memberId', 'name email phone').sort({ createdAt: -1 });
    const totalRevenue = transactions.reduce((acc, t) => acc + (t.status === 'SUCCESS' ? t.finalAmount : 0), 0);
    const totalDiscounts = transactions.reduce((acc, t) => acc + (t.status === 'SUCCESS' ? t.discountAmount : 0), 0);

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalDiscounts: Math.round(totalDiscounts * 100) / 100,
        transactionCount: transactions.length,
        transactions
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  processDummyCheckout,
  validateCoupon,
  getMyTransactions,
  getAllTransactions
};
