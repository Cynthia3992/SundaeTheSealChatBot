// Fallback database service that tries PostgreSQL first, then SQLite
const { v4: uuidv4 } = require('uuid');

let dbService;
let dbType = 'unknown';

async function initializeDatabase() {
  console.log('🔍 Initializing database...');
  console.log('DATABASE_URL present:', !!process.env.DATABASE_URL);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  
  // Try PostgreSQL first if DATABASE_URL is available
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '') {
    try {
      console.log('🐘 Attempting PostgreSQL connection...');
      const pgService = require('./postgres');
      await pgService.initializeDatabase();
      dbService = pgService;
      dbType = 'postgresql';
      console.log('✅ Using PostgreSQL database');
      return;
    } catch (error) {
      console.error('❌ PostgreSQL connection failed:', error.message);
      console.log('🔄 Falling back to SQLite...');
    }
  } else {
    console.log('📝 No DATABASE_URL found, using SQLite...');
  }

  try {
    // Fallback to SQLite
    console.log('💾 Initializing SQLite database...');
    const sqliteService = require('./database');
    await sqliteService.initializeDatabase();
    dbService = sqliteService;
    dbType = 'sqlite';
    console.log('✅ Using SQLite database (fallback)');
  } catch (error) {
    console.error('❌ Both PostgreSQL and SQLite failed:', error);
    console.error('Stack trace:', error.stack);
    throw error;
  }
}

// Proxy all database functions to the active service
function logMessage(sessionId, content, sender, category = null) {
  if (!dbService) throw new Error('Database not initialized');
  return dbService.logMessage(sessionId, content, sender, category);
}

function createSession(userEmail, sessionId = null) {
  if (!dbService) throw new Error('Database not initialized');
  return dbService.createSession(userEmail, sessionId);
}

function endSession(sessionId, feedback = null) {
  if (!dbService) throw new Error('Database not initialized');
  return dbService.endSession(sessionId, feedback);
}

function logUnknownQuestion(sessionId, question) {
  if (!dbService) throw new Error('Database not initialized');
  return dbService.logUnknownQuestion(sessionId, question);
}

function logInappropriateContent(sessionId, content, userIp) {
  if (!dbService) throw new Error('Database not initialized');
  return dbService.logInappropriateContent(sessionId, content, userIp);
}

function getSessionLogs(limit = 100) {
  if (!dbService) throw new Error('Database not initialized');
  return dbService.getSessionLogs(limit);
}

function getUnknownQuestions(reviewed = false) {
  if (!dbService) throw new Error('Database not initialized');
  return dbService.getUnknownQuestions(reviewed);
}

function getAllMessages() {
  if (!dbService) throw new Error('Database not initialized');
  return dbService.getAllMessages();
}

function getSessionMessages(sessionId, limit = 20) {
  if (!dbService) throw new Error('Database not initialized');
  return dbService.getSessionMessages(sessionId, limit);
}

function getDbType() {
  return dbType;
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
  getSessionMessages,
  getDbType
};