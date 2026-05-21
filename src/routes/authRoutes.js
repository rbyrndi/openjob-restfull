const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const db = require('../config/db');
const validateBody = require('../middlewares/validationMiddleware');
const authenticate = require('../middlewares/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { loginSchema, refreshTokenSchema } = require('../validator/schemas');

const router = express.Router();

router.post(
    '/authentications',
    validateBody(loginSchema),
    asyncHandler(async (req, res) => {
        const { email, password } = req.body;

        const result = await db.query('SELECT id, password FROM users WHERE email = $1 LIMIT 1', [email]);
        const user = result.rows[0];

        if (!user) {
            throw new AppError(401, 'Email atau password salah');
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            throw new AppError(401, 'Email atau password salah');
        }

        const accessToken = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_KEY, { expiresIn: '3h' });
        const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_KEY);

        await db.query('INSERT INTO authentications (token) VALUES ($1)', [refreshToken]);

        return res.status(200).json({
            status: 'success',
            data: { accessToken, refreshToken },
        });
    })
);

router.put(
    '/authentications',
    validateBody(refreshTokenSchema),
    asyncHandler(async (req, res) => {
        const { refreshToken } = req.body;

        const storedToken = await db.query('SELECT token FROM authentications WHERE token = $1 LIMIT 1', [refreshToken]);
        if (storedToken.rows.length === 0) {
            throw new AppError(400, 'Refresh token tidak valid');
        }

        const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY);
        const accessToken = jwt.sign({ id: payload.id }, process.env.ACCESS_TOKEN_KEY, { expiresIn: '3h' });

        return res.status(200).json({
            status: 'success',
            data: { accessToken },
        });
    })
);

router.delete(
    '/authentications',
    authenticate,
    validateBody(refreshTokenSchema),
    asyncHandler(async (req, res) => {
        const { refreshToken } = req.body;

        const storedToken = await db.query('SELECT token FROM authentications WHERE token = $1 LIMIT 1', [refreshToken]);
        if (storedToken.rows.length === 0) {
            throw new AppError(400, 'Refresh token tidak valid');
        }

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY);

        await db.query('DELETE FROM authentications WHERE token = $1', [refreshToken]);

        return res.status(200).json({
            status: 'success',
            message: 'Logout berhasil',
        });
    })
);

module.exports = router;