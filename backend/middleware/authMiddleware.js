const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY;

const authMiddleware = (roles) => (req, res, next) => {

    // Get JWT from HttpOnly cookie
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            message: 'Access denied. No authentication token provided.'
        });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);

        req.user = decoded;

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: 'Access denied. You do not have permission'
            });
        }

        next();

    } catch (error) {

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Session expired. Please log in again."
            });
        }

        return res.status(401).json({
            message: 'Invalid authentication token'
        });
    }
};

module.exports = authMiddleware;