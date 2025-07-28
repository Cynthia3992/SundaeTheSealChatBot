import React, { useState, useRef, useEffect } from 'react';
import { Send, LogOut, RotateCcw, MessageSquare } from 'lucide-react';
import MessageBubble from './MessageBubble';
import { Message, ChatSession } from '../types';
import { generateId } from '../utils';

interface ChatInterfaceProps {
  userEmail?: string;
  onLogout: () => void;
  onSessionEnd: () => void;
  onSessionUpdate: (session: ChatSession) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  userEmail,
  onLogout,
  onSessionEnd,
  onSessionUpdate
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(generateId());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Send welcome message
    const welcomeMessage: Message = {
      id: generateId(),
      content: "🦭 Hi there! I'm Sundae the Seal, your friendly Stack Creamery assistant! I'm here to help with questions about our delicious ice cream, store hours, locations, catering, and more. What can I help you with today?",
      sender: 'bot',
      timestamp: new Date(),
      category: 'general'
    };
    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    // Update session
    const session: ChatSession = {
      id: sessionId,
      messages,
      startTime: new Date(),
    };
    onSessionUpdate(session);
  }, [messages, sessionId, onSessionUpdate]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return;

    const userMessage: Message = {
      id: generateId(),
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          sessionId,
          userEmail
        })
      });

      const data = await response.json();

      const botMessage: Message = {
        id: generateId(),
        content: data.response,
        sender: 'bot',
        timestamp: new Date(),
        category: data.category,
        actions: data.actions
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: generateId(),
        content: "Oops! I'm having trouble connecting right now. Please try again in a moment! 🦭",
        sender: 'bot',
        timestamp: new Date(),
        category: 'general'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const resetChat = () => {
    setMessages([]);
    // Re-send welcome message
    setTimeout(() => {
      const welcomeMessage: Message = {
        id: generateId(),
        content: "🦭 Hi there! I'm Sundae the Seal, your friendly Stack Creamery assistant! I'm here to help with questions about our delicious ice cream, store hours, locations, catering, and more. What can I help you with today?",
        sender: 'bot',
        timestamp: new Date(),
        category: 'general'
      };
      setMessages([welcomeMessage]);
    }, 100);
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="bg-stack-blue text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-2xl">🦭</span>
            </div>
            <div>
              <h1 className="font-bold text-lg">Sundae the Seal</h1>
              <p className="text-blue-200 text-sm">Stack Creamery Assistant</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={resetChat}
              className="p-2 hover:bg-blue-600 rounded-lg transition-colors"
              title="Reset Chat"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={onSessionEnd}
              className="p-2 hover:bg-blue-600 rounded-lg transition-colors"
              title="End Session & Provide Feedback"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
            <button
              onClick={onLogout}
              className="p-2 hover:bg-blue-600 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl p-4 max-w-xs">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-500">Sundae is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t bg-gray-50 p-4">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Sundae anything about Stack Creamery..."
              className="chat-input"
              rows={1}
              disabled={loading}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed p-3"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;