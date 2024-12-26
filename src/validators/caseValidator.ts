import Joi from 'joi';

export const createCaseSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
});