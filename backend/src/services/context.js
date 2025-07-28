const fs = require('fs').promises;
const path = require('path');

let contextData = '';
let lastModified = null;

async function loadContext() {
  try {
    const contextPath = path.join(__dirname, '../../data/summary.txt');
    
    // Check if file exists, if not create a placeholder
    try {
      await fs.access(contextPath);
    } catch (error) {
      console.log('Creating placeholder summary.txt file...');
      await fs.writeFile(contextPath, 'Context data will be loaded here. Please add your Stack Creamery information to this file.');
    }

    const stats = await fs.stat(contextPath);
    
    // Only reload if file has been modified
    if (!lastModified || stats.mtime > lastModified) {
      contextData = await fs.readFile(contextPath, 'utf-8');
      lastModified = stats.mtime;
      console.log('Context data loaded successfully');
    }
    
    return contextData;
  } catch (error) {
    console.error('Error loading context:', error);
    return 'I apologize, but I\'m having trouble accessing my knowledge base right now.';
  }
}

function getContext() {
  return contextData;
}

// Reload context every 5 minutes to catch updates
setInterval(loadContext, 5 * 60 * 1000);

module.exports = {
  loadContext,
  getContext
};