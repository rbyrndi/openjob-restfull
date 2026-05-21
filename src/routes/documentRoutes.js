const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { randomUUID } = require('crypto');

const db = require('../config/db');
const authenticate = require('../middlewares/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { formatDocument } = require('../utils/serializers');

const router = express.Router();

const uploadDir = path.join(process.cwd(), 'uploads', 'documents');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname);
        cb(null, `${Date.now()}-${randomUUID()}${extension}`);
    },
});

const upload = multer({ storage });

router.get(
    '/documents',
    asyncHandler(async (req, res) => {
        const result = await db.query('SELECT * FROM documents ORDER BY created_at DESC');

        return res.status(200).json({
            status: 'success',
            data: { documents: result.rows.map(formatDocument) },
        });
    })
);

router.get(
    '/documents/:id',
    asyncHandler(async (req, res) => {
        const result = await db.query('SELECT * FROM documents WHERE id = $1 LIMIT 1', [req.params.id]);
        if (result.rows.length === 0) {
            throw new AppError(404, 'Document tidak ditemukan');
        }

        return res.status(200).json({
            status: 'success',
            data: formatDocument(result.rows[0]),
        });
    })
);

router.post(
    '/documents',
    authenticate,
    upload.single('document'),
    asyncHandler(async (req, res) => {
        if (!req.file) {
            throw new AppError(400, 'Document file wajib diunggah');
        }

        const id = randomUUID();
        const result = await db.query(
            'INSERT INTO documents (id, user_id, name, file_url) VALUES ($1, $2, $3, $4) RETURNING *',
            [id, req.user.id, req.file.originalname, `/uploads/documents/${req.file.filename}`]
        );

        return res.status(201).json({
            status: 'success',
            data: formatDocument(result.rows[0]),
        });
    })
);

router.delete(
    '/documents/:id',
    authenticate,
    asyncHandler(async (req, res) => {
        const result = await db.query('SELECT * FROM documents WHERE id = $1 LIMIT 1', [req.params.id]);
        if (result.rows.length === 0) {
            throw new AppError(404, 'Document tidak ditemukan');
        }

        const document = result.rows[0];
        const filePath = path.join(process.cwd(), document.file_url.replace(/^\//, ''));
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await db.query('DELETE FROM documents WHERE id = $1', [req.params.id]);

        return res.status(200).json({
            status: 'success',
            message: 'Document berhasil dihapus',
        });
    })
);

module.exports = router;