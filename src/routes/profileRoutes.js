const express = require('express');

const db = require('../config/db');
const authenticate = require('../middlewares/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { formatUser, formatApplication, formatBookmark } = require('../utils/serializers');

const router = express.Router();

router.get(
    '/profile',
    authenticate,
    asyncHandler(async (req, res) => {
        const result = await db.query(
            'SELECT id, email, full_name, role, created_at, updated_at FROM users WHERE id = $1 LIMIT 1',
            [req.user.id]
        );

        if (result.rows.length === 0) {
            throw new AppError(404, 'Profile tidak ditemukan');
        }

        return res.status(200).json({
            status: 'success',
            data: formatUser(result.rows[0]),
        });
    })
);

router.get(
    '/profile/applications',
    authenticate,
    asyncHandler(async (req, res) => {
        const result = await db.query('SELECT * FROM applications WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);

        return res.status(200).json({
            status: 'success',
            data: { applications: result.rows.map(formatApplication) },
        });
    })
);

router.get(
    '/profile/bookmarks',
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