const express = require('express');
const router = express.Router();

const validateBody = require('../middlewares/validationMiddleware');
const { userRegisterSchema } = require('../validator/schemas');

const registerHandler = (req, res) => {
    res.status(201).json({
        status: 'success',
        message: 'User berhasil didaftarkan (data sudah lolos validasi Joi!)',
    });
};

router.post('/users', validateBody(userRegisterSchema), registerHandler);

module.exports = router;