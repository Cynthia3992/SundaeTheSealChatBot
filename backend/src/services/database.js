const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.join(__dirname, '../../data/chatbot.db');
let db;

function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }
      
      console.log('Connected to SQLite database');
      
      // Create tables
      db.serialize(() => {
        // Chat sessions table
        db.run(`
          CREATE TABLE IF NOT EXISTS chat_sessions (
            id TEXT PRIMARY KEY,
            user_email TEXT,
            start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
            end_time DATETIME,
            feedback_rating INTEGER,
            feedback_comments TEXT,
            feedback_helpful BOOLEAN
          )
        `);
        
        // Messages table
        db.run(`
          CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            session_id TEXT,
            content TEXT NOT NULL,
            sender TEXT NOT NULL,
            category TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (session_id) REFERENCES chat_sessions (id)
          )
        `);
        
        // Unknown questions log
        db.run(`
          CREATE TABLE IF NOT EXISTS unknown_questions (
            id TEXT PRIMARY KEY,
            session_id TEXT,
            question TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            reviewed BOOLEAN DEFAULT FALSE,
            FOREIGN KEY (session_id) REFERENCES chat_sessions (id)
          )
        `);
        
        // Inappropriate content log
        db.run(`
          CREATE TABLE IF NOT EXISTS inappropriate_logs (
            id TEXT PRIMARY KEY,
            session_id TEXT,
            content TEXT NOT NULL,
            user_ip TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (session_id) REFERENCES chat_sessions (id)
          )
        `);
        
        console.log('Database tables initialized');
        resolve();
      });
    });
  });
}

function logMessage(sessionId, content, sender, category = null) {
  return new Promise((resolve, reject) => {
    const messageId = uuidv4();
    const sql = `INSERT INTO messages (id, session_id, content, sender, category) VALUES (?, ?, ?, ?, ?)`;
    
    db.run(sql, [messageId, sessionId, content, sender, category], function(err) {
      if (err) {
        console.error('Error logging message:', err);
        reject(err);
        return;
      }
      resolve(messageId);
    });
  });
}

function createSession(userEmail, sessionId = null) {
  return new Promise((resolve, reject) => {
    const id = sessionId || uuidv4();
    const sql = `INSERT OR IGNORE INTO chat_sessions (id, user_email) VALUES (?, ?)`;
    
    db.run(sql, [id, userEmail], function(err) {
      if (err) {
        console.error('Error creating session:', err);
        reject(err);
        return;
      }
      resolve(id);
    });
  });
}

function endSession(sessionId, feedback = null) {
  return new Promise((resolve, reject) => {
    let sql = `UPDATE chat_sessions SET end_time = CURRENT_TIMESTAMP`;
    let params = [sessionId];
    
    if (feedback) {
      sql += `, feedback_rating = ?, feedback_comments = ?, feedback_helpful = ?`;
      params.unshift(feedback.rating, feedback.comments, feedback.helpful);
    }
    
    sql += ` WHERE id = ?`;
    
    db.run(sql, params, function(err) {
      if (err) {
        console.error('Error ending session:', err);
        reject(err);
        return;
      }
      resolve();
    });
  });
}

function logUnknownQuestion(sessionId, question) {
  return new Promise((resolve, reject) => {
    const id = uuidv4();
    const sql = `INSERT INTO unknown_questions (id, session_id, question) VALUES (?, ?, ?)`;
    
    db.run(sql, [id, sessionId, question], function(err) {
      if (err) {
        console.error('Error logging unknown question:', err);
        reject(err);
        return;
      }
      resolve(id);
    });
  });
}

function logInappropriateContent(sessionId, content, userIp) {
  return new Promise((resolve, reject) => {
    const id = uuidv4();
    const sql = `INSERT INTO inappropriate_logs (id, session_id, content, user_ip) VALUES (?, ?, ?, ?)`;
    
    db.run(sql, [id, sessionId, content, userIp], function(err) {
      if (err) {
        console.error('Error logging inappropriate content:', err);
        reject(err);
        return;
      }
      resolve(id);
    });
  });
}

function getSessionLogs(limit = 100) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        s.*,
        COUNT(m.id) as message_count
      FROM chat_sessions s
      LEFT JOIN messages m ON s.id = m.session_id
      GROUP BY s.id
      ORDER BY s.start_time DESC
      LIMIT ?
    `;
    
    db.all(sql, [limit], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}

function getUnknownQuestions(reviewed = false) {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM unknown_questions WHERE reviewed = ? ORDER BY timestamp DESC`;
    
    db.all(sql, [reviewed], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}

function getAllMessages() {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM messages ORDER BY timestamp DESC LIMIT 100`;
    
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}

function getSessionMessages(sessionId, limit = 20) {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM messages WHERE session_id = ? ORDER BY timestamp ASC LIMIT ?`;
    
    db.all(sql, [sessionId, limit], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
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