const planService = require('../services/planService');
const { createPlanSchema, updatePlanSchema } = require('../validators/planValidator');

const getPlans = async (req, res, next) => {
  try {
    const plans = await planService.getAllPlans();
    res.status(200).json({ success: true, message: 'Plans retrieved', data: { plans } });
  } catch (err) { next(err); }
};

const getPlan = async (req, res, next) => {
  try {
    const plan = await planService.getPlanById(req.params.id);
    res.status(200).json({ success: true, message: 'Plan retrieved', data: { plan } });
  } catch (err) { next(err); }
};

const createPlan = async (req, res, next) => {
  try {
    const { error } = createPlanSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message, errorCode: 'VALIDATION_ERROR' });
    }
    const plan = await planService.createPlan(req.body);
    res.status(201).json({ success: true, message: 'Plan created', data: { plan } });
  } catch (err) { next(err); }
};

const updatePlan = async (req, res, next) => {
  try {
    const { error } = updatePlanSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message, errorCode: 'VALIDATION_ERROR' });
    }
    const plan = await planService.updatePlan(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Plan updated', data: { plan } });
  } catch (err) { next(err); }
};

const deletePlan = async (req, res, next) => {
  try {
    await planService.deletePlan(req.params.id);
    res.status(200).json({ success: true, message: 'Plan deleted', data: {} });
  } catch (err) { next(err); }
};

const activatePlan = async (req, res, next) => {
  try {
    const plan = await planService.activatePlan(req.params.id);
    res.status(200).json({ success: true, message: 'Plan activated', data: { plan } });
  } catch (err) { next(err); }
};

const deactivatePlan = async (req, res, next) => {
  try {
    const plan = await planService.deactivatePlan(req.params.id);
    res.status(200).json({ success: true, message: 'Plan deactivated', data: { plan } });
  } catch (err) { next(err); }
};

module.exports = { getPlans, getPlan, createPlan, updatePlan, deletePlan, activatePlan, deactivatePlan };
