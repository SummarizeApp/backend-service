import Joi from 'joi';

export const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    username: Joi.string().min(3).max(30).required(),
    connactNumber: Joi.string().pattern(/^[+]?[0-9]{7,15}$/)
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});