import Joi from 'joi';

export const envSchema = Joi.object({
  GENIUS_CLIENT_ACCESS_TOKEN: Joi.string().empty().required(),
});
