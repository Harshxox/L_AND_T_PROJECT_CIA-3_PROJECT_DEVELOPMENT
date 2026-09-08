const Joi = require('joi');

const createTrainerSchema = Joi.object({
  userId: Joi.string().required(),
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().optional(),
  specialization: Joi.string().required(),
  experienceYears: Joi.number().min(0).optional(),
  bio: Joi.string().optional(),
  branchId: Joi.string().optional(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE').optional()
});

const updateTrainerSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional(),
  specialization: Joi.string().optional(),
  experienceYears: Joi.number().min(0).optional(),
  bio: Joi.string().optional(),
  branchId: Joi.string().optional(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE').optional()
});

module.exports = { createTrainerSchema, updateTrainerSchema };
