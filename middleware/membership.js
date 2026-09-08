const Membership = require('../models/Membership');

const requireActiveMembership = async (req, res, next) => {
  try {
    // Only MEMBER role needs an active membership (TRAINER/ADMIN might not)
    // If you want all roles to need it, remove the role check. Let's assume only MEMBERs need it.
    if (req.user.role !== 'MEMBER') {
      return next();
    }

    const memberships = await Membership.find({ memberId: req.user._id, status: 'ACTIVE' });
    
    // Check if any active membership has expired but hasn't been updated in DB yet
    const hasValidMembership = memberships.some(m => m.endDate >= new Date());

    if (!hasValidMembership) {
      return res.status(403).json({
        success: false,
        message: 'Action requires an active membership',
        errorCode: 'MEMBERSHIP_REQUIRED'
      });
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { requireActiveMembership };
