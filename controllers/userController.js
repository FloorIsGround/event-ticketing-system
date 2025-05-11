


//two main functions for routes necessary
// POST/api/auth/register - registering a new user
//  POST/api/auth/login - authenticating a new user and returning JWT token

const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Consider moving JWT_SECRET to an environment variable for security
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10); //I use salt, which generates a random string, so a secret for bycrypt isn't required, but is still secure
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role,
        });

        await newUser.save();

        // Generate JWT for the timed-token
        const payload = {
            user: {
                id: newUser.id,
                role: newUser.role,
            },
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour

        res.status(201).json({
            token,
            user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
            message: 'User registered successfully'
        });

    } catch (error) {
        console.error('Error during user registration:', error.message);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

/**
 * @desc    Authenticate user & get token (Login)
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password' });
    }

    try {
        // Check for user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' }); // Generic message for security
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password); //bcrypt compares the password with the stored hash
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' }); // Generic message
        }

        // Generate JWT
        const payload = {
            user: {
                id: user.id,
                role: user.role,
            },
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
            message: 'Login successful'
        });

    } catch (error) {
        console.error('Error during user login:', error.message);
        res.status(500).json({ message: 'Server error during login' });
    }
};

module.exports = {
    registerUser,
    loginUser,
};