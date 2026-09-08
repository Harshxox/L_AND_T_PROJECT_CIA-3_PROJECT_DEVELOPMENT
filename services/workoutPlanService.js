const WorkoutPlan = require('../models/WorkoutPlan');
const User = require('../models/User');
const Trainer = require('../models/Trainer');

const createWorkoutPlan = async (userPerforming, planData) => {
  // If TRAINER, ensure member is assigned to them
  let trainerProfile = null;
  if (userPerforming.role === 'TRAINER') {
    trainerProfile = await Trainer.findOne({ userId: userPerforming._id });
    if (!trainerProfile) {
      throw { statusCode: 403, message: 'Trainer profile not found', errorCode: 'FORBIDDEN' };
    }
    const member = await User.findById(planData.memberId);
    if (!member || !member.assignedTrainerId || member.assignedTrainerId.toString() !== trainerProfile._id.toString()) {
      throw { statusCode: 403, message: 'Cannot create plan for a member not assigned to you', errorCode: 'FORBIDDEN' };
    }
    planData.trainerId = trainerProfile._id;
  }

  return await WorkoutPlan.create(planData);
};

const updateWorkoutPlan = async (userPerforming, id, planData) => {
  const plan = await WorkoutPlan.findById(id);
  if (!plan) throw { statusCode: 404, message: 'Plan not found', errorCode: 'NOT_FOUND' };

  if (userPerforming.role === 'TRAINER') {
    const trainerProfile = await Trainer.findOne({ userId: userPerforming._id });
    if (!trainerProfile) {
      throw { statusCode: 403, message: 'Trainer profile not found', errorCode: 'FORBIDDEN' };
    }
    const member = await User.findById(plan.memberId);
    if (!member || !member.assignedTrainerId || member.assignedTrainerId.toString() !== trainerProfile._id.toString()) {
      throw { statusCode: 403, message: 'Cannot edit plan for a member not assigned to you', errorCode: 'FORBIDDEN' };
    }
  }

  const updatedPlan = await WorkoutPlan.findByIdAndUpdate(id, planData, { new: true, runValidators: true });
  return updatedPlan;
};

const getWorkoutPlanById = async (userPerforming, id) => {
  const plan = await WorkoutPlan.findById(id).populate('trainerId', 'name specialization');
  if (!plan) throw { statusCode: 404, message: 'Plan not found', errorCode: 'NOT_FOUND' };

  if (userPerforming.role === 'MEMBER') {
    if (plan.memberId.toString() !== userPerforming._id.toString()) {
      throw { statusCode: 403, message: 'Not authorized to view this plan', errorCode: 'FORBIDDEN' };
    }
  }

  if (userPerforming.role === 'TRAINER') {
    const trainerProfile = await Trainer.findOne({ userId: userPerforming._id });
    if (!trainerProfile || trainerProfile._id.toString() !== plan.trainerId.toString()) {
      throw { statusCode: 403, message: 'Not authorized to view this plan', errorCode: 'FORBIDDEN' };
    }
  }

  return plan;
};

const getMyWorkoutPlans = async (memberId) => {
  return await WorkoutPlan.find({ memberId }).populate('trainerId', 'name');
};

const getTrainerWorkoutPlans = async (trainerUserId) => {
  const trainerProfile = await Trainer.findOne({ userId: trainerUserId });
  if (!trainerProfile) throw { statusCode: 403, message: 'Trainer profile not found', errorCode: 'FORBIDDEN' };
  return await WorkoutPlan.find({ trainerId: trainerProfile._id }).populate('memberId', 'name email');
};

module.exports = {
  createWorkoutPlan,
  updateWorkoutPlan,
  getWorkoutPlanById,
  getMyWorkoutPlans,
  getTrainerWorkoutPlans
};
