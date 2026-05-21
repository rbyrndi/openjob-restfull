const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({
            status: 'failed',
            message: 'Authentication token is required',
        });
    }

    const token = authorization.split(' ')[1];

    try {
        const payload = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
        req.user = { id: payload.id };
        next();
    } catch (error) {
        return res.status(401).json({
            status: 'failed',
            message: 'Invalid or expired access token',
        });
    }
};

module.exports = authenticate;