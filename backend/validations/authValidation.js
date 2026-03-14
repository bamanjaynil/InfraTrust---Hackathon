const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().allow(null, ''),
  phone: Joi.string().min(10).max(15).allow(null, ''),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('CITIZEN').optional(),
  state: Joi.string().max(100).optional().allow(null, ''),
  district: Joi.string().max(100).optional().allow(null, ''),
  city: Joi.string().max(100).optional().allow(null, ''),
  pincode: Joi.string().max(20).optional().allow(null, ''),
  latitude: Joi.number().optional().allow(null),
  longitude: Joi.number().optional().allow(null)
}).or('email', 'phone'); // Require at least one

const loginSchema = Joi.object({
  identifier: Joi.string().required(),
  password: Joi.string().required(),
  role: Joi.string().valid('ADMIN', 'CONTRACTOR', 'DRIVER', 'CITIZEN').optional(),
  truckPlate: Joi.string().when('role', {
    is: 'DRIVER',
    then: Joi.required(),
    otherwise: Joi.optional().allow(null, '')
  })
});

module.exports = {
  registerSchema,
  loginSchema
};
