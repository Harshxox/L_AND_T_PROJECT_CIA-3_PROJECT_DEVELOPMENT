const MembershipPlan = require('../models/MembershipPlan');

const getAllPlans = async () => {
  return await MembershipPlan.find({});
};

const getPlanById = async (id) => {
  const plan = await MembershipPlan.findById(id);
  if (!plan) {
    const error = new Error('Plan not found');
    error.statusCode = 404;
    error.errorCode = 'NOT_FOUND';
    throw error;
  }
  return plan;
};

const createPlan = async (planData) => {
  return await MembershipPlan.create(planData);
};

const updatePlan = async (id, planData) => {
  const plan = await MembershipPlan.findByIdAndUpdate(id, planData, {
    new: true,
    runValidators: true
  });
  if (!plan) {
    const error = new Error('Plan not found');
    error.statusCode = 404;
    error.errorCode = 'NOT_FOUND';
    throw error;
  }
  return plan;
};

const deletePlan = async (id) => {
  const plan = await MembershipPlan.findByIdAndDelete(id);
  if (!plan) {
    const error = new Error('Plan not found');
    error.statusCode = 404;
    error.errorCode = 'NOT_FOUND';
    throw error;
  }
  return plan;
};

const activatePlan = async (id) => {
  return await updatePlan(id, { status: 'ACTIVE' });
};

const deactivatePlan = async (id) => {
  return await updatePlan(id, { status: 'INACTIVE' });
};

module.exports = {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  activatePlan,
  deactivatePlan
};
