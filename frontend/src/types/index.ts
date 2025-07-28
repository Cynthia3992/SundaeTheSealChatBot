export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  category?: MessageCategory;
  actions?: MessageAction[];
}

export interface MessageAction {
  type: 'link' | 'form' | 'email';
  label: string;
  url?: string;
  data?: any;
}

export type MessageCategory = 
  | 'hours'
  | 'menu'
  | 'location'
  | 'catering'
  | 'dietary'
  | 'seasonal'
  | 'giftcards'
  | 'ordering'
  | 'general'
  | 'inappropriate'
  | 'unknown';

export interface ChatSession {
  id: string;
  messages: Message[];
  startTime: Date;
  endTime?: Date;
  feedback?: SessionFeedback;
}

export interface SessionFeedback {
  rating: number;
  comments?: string;
  helpful: boolean;
}

export interface CateringLead {
  name: string;
  email: string;
  eventType: string;
  message?: string;
  timestamp: Date;
}

export interface AuthState {
  isAuthenticated: boolean;
  email?: string;
}