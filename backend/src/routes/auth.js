const express = require('express');
const bcrypt = require('bcrypt');
const { createSession } = require('../services/database');
const router = express.Router();

const AUTHORIZED_EMAILS = process.env.AUTHORIZED_EMAILS 
  ? process.env.AUTHORIZED_EMAILS.split(',').map(email => email.trim())
  : ['admin@stackcreamery.com'];

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'stackcreamery2024';

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Check if email is authorized
    const isAuthorized = AUTHORIZED_EMAILS.some(
      authorizedEmail => authorizedEmail.toLowerCase() === email.toLowerCase()
    );
    
    if (!isAuthorized) {
      return res.status(401).json({ message: 'Email not authorized for testing' });
    }
    
    // Check password (in production, you'd want proper password hashing per user)
    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ message: 'Invalid password' });
    }
    
    // Create a new chat session
    const sessionId = await createSession(email);
    
    res.json({ 
      success: true, 
      message: 'Authentication successful',
      sessionId
    });
    
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/logout', (req, res) => {
  // In a more complex app, you'd invalidate tokens here
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;