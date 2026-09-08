const Joi = require('joi');

const createPlanSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  durationMonths: Joi.number().integer().min(1).required(),
  price: Joi.number().min(0).required(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE').optional()
});

const updatePlanSchema = Joi.object({
  name: Joi.string().optional(),
  description: Joi.string().optional(),
  durationMonths: Joi.number().integer().min(1).optional(),
  price: Joi.number().min(0).optional(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE').optional()
});

module.exports = {
  createPlanSchema,
  updatePlanSchema
};
