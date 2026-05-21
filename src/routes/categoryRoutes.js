const express = require('express');
const { randomUUID } = require('crypto');

const db = require('../config/db');
const authenticate = require('../middlewares/authMiddleware');
const validateBody = require('../middlewares/validationMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { categorySchema, categoryUpdateSchema } = require('../validator/schemas');
const { formatCategory } = require('../utils/serializers');

const router = express.Router();

router.post(
    '/categories',
    authenticate,
    validateBody(categorySchema),
    asyncHandler(async (req, res) => {
        const id = randomUUID();
        const result = await db.query('INSERT INTO categories (id, name) VALUES ($1, $2) RETURNING *', [id, req.body.name]);

        return res.status(201).json({
            status: 'success',
            data: formatCategory(result.rows[0]),
        });
    })
);

router.get(
    '/categories',
    asyncHandler(async (req, res) => {
        const result = await db.query('SELECT * FROM categories ORDER BY created_at DESC');

        return res.status(200).json({
            status: 'success',
            data: { categories: result.rows.map(formatCategory) },
        });
    })
);

router.get(
    '/categories/:id',
    asyncHandler(async (req, res) => {
        const result = await db.query('SELECT * FROM categories WHERE id = $1 LIMIT 1', [req.params.id]);
        if (result.rows.length === 0) {
            throw new AppError(404, 'Category tidak ditemukan');
        }

        return res.status(200).json({
            status: 'success',
            data: formatCategory(result.rows[0]),
        });
    })
);

router.put(
    '/categories/:id',
    authenticate,
    validateBody(categoryUpdateSchema),
    asyncHandler(async (req, res) => {
        const result = await db.query(
            `UPDATE categories
             SET name = COALESCE($1, name), updated_at = current_timestamp
             WHERE id = $2
             RETURNING *`,
            [req.body.name, req.params.id]
        );

        if (result.rows.length === 0) {
            throw new AppError(404, 'Category tidak ditemukan');
        }

        return res.status(200).json({
            status: 'success',
            data: formatCategory(result.rows[0]),
        });
    })
);

router.delete(
    '/categories/:id',
    authenticate,
    asyncHandler(async (req, res) => {
        const result = await db.query('DELETE FROM categories WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) {
            throw new AppError(404, 'Category tidak ditemukan');
        }

        return res.status(200).json({
            status: 'success',
            message: 'Category berhasil dihapus',
        });
    })
);

module.exports = router;