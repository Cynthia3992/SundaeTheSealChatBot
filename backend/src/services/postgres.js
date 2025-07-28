const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

let pool;

function initializeDatabase() {
  return new Promise(async (resolve, reject) => {
    try {
      if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL environment variable is not set');
      }

      // Create connection pool  
      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      // Test the connection
      await pool.query('SELECT NOW()');
      console.log('Connected to PostgreSQL database');

      // Create tables (no foreign key constraints to avoid issues)
      await pool.query(`
        CREATE TABLE IF NOT EXISTS chat_sessions (
          id VARCHAR(36) PRIMARY KEY,
          user_email TEXT,
          start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          end_time TIMESTAMP,
          feedback_rating INTEGER,
          feedback_comments TEXT,
          feedback_helpful BOOLEAN
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS messages (
          id VARCHAR(36) PRIMARY KEY,
          session_id VARCHAR(36),
          content TEXT NOT NULL,
          sender TEXT NOT NULL,
          category TEXT,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS unknown_questions (
          id VARCHAR(36) PRIMARY KEY,
          session_id VARCHAR(36),
          question TEXT NOT NULL,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          reviewed BOOLEAN DEFAULT FALSE
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS inappropriate_logs (
          id VARCHAR(36) PRIMARY KEY,
          session_id VARCHAR(36),
          content TEXT NOT NULL,
          user_ip TEXT,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log('PostgreSQL tables initialized');
      resolve();
    } catch (error) {
      console.error('Error initializing PostgreSQL database:', error);
      reject(error);
    }
  });
}

function logMessage(sessionId, content, sender, category = null) {
  return new Promise(async (resolve, reject) => {
    try {
      const messageId = uuidv4();
      const query = `INSERT INTO messages (id, session_id, content, sender, category) VALUES ($1, $2, $3, $4, $5)`;
      await pool.query(query, [messageId, sessionId, content, sender, category]);
      resolve(messageId);
    } catch (error) {
      console.error('Error logging message:', error);
      reject(error);
    }
  });
}

function createSession(userEmail, sessionId = null) {
  return new Promise(async (resolve, reject) => {
    try {
      const id = sessionId || uuidv4();
      
      // Check if session exists first
      const existingSession = await pool.query('SELECT id FROM chat_sessions WHERE id = $1', [id]);
      
      if (existingSession.rows.length === 0) {
        await pool.query('INSERT INTO chat_sessions (id, user_email) VALUES ($1, $2)', [id, userEmail]);
      }
      
      resolve(id);
    } catch (error) {
      console.error('Error creating session:', error);
      reject(error);
    }
  });
}

function endSession(sessionId, feedback = null) {
  return new Promise(async (resolve, reject) => {
    try {
      let query = `UPDATE chat_sessions SET end_time = CURRENT_TIMESTAMP`;
      let params = [sessionId];

      if (feedback) {
        query += `, feedback_rating = $2, feedback_comments = $3, feedback_helpful = $4`;
        params = [sessionId, feedback.rating, feedback.comments, feedback.helpful];
      }

      query += ` WHERE id = $1`;
      await pool.query(query, params);
      resolve();
    } catch (error) {
      console.error('Error ending session:', error);
      reject(error);
    }
  });
}

function logUnknownQuestion(sessionId, question) {
  return new Promise(async (resolve, reject) => {
    try {
      const id = uuidv4();
      const query = `INSERT INTO unknown_questions (id, session_id, question) VALUES ($1, $2, $3)`;
      await pool.query(query, [id, sessionId, question]);
      resolve(id);
    } catch (error) {
      console.error('Error logging unknown question:', error);
      reject(error);
    }
  });
}

function logInappropriateContent(sessionId, content, userIp) {
  return new Promise(async (resolve, reject) => {
    try {
      const id = uuidv4();
      const query = `INSERT INTO inappropriate_logs (id, session_id, content, user_ip) VALUES ($1, $2, $3, $4)`;
      await pool.query(query, [id, sessionId, content, userIp]);
      resolve(id);
    } catch (error) {
      console.error('Error logging inappropriate content:', error);
      reject(error);
    }
  });
}

function getSessionLogs(limit = 100) {
  return new Promise(async (resolve, reject) => {
    try {
      const query = `
        SELECT 
          s.*,
          COUNT(m.id) as message_count
        FROM chat_sessions s
        LEFT JOIN messages m ON s.id = m.session_id
        GROUP BY s.id, s.user_email, s.start_time, s.end_time, s.feedback_rating, s.feedback_comments, s.feedback_helpful
        ORDER BY s.start_time DESC
        LIMIT $1
      `;
      const result = await pool.query(query, [limit]);
      resolve(result.rows);
    } catch (error) {
      console.error('Error getting session logs:', error);
      reject(error);
    }
  });
}

function getUnknownQuestions(reviewed = false) {
  return new Promise(async (resolve, reject) => {
    try {
      const query = `SELECT * FROM unknown_questions WHERE reviewed = $1 ORDER BY timestamp DESC`;
      const result = await pool.query(query, [reviewed]);
      resolve(result.rows);
    } catch (error) {
      console.error('Error getting unknown questions:', error);
      reject(error);
    }
  });
}

function getAllMessages() {
  return new Promise(async (resolve, reject) => {
    try {
      const query = `SELECT * FROM messages ORDER BY timestamp DESC LIMIT 100`;
      const result = await pool.query(query);
      resolve(result.rows);
    } catch (error) {
      console.error('Error getting all messages:', error);
      reject(error);
    }
  });
}

function getSessionMessages(sessionId, limit = 20) {
  return new Promise(async (resolve, reject) => {
    try {
      const query = `SELECT * FROM messages WHERE session_id = $1 ORDER BY timestamp ASC LIMIT $2`;
      const result = await pool.query(query, [sessionId, limit]);
      resolve(result.rows);
    } catch (error) {
      console.error('Error getting session messages:', error);
      reject(error);
    }
  });
}

module.exports = {
  initializeDatabase,
  logMessage,
  createSession,
  endSession,
  logUnknownQuestion,
  logInappropriateContent,
  getSessionLogs,
  getUnknownQuestions,
  getAllMessages,
  getSessionMessages
};