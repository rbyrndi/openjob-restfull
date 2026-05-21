const express = require('express');
const { randomUUID } = require('crypto');

const db = require('../config/db');
const authenticate = require('../middlewares/authMiddleware');
const validateBody = require('../middlewares/validationMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { applicationSchema, applicationUpdateSchema } = require('../validator/schemas');
const { formatApplication } = require('../utils/serializers');

const router = express.Router();

const findApplications = async (whereClause = '', values = []) => {
    const result = await db.query(`SELECT * FROM applications ${whereClause} ORDER BY created_at DESC`, values);
    return result.rows.map(formatApplication);
};

router.post(
    '/applications',
    authenticate,
    validateBody(applicationSchema),
    asyncHandler(async (req, res) => {
        const id = randomUUID();
        const userId = req.user.id;
        const { job_id, status = 'pending' } = req.body;

        const result = await db.query(
            `INSERT INTO applications (id, user_id, job_id, status)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [id, userId, job_id, status]
        );

        return res.status(201).json({
            status: 'success',
            data: formatApplication(result.rows[0]),
        });
    })
);

router.get(
    '/applications',
    authenticate,
    asyncHandler(async (req, res) => {
        const applications = await findApplications();

        return res.status(200).json({
            status: 'success',
            data: { applications },
        });
    })
);

router.get(
    '/applications/:id',
    authenticate,
    asyncHandler(async (req, res) => {
        const result = await db.query('SELECT * FROM applications WHERE id = $1 LIMIT 1', [req.params.id]);
        if (result.rows.length === 0) {
            throw new AppError(404, 'Application tidak ditemukan');
        }

        return res.status(200).json({
            status: 'success',
            data: formatApplication(result.rows[0]),
        });
    })
);

router.get(
    '/applications/user/:userId',
    authenticate,
    asyncHandler(async (req, res) => {
        const applications = await findApplications('WHERE user_id = $1', [req.params.userId]);

        return res.status(200).json({
            status: 'success',
            data: { applications },
        });
    })
);

router.get(
    '/applications/job/:jobId',
    authenticate,
    asyncHandler(async (req, res) => {
        const applications = await findApplications('WHERE job_id = $1', [req.params.jobId]);

        return res.status(200).json({
            status: 'success',
            data: { applications },
        });
    })
);

router.put(
    '/applications/:id',
    authenticate,
    validateBody(applicationUpdateSchema),
    asyncHandler(async (req, res) => {
        const result = await db.query(
            `UPDATE applications
             SET status = $1, updated_at = current_timestamp
             WHERE id = $2
             RETURNING *`,
            [req.body.status, req.params.id]
        );

        if (result.rows.length === 0) {
            throw new AppError(404, 'Application tidak ditemukan');
        }

        return res.status(200).json({
            status: 'success',
            data: formatApplication(result.rows[0]),
        });
    })
);

router.delete(
    '/applications/:id',
    authenticate,
    asyncHandler(async (req, res) => {
        const result = await db.query('DELETE FROM applications WHERE id = $1 RETURNING id', [req.params.id]);
        if (result.rows.length === 0) {
            throw new AppError(404, 'Application tidak ditemukan');
        }

        return res.status(200).json({
            status: 'success',
            message: 'Application berhasil dihapus',
        });
    })
);

module.exports = router;