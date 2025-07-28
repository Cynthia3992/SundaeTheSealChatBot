import React, { useState } from 'react';
import { X, Star, MessageSquare } from 'lucide-react';
import { ChatSession, SessionFeedback } from '../types';

interface FeedbackModalProps {
  session: ChatSession | null;
  onSubmit: (feedback: SessionFeedback) => void;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ session, onSubmit, onClose }) => {
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');
  const [helpful, setHelpful] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const feedback: SessionFeedback = {
      rating,
      comments: comments.trim() || undefined,
      helpful
    };

    onSubmit(feedback);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-stack-yellow rounded-full flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">How was your chat?</h2>
              <p className="text-sm text-gray-600">Help us improve Sundae!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Rate your experience
            </label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star 
                    className={`w-8 h-8 ${
                      star <= rating 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Was Sundae helpful?
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={helpful}
                  onChange={() => setHelpful(true)}
                  className="mr-2 text-stack-blue focus:ring-stack-blue"
                />
                <span className="text-sm">Yes, very helpful</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={!helpful}
                  onChange={() => setHelpful(false)}
                  className="mr-2 text-stack-blue focus:ring-stack-blue"
                />
                <span className="text-sm">Could be better</span>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-2">
              Additional comments (optional)
            </label>
            <textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stack-blue focus:border-transparent resize-none"
              placeholder="What worked well? What could be improved?"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={rating === 0}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              Submit Feedback
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;