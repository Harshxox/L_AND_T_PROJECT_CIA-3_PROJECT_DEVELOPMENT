const workoutPlanService = require('../services/workoutPlanService');

const createWorkoutPlan = async (req, res, next) => {
  try {
    const plan = await workoutPlanService.createWorkoutPlan(req.user, req.body);
    res.status(201).json({ success: true, message: 'Workout plan created', data: { plan } });
  } catch (err) { next(err); }
};

const updateWorkoutPlan = async (req, res, next) => {
  try {
    const plan = await workoutPlanService.updateWorkoutPlan(req.user, req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Workout plan updated', data: { plan } });
  } catch (err) { next(err); }
};

const getWorkoutPlan = async (req, res, next) => {
  try {
    const plan = await workoutPlanService.getWorkoutPlanById(req.user, req.params.id);
    res.status(200).json({ success: true, message: 'Workout plan retrieved', data: { plan } });
  } catch (err) { next(err); }
};

const getMyWorkoutPlans = async (req, res, next) => {
  try {
    const plans = await workoutPlanService.getMyWorkoutPlans(req.user._id);
    res.status(200).json({ success: true, message: 'Workout plans retrieved', data: { plans } });
  } catch (err) { next(err); }
};

const getTrainerWorkoutPlans = async (req, res, next) => {
  try {
    const plans = await workoutPlanService.getTrainerWorkoutPlans(req.user._id);
    res.status(200).json({ success: true, message: 'Trainer workout plans retrieved', data: { plans } });
  } catch (err) { next(err); }
};

module.exports = {
  createWorkoutPlan,
  updateWorkoutPlan,
  getWorkoutPlan,
  getMyWorkoutPlans,
  getTrainerWorkoutPlans
};
