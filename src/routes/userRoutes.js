const express = require('express');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

const db = require('../config/db');
const validateBody = require('../middlewares/validationMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { userRegisterSchema } = require('../validator/schemas');
const { formatUser } = require('../utils/serializers');

const router = express.Router();

router.post(
    '/users',
    validateBody(userRegisterSchema),
    asyncHandler(async (req, res) => {
        const id = randomUUID();
        const fullName = req.body.full_name || req.body.name;
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const result = await db.query(
            `INSERT INTO users (id, email, password, full_name, role)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, email, full_name, role, created_at, updated_at`,
            [id, req.body.email, hashedPassword, fullName, req.body.role || 'user']
        );

        return res.status(201).json({
            status: 'success',
            data: formatUser(result.rows[0]),
        });
    })
);

router.get(
    '/users/:id',
    asyncHandler(async (req, res) => {
        const result = await db.query(
            'SELECT id, email, full_name, role, created_at, updated_at FROM users WHERE id = $1 LIMIT 1',
            [req.params.id]
        );

        if (result.rows.length === 0) {
            throw new AppError(404, 'User tidak ditemukan');
        }

        return res.status(200).json({
            status: 'success',
            data: formatUser(result.rows[0]),
        });
    })
);

module.exports = router;