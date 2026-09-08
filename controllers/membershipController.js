const membershipService = require('../services/membershipService');
const { purchaseMembershipSchema } = require('../validators/membershipValidator');
const Membership = require('../models/Membership');

const purchaseMembership = async (req, res, next) => {
  try {
    const { error } = purchaseMembershipSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message, errorCode: 'VALIDATION_ERROR' });
    }
    const membership = await membershipService.purchaseMembership(req.user._id, req.body.planId);
    res.status(201).json({ success: true, message: 'Membership purchased successfully', data: { membership } });
  } catch (err) { next(err); }
};

const renewMembership = async (req, res, next) => {
  try {
    const membership = await membershipService.renewMembership(req.params.id, req.user._id);
    res.status(200).json({ success: true, message: 'Membership renewed successfully', data: { membership } });
  } catch (err) { next(err); }
};

const freezeMembership = async (req, res, next) => {
  try {
    const { freezeDays = 14 } = req.body;
    const membership = await Membership.findById(req.params.id);
    if (!membership) {
      return res.status(404).json({ success: false, message: 'Membership not found' });
    }

    if (req.user.role === 'MEMBER' && membership.memberId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to freeze this membership' });
    }

    if (membership.status !== 'ACTIVE') {
      return res.status(400).json({ success: false, message: `Cannot freeze a membership with status ${membership.status}` });
    }

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Number(freezeDays));

    // Extend current end date by the freeze duration
    const currentEndDate = new Date(membership.endDate);
    currentEndDate.setDate(currentEndDate.getDate() + Number(freezeDays));

    membership.isFrozen = true;
    membership.status = 'FROZEN';
    membership.freezeStartDate = startDate;
    membership.freezeEndDate = endDate;
    membership.endDate = currentEndDate;
    await membership.save();

    res.status(200).json({
      success: true,
      message: `Membership frozen for ${freezeDays} days. Expiry extended to ${currentEndDate.toLocaleDateString()}`,
      data: { membership }
    });
  } catch (err) { next(err); }
};

const unfreezeMembership = async (req, res, next) => {
  try {
    const membership = await Membership.findById(req.params.id);
    if (!membership) {
      return res.status(404).json({ success: false, message: 'Membership not found' });
    }

    if (req.user.role === 'MEMBER' && membership.memberId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    membership.isFrozen = false;
    membership.status = 'ACTIVE';
    await membership.save();

    res.status(200).json({
      success: true,
      message: 'Membership un-frozen and reactivated successfully',
      data: { membership }
    });
  } catch (err) { next(err); }
};

const getMyMemberships = async (req, res, next) => {
  try {
    const memberships = await membershipService.getMyMemberships(req.user._id);
    res.status(200).json({ success: true, message: 'Memberships retrieved', data: { memberships } });
  } catch (err) { next(err); }
};

const getMembershipById = async (req, res, next) => {
  try {
    const membership = await membershipService.getMembershipById(req.params.id);
    
    if (req.user.role === 'MEMBER' && membership.memberId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this membership', errorCode: 'FORBIDDEN' });
    }

    res.status(200).json({ success: true, message: 'Membership retrieved', data: { membership } });
  } catch (err) { next(err); }
};

module.exports = {
  purchaseMembership,
  renewMembership,
  freezeMembership,
  unfreezeMembership,
  getMyMemberships,
  getMembershipById
};

