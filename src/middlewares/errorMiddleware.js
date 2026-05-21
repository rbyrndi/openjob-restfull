const errorHandler = (err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({
            status: 'failed',
            message: 'Invalid JSON payload',
        });
    }

    if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            status: 'failed',
            message: 'Invalid or expired token',
        });
    }

    if (err.code === '23505') {
        return res.status(409).json({
            status: 'failed',
            message: 'Resource already exists',
        });
    }

    if (err.code === '23503') {
        return res.status(400).json({
            status: 'failed',
            message: 'Referenced resource does not exist',
        });
    }

    if (err.statusCode) {
        return res.status(err.statusCode).json({
            status: err.status || 'failed',
            message: err.message,
        });
    }

    return res.status(500).json({
        status: 'failed',
        message: 'Internal server error',
    });
};

module.exports = errorHandler;