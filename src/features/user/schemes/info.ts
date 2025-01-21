import Joi, { ObjectSchema } from 'joi';

const basicInfoSchema: ObjectSchema = Joi.object().keys({
  quote: Joi.string().optional().allow(null, ''),
  work: Joi.string().optional().allow(null, ''),
  school: Joi.string().optional().allow(null, ''),
  location: Joi.string().optional().allow(null, '')
});

const socialLinksSchema: ObjectSchema = Joi.object().keys({
  facebook: Joi.string().optional().allow(null, ''),
  instagram: Joi.string().optional().allow(null, ''),
  twitter: Joi.string().optional().allow(null, ''),
  youtube: Joi.string().optional().allow(null, '')
});

const notificationSettingsSchema: ObjectSchema = Joi.object().keys({
  messages: Joi.boolean().optional(),
  reactions: Joi.boolean().optional(),
  comments: Joi.boolean().optional(),
  follows: Joi.boolean().optional()
});

export { basicInfoSchema, socialLinksSchema, notificationSettingsSchema };
