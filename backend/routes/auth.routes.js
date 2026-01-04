const express = require('express');
const router = express.Router();
const authController = require('../controller/auth.controller');

// POST /api/auth/register
router.post('/register', authController.register);

// POST /api/auth/login
router.post('/login', authController.login);

// GET /api/auth/me
router.get('/me', authController.getCurrentUser);

// PATCH /api/auth/me
router.patch('/me', authController.updateCurrentUser);

// DELETE /api/auth/me
router.delete('/me', authController.deleteCurrentUser);

// PATCH /api/auth/change-password
router.patch('/change-password', authController.changePassword);

module.exports = router;
