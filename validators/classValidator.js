const Joi = require('joi');

// Helper to validate time format HH:mm and startTime < endTime
const timeFormat = Joi.string().pattern(/^([01]\d|2[0-3]):?([0-5]\d)$/).message('Time must be in HH:mm format');

const createClassSchema = Joi.object({
  trainerId: Joi.string().required(),
  branchId: Joi.string().optional(),
  title: Joi.string().required(),
  description: Joi.string().optional(),
  category: Joi.string().optional(),
  date: Joi.date().iso().required(),
  startTime: timeFormat.required(),
  endTime: timeFormat.required(),
  capacity: Joi.number().integer().min(1).required(),
  status: Joi.string().valid('ACTIVE', 'CANCELLED', 'COMPLETED').optional()
}).custom((value, helpers) => {
  if (value.startTime >= value.endTime) {
    return helpers.message('endTime must be after startTime');
  }
  return value;
});

const updateClassSchema = Joi.object({
  trainerId: Joi.string().optional(),
  branchId: Joi.string().optional(),
  title: Joi.string().optional(),
  description: Joi.string().optional(),
  category: Joi.string().optional(),
  date: Joi.date().iso().optional(),
  startTime: timeFormat.optional(),
  endTime: timeFormat.optional(),
  capacity: Joi.number().integer().min(1).optional(),
  status: Joi.string().valid('ACTIVE', 'CANCELLED', 'COMPLETED').optional()
}).custom((value, helpers) => {
  if (value.startTime && value.endTime && value.startTime >= value.endTime) {
    return helpers.message('endTime must be after startTime');
  }
  return value;
});

module.exports = { createClassSchema, updateClassSchema };
