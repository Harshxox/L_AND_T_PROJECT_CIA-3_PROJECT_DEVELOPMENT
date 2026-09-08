const Joi = require('joi');

const checkInSchema = Joi.object({
  memberId: Joi.string().required(),
  type: Joi.string().valid('GYM_VISIT', 'CLASS').required(),
  classId: Joi.string().when('type', {
    is: 'CLASS',
    then: Joi.required(),
    otherwise: Joi.optional()
  })
});

module.exports = { checkInSchema };
