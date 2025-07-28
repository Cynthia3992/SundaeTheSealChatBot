# Sundae the Seal Chatbot

A standalone AI-powered chatbot web application for Stack Creamery, featuring Sundae the Seal as the friendly assistant. Built for internal testing before main website integration.

## 🦭 Features

- **AI-Powered Chat**: GPT-4 powered responses with Sundae the Seal personality
- **Rules-Based**: Strictly factual, context-driven responses from business data
- **Category Detection**: Automatically categorizes queries (hours, menu, catering, etc.)
- **Action Buttons**: Quick links to relevant pages and forms
- **Logging System**: Comprehensive chat history and analytics
- **Feedback Collection**: Session-end feedback for continuous improvement
- **Inappropriate Content Filtering**: Auto-rejection with logging
- **Authentication**: Password-protected for internal team testing

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- OpenAI API key
- Stack Creamery business information

### Installation

1. **Clone and Setup**
```bash
cd "Sundae the Seal chatbot"
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your OpenAI API key and other settings
```

3. **Frontend Setup**
```bash
cd ../frontend
npm install
```

4. **Add Business Context**
Edit `backend/data/summary.txt` with your Stack Creamery information (hours, menu, locations, etc.)

### Running the Application

1. **Start Backend** (Terminal 1)
```bash
cd backend
npm run dev
```

2. **Start Frontend** (Terminal 2)
```bash
cd frontend
npm run dev
```

3. **Access Application**
- Open http://localhost:3000
- Login with authorized email and password from .env

## 📁 Project Structure

```
Sundae the Seal chatbot/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/       # Chat components
│   │   ├── types/           # TypeScript interfaces
│   │   └── utils/           # Helper functions
│   └── package.json
├── backend/                  # Node.js backend
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic
│   │   └── index.js         # Server entry
│   ├── data/
│   │   ├── summary.txt      # Business context (EDIT THIS!)
│   │   └── chatbot.db       # SQLite database (auto-created)
│   └── package.json
└── README.md
```

## ⚙️ Configuration

### Environment Variables (.env)
```bash
# Required
OPENAI_API_KEY=your_openai_api_key
ADMIN_PASSWORD=your_test_password
AUTHORIZED_EMAILS=admin@stackcreamery.com,team@stackcreamery.com

# Optional
PORT=5000
NOTIFICATION_EMAIL=support@stackcreamery.com
```

### Business Context (summary.txt)
Replace the placeholder content in `backend/data/summary.txt` with:
- Store hours and locations
- Menu items and pricing
- Catering services
- Dietary options
- Ordering process
- Contact information

## 🤖 How It Works

1. **Authentication**: Users login with authorized email/password
2. **Context Loading**: Server loads business info from summary.txt
3. **Chat Processing**: 
   - Categorizes user messages
   - Generates responses using OpenAI + context
   - Provides relevant action buttons
   - Logs all interactions
4. **Feedback**: Users provide session feedback for improvements

## 📊 Analytics & Logging

### Database Tables
- `chat_sessions`: Session tracking with feedback
- `messages`: All chat messages with categories
- `unknown_questions`: Flagged unclear queries
- `inappropriate_logs`: Filtered inappropriate content

### Available Log Endpoints

All log endpoints require admin authentication using your `ADMIN_PASSWORD` as the `x-admin-key` header.

#### 1. Chat Sessions
View all chat sessions with user info, timestamps, and feedback:
```bash
curl -H "x-admin-key: YOUR_ADMIN_PASSWORD" https://your-app-url.railway.app/api/logs/sessions
```
**Returns:** Session IDs, user emails, start/end times, feedback ratings, message counts

#### 2. All Messages
View individual chat messages with full conversation history:
```bash
curl -H "x-admin-key: YOUR_ADMIN_PASSWORD" https://your-app-url.railway.app/api/logs/messages
```
**Returns:** Message content, sender (user/bot), categories, timestamps, session IDs

#### 3. Unknown Questions
View questions Sundae couldn't answer (flagged for review):
```bash
curl -H "x-admin-key: YOUR_ADMIN_PASSWORD" https://your-app-url.railway.app/api/logs/unknown-questions
```
**Returns:** Unclear questions, timestamps, review status

#### 4. Health Check
Check if the API is running (no authentication required):
```bash
curl https://your-app-url.railway.app/api/health
```

### Browser Access with Headers
To view logs in your browser, use a browser extension like "ModHeader" (Chrome) or "Header Editor" (Firefox):
1. Install the extension
2. Add header: `x-admin-key: YOUR_ADMIN_PASSWORD`  
3. Visit the log URLs directly in your browser

### Railway Dashboard Logs
Additional system logs available in Railway:
- Go to your Railway project dashboard
- Click the **"Logs"** tab
- View server startup, API requests, and error logs

### Quick Access Commands (Stack Creamery Deployment)
For your deployed chatbot at `https://sundaethesealchatbot-production.up.railway.app/`:

**View Sessions:**
```bash
curl -H "x-admin-key: stackcreamery2024" https://sundaethesealchatbot-production.up.railway.app/api/logs/sessions
```

**View Messages:**
```bash
curl -H "x-admin-key: stackcreamery2024" https://sundaethesealchatbot-production.up.railway.app/api/logs/messages
```

**View Unknown Questions:**
```bash
curl -H "x-admin-key: stackcreamery2024" https://sundaethesealchatbot-production.up.railway.app/api/logs/unknown-questions
```

**Health Check:**
```bash
curl https://sundaethesealchatbot-production.up.railway.app/api/health
```

## 🛡️ Security Features

- Password authentication for internal testing
- Rate limiting (100 requests/15 minutes)
- Inappropriate content filtering
- CORS protection
- Request validation

## 🎨 Customization

### Sundae's Personality
Edit `backend/src/services/openai.js` system prompt to adjust:
- Tone and voice
- Response style
- Emoji usage
- Brand messaging

### UI Styling
Customize colors in `frontend/tailwind.config.js`:
```javascript
colors: {
  'stack-blue': '#1e3a8a',    // Primary brand color
  'stack-pink': '#ec4899',    // Accent color
  'stack-yellow': '#fbbf24',  // Highlight color
}
```

## 🚀 Deployment

### Production Checklist
- [ ] Update CORS origins in backend/src/index.js
- [ ] Set NODE_ENV=production
- [ ] Use strong ADMIN_PASSWORD
- [ ] Configure proper email notifications
- [ ] Set up SSL/HTTPS
- [ ] Configure rate limiting for production load

### Hosting Options
- **Vercel**: Frontend + Serverless backend
- **Railway**: Full-stack deployment
- **Render**: Container deployment
- **DigitalOcean**: VPS hosting

## 🔧 Development

### Frontend Development
```bash
cd frontend
npm run dev     # Development server
npm run build   # Production build
npm run lint    # Code linting
```

### Backend Development
```bash
cd backend
npm run dev     # Development server with nodemon
npm start       # Production server
npm test        # Run tests
```

## 📝 API Endpoints

- `POST /api/auth/login` - User authentication
- `POST /api/chat` - Send chat message
- `POST /api/logs/feedback` - Submit session feedback
- `GET /api/logs/sessions` - Admin: view chat logs
- `GET /api/logs/unknown-questions` - Admin: review unclear queries

## 🤝 Contributing

1. Update business context in `summary.txt`
2. Test chat responses thoroughly
3. Review analytics for improvement opportunities
4. Adjust prompts based on user feedback

## 📞 Support

For technical issues or questions:
- Check logs at `/api/logs/sessions` (admin access)
- Review unknown questions at `/api/logs/unknown-questions`
- Monitor console output for errors

---

**Built with ❤️ for Stack Creamery's sweet success! 🍦**