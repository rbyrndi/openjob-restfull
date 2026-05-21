const express = require('express');
const { randomUUID } = require('crypto');

const db = require('../config/db');
const authenticate = require('../middlewares/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { formatBookmark } = require('../utils/serializers');

const router = express.Router();

router.post(
    '/jobs/:jobId/bookmark',
    authenticate,
    asyncHandler(async (req, res) => {
        const id = randomUUID();
        const result = await db.query(
            'INSERT INTO bookmarks (id, user_id, job_id) VALUES ($1, $2, $3) RETURNING *',
            [id, req.user.id, req.params.jobId]
        );

        return res.status(201).json({
            status: 'success',
            data: formatBookmark(result.rows[0]),
        });
    })
);

router.get(
    '/jobs/:jobId/bookmark/:id',
    authenticate,
    asyncHandler(async (req, res) => {
        const result = await db.query(
            'SELECT * FROM bookmarks WHERE id = $1 AND job_id = $2 LIMIT 1',
            [req.params.id, req.params.jobId]
        );

        if (result.rows.length === 0) {
            throw new AppError(404, 'Bookmark tidak ditemukan');
        }

        return res.status(200).json({
            status: 'success',
            data: formatBookmark(result.rows[0]),
        });
    })
);

router.delete(
    '/jobs/:jobId/bookmark',
    authenticate,
    asyncHandler(async (req, res) => {
        const result = await db.query(
            'DELETE FROM bookmarks WHERE user_id = $1 AND job_id = $2 RETURNING *',
            [req.user.id, req.params.jobId]
        );

        if (result.rows.length === 0) {
            throw new AppError(404, 'Bookmark tidak ditemukan');
        }

        return res.status(200).json({
            status: 'success',
            message: 'Bookmark berhasil dihapus',
        });
    })
);

router.get(
    '/bookmarks',
    authenticate,
    asyncHandler(async (req, res) => {
        const result = await db.query('SELECT * FROM bookmarks WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);

        return res.status(200).json({
            status: 'success',
            data: { bookmarks: result.rows.map(formatBookmark) },
        });
    })
);

module.exports = router;