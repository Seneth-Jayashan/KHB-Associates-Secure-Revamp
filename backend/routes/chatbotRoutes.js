const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const chatbotController = require('../controller/chatbotController');

// The chatbot is available to logged-out visitors, so the endpoint is public.
// Rate limiting per IP stops it being abused as a free, unlimited Gemini proxy.
const chatbotLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again later.' },
});

router.post('/message', chatbotLimiter, chatbotController.sendMessage);

module.exports = router;
