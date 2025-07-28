const express = require('express');
const { endSession } = require('../services/database-fallback');
const router = express.Router();

// Feedback endpoint for users to submit feedback
router.post('/feedback', async (req, res) => {
  try {
    const { sessionId, feedback } = req.body;
    
    if (!sessionId || !feedback) {
      return res.status(400).json({ error: 'Session ID and feedback are required' });
    }
    
    await endSession(sessionId, feedback);
    res.json({ success: true, message: 'Feedback recorded' });
    
  } catch (error) {
    console.error('Error recording feedback:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;