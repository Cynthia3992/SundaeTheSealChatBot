import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import AuthGate from './components/AuthGate';
import FeedbackModal from './components/FeedbackModal';
import { AuthState, ChatSession, SessionFeedback } from './types';

function App() {
  const [authState, setAuthState] = useState<AuthState>({ isAuthenticated: false });
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated
    const storedAuth = localStorage.getItem('sundae-auth');
    if (storedAuth) {
      setAuthState(JSON.parse(storedAuth));
    }
  }, []);

  const handleLogin = (email: string) => {
    const newAuthState = { isAuthenticated: true, email };
    setAuthState(newAuthState);
    localStorage.setItem('sundae-auth', JSON.stringify(newAuthState));
  };

  const handleLogout = () => {
    setAuthState({ isAuthenticated: false });
    localStorage.removeItem('sundae-auth');
    setCurrentSession(null);
  };

  const handleSessionEnd = () => {
    setShowFeedback(true);
  };

  const handleFeedbackSubmit = (feedback: SessionFeedback) => {
    if (currentSession) {
      // Submit feedback to backend
      console.log('Feedback submitted:', feedback);
      setShowFeedback(false);
      setCurrentSession(null);
    }
  };

  if (!authState.isAuthenticated) {
    return <AuthGate onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ChatInterface 
        userEmail={authState.email}
        onLogout={handleLogout}
        onSessionEnd={handleSessionEnd}
        onSessionUpdate={setCurrentSession}
      />
      
      {showFeedback && (
        <FeedbackModal
          session={currentSession}
          onSubmit={handleFeedbackSubmit}
          onClose={() => setShowFeedback(false)}
        />
      )}
    </div>
  );
}

export default App;