const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");

// @route   GET /api/auth/google
// @desc    Initiate Google OAuth flow
router.get("/google", authController.googleAuth);

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
router.get("/google/callback", authController.googleAuthCallback);

module.exports = router;
