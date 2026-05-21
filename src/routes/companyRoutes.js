const express = require('express');
const { randomUUID } = require('crypto');

const db = require('../config/db');
const authenticate = require('../middlewares/authMiddleware');
const validateBody = require('../middlewares/validationMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { companySchema, companyUpdateSchema } = require('../validator/schemas');
const { formatCompany } = require('../utils/serializers');

const router = express.Router();

router.post(
    '/companies',
    authenticate,
    validateBody(companySchema),
    asyncHandler(async (req, res) => {
        const id = randomUUID();
        const { name, location, description = null, website = null, logo_url = null } = req.body;

        const result = await db.query(
            `INSERT INTO companies (id, name, location, description, website, logo_url)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [id, name, location, description, website, logo_url]
        );

        return res.status(201).json({
            status: 'success',
            data: formatCompany(result.rows[0]),
        });
    })
);

router.get(
    '/companies',
    asyncHandler(async (req, res) => {
        const result = await db.query('SELECT * FROM companies ORDER BY created_at DESC');

        return res.status(200).json({
            status: 'success',
            data: { companies: result.rows.map(formatCompany) },
        });
    })
);

router.get(
    '/companies/:id',
    asyncHandler(async (req, res) => {
        const result = await db.query('SELECT * FROM companies WHERE id = $1 LIMIT 1', [req.params.id]);

        if (result.rows.length === 0) {
            throw new AppError(404, 'Company tidak ditemukan');
        }

        return res.status(200).json({
            status: 'success',
            data: formatCompany(result.rows[0]),
        });
    })
);

router.put(
    '/companies/:id',
    authenticate,
    validateBody(companyUpdateSchema),
    asyncHandler(async (req, res) => {
        const existing = await db.query('SELECT * FROM companies WHERE id = $1 LIMIT 1', [req.params.id]);
        if (existing.rows.length === 0) {
            throw new AppError(404, 'Company tidak ditemukan');
        }

        const current = existing.rows[0];
        const payload = { ...current, ...req.body };

        const result = await db.query(
            `UPDATE companies
             SET name = $1, location = $2, description = $3, website = $4, logo_url = $5, updated_at = current_timestamp
             WHERE id = $6
             RETURNING *`,
            [payload.name, payload.location, payload.description, payload.website, payload.logo_url, req.params.id]
        );

        return res.status(200).json({
            status: 'success',
            data: formatCompany(result.rows[0]),
        });
    })
);

router.delete(
    '/companies/:id',
    authenticate,
    asyncHandler(async (req, res) => {
        const result = await db.query('DELETE FROM companies WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) {
            throw new AppError(404, 'Company tidak ditemukan');
        }

        return res.status(200).json({
            status: 'success',
            message: 'Company berhasil dihapus',
        });
    })
);

module.exports = router;