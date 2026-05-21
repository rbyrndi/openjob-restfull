const Joi = require('joi');

const userRegisterSchema = Joi.object({
    name: Joi.string().max(150),
    full_name: Joi.string().max(150),
    email: Joi.string().email().required().messages({
        'string.email': 'Format email tidak valid',
        'any.required': 'Email wajib diisi',
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password minimal harus 6 karakter',
        'any.required': 'Password wajib diisi',
    }),
    role: Joi.string().valid('user', 'admin').default('user'),
}).or('name', 'full_name').messages({
    'object.missing': 'Nama lengkap wajib diisi',
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

const refreshTokenSchema = Joi.object({
    refreshToken: Joi.string().required(),
});

const companySchema = Joi.object({
    name: Joi.string().max(150).required(),
    location: Joi.string().max(150).required(),
    description: Joi.string().allow('', null),
    website: Joi.string().uri().allow('', null),
    logo_url: Joi.string().allow('', null),
});

const companyUpdateSchema = Joi.object({
    name: Joi.string().max(150),
    location: Joi.string().max(150),
    description: Joi.string().allow('', null),
    website: Joi.string().uri().allow('', null),
    logo_url: Joi.string().allow('', null),
}).min(1);

const categorySchema = Joi.object({
    name: Joi.string().max(100).required(),
});

const categoryUpdateSchema = Joi.object({
    name: Joi.string().max(100),
}).min(1);

const jobSchema = Joi.object({
    company_id: Joi.string().required(),
    category_id: Joi.string().allow(null, ''),
    title: Joi.string().max(150).required(),
    description: Joi.string().required(),
    job_type: Joi.string().max(50).allow('', null),
    experience_level: Joi.string().max(50).allow('', null),
    location_type: Joi.string().max(50).allow('', null),
    location_city: Joi.string().max(100).allow('', null),
    salary: Joi.number().integer().min(0).allow(null),
    salary_min: Joi.number().integer().min(0).allow(null),
    salary_max: Joi.number().integer().min(0).allow(null),
    is_salary_visible: Joi.boolean().default(true),
    location: Joi.string().max(100).required(),
    status: Joi.string().valid('open', 'closed').default('open'),
});

const jobUpdateSchema = Joi.object({
    company_id: Joi.string(),
    category_id: Joi.string().allow(null, ''),
    title: Joi.string().max(150),
    description: Joi.string(),
    job_type: Joi.string().max(50).allow('', null),
    experience_level: Joi.string().max(50).allow('', null),
    location_type: Joi.string().max(50).allow('', null),
    location_city: Joi.string().max(100).allow('', null),
    salary: Joi.number().integer().min(0).allow(null),
    salary_min: Joi.number().integer().min(0).allow(null),
    salary_max: Joi.number().integer().min(0).allow(null),
    is_salary_visible: Joi.boolean(),
    location: Joi.string().max(100),
    status: Joi.string().valid('open', 'closed'),
}).min(1);

const applicationSchema = Joi.object({
    user_id: Joi.string().allow('', null),
    job_id: Joi.string().required(),
    status: Joi.string().valid('pending', 'accepted', 'rejected').default('pending'),
});

const applicationUpdateSchema = Joi.object({
    status: Joi.string().valid('pending', 'accepted', 'rejected').required(),
}).min(1);

module.exports = {
    userRegisterSchema,
    loginSchema,
    refreshTokenSchema,
    companySchema,
    companyUpdateSchema,
    categorySchema,
    categoryUpdateSchema,
    jobSchema,
    jobUpdateSchema,
    applicationSchema,
    applicationUpdateSchema,
};