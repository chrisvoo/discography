import Joi from 'joi';

export const envSchema = Joi.object({
  API_KEY: Joi.string().empty().required(),
  SHARED_SECRET: Joi.string().empty().required(),
});
