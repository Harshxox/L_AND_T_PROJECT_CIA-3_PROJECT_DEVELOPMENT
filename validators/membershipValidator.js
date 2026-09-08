const Joi = require('joi');

const purchaseMembershipSchema = Joi.object({
  planId: Joi.string().required().messages({
    'string.empty': 'Plan ID is required'
  })
});

module.exports = {
  purchaseMembershipSchema
};
