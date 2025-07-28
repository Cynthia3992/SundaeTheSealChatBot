import React from 'react';
import { ExternalLink, Mail, Calendar } from 'lucide-react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  const renderActions = () => {
    if (!message.actions || message.actions.length === 0) return null;

    return (
      <div className="mt-3 space-y-2">
        {message.actions.map((action, index) => (
          <button
            key={index}
            onClick={() => {
              if (action.url) {
                window.open(action.url, '_blank');
              }
            }}
            className="flex items-center space-x-2 text-sm bg-white border border-stack-blue text-stack-blue hover:bg-stack-blue hover:text-white px-3 py-2 rounded-lg transition-colors duration-200 w-full"
          >
            {action.type === 'link' && <ExternalLink className="w-4 h-4" />}
            {action.type === 'email' && <Mail className="w-4 h-4" />}
            {action.type === 'form' && <Calendar className="w-4 h-4" />}
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`chat-bubble ${isUser ? 'order-2' : 'order-1'}`}>
        {!isUser && (
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">🦭</span>
            <span className="text-xs text-gray-500 font-medium">Sundae</span>
          </div>
        )}
        
        <div
          className={`rounded-2xl p-4 ${
            isUser
              ? 'bg-stack-blue text-white rounded-br-md'
              : 'bg-gray-100 text-gray-800 rounded-bl-md'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
          
          {renderActions()}
        </div>
        
        <div className={`mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          <span className="text-xs text-gray-400">
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;