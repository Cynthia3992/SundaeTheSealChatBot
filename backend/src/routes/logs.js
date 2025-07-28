const express = require('express');
const { getSessionLogs, getUnknownQuestions, endSession } = require('../services/database');
const router = express.Router();

// Simple admin check - in production, use proper JWT tokens
function isAdmin(req, res, next) {
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

router.get('/sessions', isAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const sessions = await getSessionLogs(limit);
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching session logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/unknown-questions', isAdmin, async (req, res) => {
  try {
    const reviewed = req.query.reviewed === 'true';
    const questions = await getUnknownQuestions(reviewed);
    res.json(questions);
  } catch (error) {
    console.error('Error fetching unknown questions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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