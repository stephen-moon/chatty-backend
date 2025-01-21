import Joi, { ObjectSchema } from 'joi';

const emailSchema: ObjectSchema = Joi.object().keys({
  email: Joi.string().email().required().messages({
    'string.base': 'Field must be valid',
    'string.required': 'Field must be valid',
    'string.email': 'Field must be valid'
  })
});

const passwordSchema: ObjectSchema = Joi.object().keys({
  password: Joi.string().required().min(4).max(8).messages({
    'string.base': 'Password should be of type string',
    'string.min': 'Invalid password',
    'string.max': 'Invalid password',
    'string.empty': 'Password is a required field'
  }),
  confirmPassword: Joi.string().required().valid(Joi.ref('password')).messages({
    'any.only': 'Passwords should match',
    'any.required': 'Confirm password is a required field'
  })
});

const changePasswordSchema: ObjectSchema = Joi.object().keys({
  currentPassword: Joi.string().required().min(4).max(8).messages({
    'string.base': 'Password should be a type of string',
    'string.min': 'Password must have a minimum length of {#limit}',
    'string.max': 'Password should have a maximum length of {#limit}',
    'string.empty': 'Password is a required field'
  }),
  newPassword: Joi.string().required().min(4).max(8).messages({
    'string.base': 'Password should be a type of string',
    'string.min': 'Password must have a minimum length of {#limit}',
    'string.max': 'Password should have a maximum length of {#limit}',
    'string.empty': 'Password is a required field'
  }),
  confirmPassword: Joi.any().equal(Joi.ref('newPassword')).required().messages({
    'any.only': 'Confirm password does not match new password.'
  })
});

export { emailSchema, passwordSchema, changePasswordSchema };
