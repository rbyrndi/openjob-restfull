const Joi = require('joi');

const userRegisterSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Format email tidak valid',
        'any.required': 'Email wajib diisi',
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password minimal harus 6 karakter',
        'any.required': 'Password wajib diisi',
    }),
    full_name: Joi.string().max(150).required().messages({
        'any.required': 'Nama lengkap wajib diisi',
    }),
});

const jobCreateSchema = Joi.object({
    company_id: Joi.string().required(),
    category_id: Joi.string().allow(null, ''),
    title: Joi.string().max(150).required(),
    description: Joi.string().required(),
    salary: Joi.number().integer().min(0).allow(null),
    location: Joi.string().max(100).required(),
});

module.exports = {
    userRegisterSchema,
    jobCreateSchema,
};