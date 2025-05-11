const express = require('express');
const router = express.Router();

const { registerUser, loginUser } = require('../../controllers/userController');

//POST/api/auth/register
router.route('/register')
.post(registerUser);

//POST/api/auth/login
router.route('/login')
.post(loginUser);

module.exports = router;