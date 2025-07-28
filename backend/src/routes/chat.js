const express = require('express');
const { generateResponse } = require('../services/openai');
const { logMessage, logUnknownQuestion, logInappropriateContent, createSession } = require('../services/database-fallback');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { message, sessionId, userEmail } = req.body;
    
    if (!message || !sessionId) {
      return res.status(400).json({ error: 'Message and session ID are required' });
    }
    
    // Ensure session exists in database
    try {
      await createSession(userEmail, sessionId);
    } catch (error) {
      // Session might already exist, that's ok
      console.log('Session already exists or creation failed:', error.message);
    }
    
    // Log user message
    await logMessage(sessionId, message, 'user');
    
    // Generate AI response
    const { response, category, actions } = await generateResponse(message, sessionId, userEmail);
    
    // Log bot response
    await logMessage(sessionId, response, 'bot', category);
    
    // Handle special categories
    if (category === 'inappropriate') {
      const userIp = req.ip || req.connection.remoteAddress;
      await logInappropriateContent(sessionId, message, userIp);
    }
    
    // Check if this might be an unknown question (basic heuristic)
    if (category === 'general' && (
      response.includes("I don't know") || 
      response.includes("I'm not sure") ||
      response.includes("contact the store")
    )) {
      await logUnknownQuestion(sessionId, message);
    }
    
    res.json({
      response,
      category,
      actions: actions || []
    });
    
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      response: "🦭 Sorry, I'm having a brain freeze right now! Please try asking me again in a moment.",
      category: 'general',
      actions: []
    });
  }
});

module.exports = router;