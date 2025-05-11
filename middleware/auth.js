const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

const auth = async (req, res, next) => {
    let token;
    try {
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            // get token from header (e.g., "Bearer <token>")
            token = req.headers.authorization.split(' ')[1];

            // verify token
            const decoded = jwt.verify(token, JWT_SECRET);

            // get user from the token's payload (assuming payload is { user: { id: '...', role: '...' } })
            // fetch fresh user data to ensure user still exists and has up-to-date info
            req.user = await User.findById(decoded.user.id).select('-password'); // exclude password

            if (!req.user) {
                // user belonging to token no longer exists
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }
            next();
        } else {
            return res.status(401).json({ message: 'Not authorized, no token provided' });
        }
    } catch (error) {
        console.error('Token verification error:', error.message);
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

const adminCheck = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
}

const userCheck = (req, res, next) => {
    if (req.user && req.user.role === 'user') {
        next();
    } else {
        res.status(403).json({ message: 'Admin is not allowed to perform this action.' });
    }
}

module.exports = { auth, adminCheck, userCheck };
