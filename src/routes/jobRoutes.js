const express = require('express');
const { randomUUID } = require('crypto');

const db = require('../config/db');
const authenticate = require('../middlewares/authMiddleware');
const validateBody = require('../middlewares/validationMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { jobSchema, jobUpdateSchema } = require('../validator/schemas');
const { formatJob } = require('../utils/serializers');

const router = express.Router();

const selectJobQuery = `
    SELECT
        j.*,
        c.name AS company_name,
        cat.name AS category_name
    FROM jobs j
    INNER JOIN companies c ON c.id = j.company_id
    LEFT JOIN categories cat ON cat.id = j.category_id
`;

const buildJobFilters = (queryObject) => {
    const filters = [];
    const values = [];

    if (queryObject.title) {
        values.push(`%${queryObject.title}%`);
        filters.push(`j.title ILIKE $${values.length}`);
    }

    if (queryObject['company-name']) {
        values.push(`%${queryObject['company-name']}%`);
        filters.push(`c.name ILIKE $${values.length}`);
    }

    return { filters, values };
};

const getJobs = async (whereClause = '', values = []) => {
    const result = await db.query(`${selectJobQuery} ${whereClause} ORDER BY j.created_at DESC`, values);
    return result.rows.map(formatJob);
};

router.post(
    '/jobs',
    authenticate,
    validateBody(jobSchema),
    asyncHandler(async (req, res) => {
        const id = randomUUID();
        const {
            company_id,
            category_id = null,
            title,
            description,
            job_type = null,
            experience_level = null,
            location_type = null,
            location_city = null,
            salary = null,
            salary_min = null,
            salary_max = null,
            is_salary_visible = true,
            location,
            status = 'open',
        } = req.body;

        await db.query(
            `INSERT INTO jobs (
                id, company_id, category_id, title, description, job_type,
                experience_level, location_type, location_city, salary,
                salary_min, salary_max, is_salary_visible, location, status
            ) VALUES (
                $1, $2, $3, $4, $5, $6,
                $7, $8, $9, $10,
                $11, $12, $13, $14, $15
            )`,
            [
                id, company_id, category_id, title, description, job_type,
                experience_level, location_type, location_city, salary,
                salary_min, salary_max, is_salary_visible, location, status,
            ]
        );

        const result = await db.query(`${selectJobQuery} WHERE j.id = $1 LIMIT 1`, [id]);

        return res.status(201).json({
            status: 'success',
            data: formatJob(result.rows[0]),
        });
    })
);

router.get(
    '/jobs',
    asyncHandler(async (req, res) => {
        const { filters, values } = buildJobFilters(req.query);
        const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
        const jobs = await getJobs(whereClause, values);

        return res.status(200).json({
            status: 'success',
            data: { jobs },
        });
    })
);

router.get(
    '/jobs/:id',
    asyncHandler(async (req, res) => {
        const result = await db.query(`${selectJobQuery} WHERE j.id = $1 LIMIT 1`, [req.params.id]);
        if (result.rows.length === 0) {
            throw new AppError(404, 'Job tidak ditemukan');
        }

        return res.status(200).json({
            status: 'success',
            data: formatJob(result.rows[0]),
        });
    })
);

router.get(
    '/jobs/company/:companyId',
    asyncHandler(async (req, res) => {
        const jobs = await getJobs('WHERE j.company_id = $1', [req.params.companyId]);

        return res.status(200).json({
            status: 'success',
            data: { jobs },
        });
    })
);

router.get(
    '/jobs/category/:categoryId',
    asyncHandler(async (req, res) => {
        const jobs = await getJobs('WHERE j.category_id = $1', [req.params.categoryId]);

        return res.status(200).json({
            status: 'success',
            data: { jobs },
        });
    })
);

router.put(
    '/jobs/:id',
    authenticate,
    validateBody(jobUpdateSchema),
    asyncHandler(async (req, res) => {
        const existing = await db.query('SELECT * FROM jobs WHERE id = $1 LIMIT 1', [req.params.id]);
        if (existing.rows.length === 0) {
            throw new AppError(404, 'Job tidak ditemukan');
        }

        const current = existing.rows[0];
        const payload = { ...current, ...req.body };

        await db.query(
            `UPDATE jobs
             SET company_id = $1,
                 category_id = $2,
                 title = $3,
                 description = $4,
                 job_type = $5,
                 experience_level = $6,
                 location_type = $7,
                 location_city = $8,
                 salary = $9,
                 salary_min = $10,
                 salary_max = $11,
                 is_salary_visible = $12,
                 location = $13,
                 status = $14,
                 updated_at = current_timestamp
             WHERE id = $15`,
            [
                payload.company_id,
                payload.category_id,
                payload.title,
                payload.description,
                payload.job_type,
                payload.experience_level,
                payload.location_type,
                payload.location_city,
                payload.salary,
                payload.salary_min,
                payload.salary_max,
                payload.is_salary_visible,
                payload.location,
                payload.status,
                req.params.id,
            ]
        );

        const updated = await db.query(`${selectJobQuery} WHERE j.id = $1 LIMIT 1`, [req.params.id]);

        return res.status(200).json({
            status: 'success',
            data: formatJob(updated.rows[0]),
        });
    })
);

router.delete(
    '/jobs/:id',
    authenticate,
    asyncHandler(async (req, res) => {
        const result = await db.query('DELETE FROM jobs WHERE id = $1 RETURNING id', [req.params.id]);
        if (result.rows.length === 0) {
            throw new AppError(404, 'Job tidak ditemukan');
        }

        return res.status(200).json({
            status: 'success',
            message: 'Job berhasil dihapus',
        });
    })
);

module.exports = router;