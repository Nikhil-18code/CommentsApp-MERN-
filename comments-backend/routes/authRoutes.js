const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/auth');

//Auth
router.post('/register', authController.register);
router.post('/login', authController.login);

// profile
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;

