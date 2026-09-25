const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY;

const authMiddleware = (roles) => (req, res, next) => {
    const tokenHeader = req.header('Authorization');
    const token = tokenHeader && tokenHeader.startsWith("Bearer ") ? tokenHeader.split(" ")[1] : null;

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied. You do not have permission' });
        }

        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Session expired. Please log in again." });
        }
        // Generic 401 - do not leak verification details (CWE-639 remediation)
        return res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = authMiddleware;
