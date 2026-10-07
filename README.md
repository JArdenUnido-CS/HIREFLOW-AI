# HireFlow AI

> AI-powered resume screening, candidate ranking, and intelligent recruitment platform

An intelligent recruitment management system built with React, Express, and MySQL. Streamline your hiring process with AI-driven candidate evaluation and visual pipeline management.

## ✨ Features

- **AI Resume Screening** - Automatically parse and score resumes
- **Job Matching** - Intelligently match candidates to jobs
- **Visual Pipeline** - Kanban board for recruitment workflow
- **Real-Time Dashboard** - Key metrics and hiring funnel visualization
- **Interview Scheduler** - Manage and track interviews
- **Candidate Profiles** - Rich candidate data with parsed resumes
- **Activity Tracking** - Complete audit trail of recruitment activities
- **Role-Based Access** - Admin, recruiter, hiring manager, and candidate roles

## 🚀 Quick Start

### Prerequisites

- **Node.js** 16+ with npm
- **MySQL** 8.0+
- **Git**

### Installation

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd HIREFLOW-AI
   ```

2. **Install Dependencies**
   ```bash
   npm install
   npm install --workspace=client
   npm install --workspace=server
   ```

3. **Setup Database**
   ```bash
   # Create database and tables
   mysql -u root < server/database/schema.sql
   
   # Load seed data
   mysql -u root hireflow_ai < server/database/seed.sql
   ```

4. **Configure Environment**
   
   Create `.env` in root directory:
   ```env
   NODE_ENV=development
   PORT=3001
   API_URL=http://localhost:3001
   FRONTEND_URL=http://localhost:5173
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=hireflow_ai
   JWT_SECRET=dev-secret-key-change-in-production
   CORS_ORIGIN=http://localhost:5173
   ```
   
   Create `client/.env`:
   ```env
   VITE_API_URL=http://localhost:3001/api
   ```

5. **Start Development Servers**

   Terminal 1 - Backend:
   ```bash
   npm run dev --workspace=server
   ```
   
   Terminal 2 - Frontend:
   ```bash
   npm run dev --workspace=client
   ```

6. **Access Application**
   
   Open http://localhost:5173 in your browser
   
   **Demo Login:**
   - Email: `JardenUnido@hireflow.ai`
   - Password: `password123`

## 📁 Project Structure

```
hireflow-ai/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── features/          # Feature modules (dashboard, jobs, candidates, etc.)
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # API client (api.ts)
│   │   ├── stores/            # Zustand stores
│   │   ├── types/             # TypeScript interfaces
│   │   └── lib/               # Utilities
│   └── package.json
│
├── server/                    # Express Backend
│   ├── src/
│   │   ├── config/            # Configuration (database.ts)
│   │   ├── middleware/        # Middleware (auth.ts)
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic (AuthService.ts)
│   │   ├── repositories/      # Data access layer
│   │   └── utils/             # Helpers (db.ts, helpers.ts)
│   ├── database/
│   │   ├── schema.sql         # Database schema
│   │   └── seed.sql           # Sample data
│   └── package.json
│
├── .env                       # Environment variables (create this)
├── .gitignore
├── ARCHITECTURE.md            # System architecture
├── SETUP_AND_TESTING.md       # Setup guide and testing checklist
└── README.md                  # This file
```

## 🗄️ Database

### Tables

- **users** - User accounts with roles and authentication
- **jobs** - Job postings with requirements and details
- **candidates** - Applicant profiles with resume data
- **interviews** - Interview scheduling and tracking
- **activities** - Audit trail of workflow events
- **notifications** - User alerts and notifications

### Database Setup

```bash
# Create database from schema
mysql -u root < server/database/schema.sql

# Populate with seed data
mysql -u root hireflow_ai < server/database/seed.sql

# Verify connection
mysql -u root hireflow_ai -e "SELECT COUNT(*) as users FROM users;"
```

## 🔐 Authentication

- **Password Hashing:** bcrypt (10 rounds)
- **Token Type:** JWT (JSON Web Token)
- **Access Token:** Valid for 7 days
- **Refresh Token:** Valid for 30 days
- **Automatic Refresh:** Token automatically refreshes via interceptor

Default Demo User:
- Email: `JardenUnido@hireflow.ai`
- Password: `password123`
- Role: admin

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- Framer Motion (animations)
- Zustand (state management)
- Axios (HTTP client)
- React Router (routing)

### Backend
- Node.js + Express
- TypeScript
- MySQL + mysql2
- JWT + bcryptjs
- Zod (validation)
- Helmet (security)

## 📖 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Jobs
- `GET /api/jobs` - List jobs
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs` - Create job
- `PATCH /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Candidates
- `GET /api/candidates` - List candidates
- `GET /api/candidates/:id` - Get candidate details
- `POST /api/candidates` - Create candidate
- `PATCH /api/candidates/:id` - Update candidate
- `DELETE /api/candidates/:id` - Delete candidate

### Interviews
- `GET /api/interviews` - List interviews
- `GET /api/interviews/upcoming` - Get upcoming interviews
- `POST /api/interviews` - Schedule interview
- `PATCH /api/interviews/:id` - Update interview
- `DELETE /api/interviews/:id` - Cancel interview

### Notifications
- `GET /api/notifications` - List notifications
- `GET /api/notifications/unread` - Get unread notifications
- `PATCH /api/notifications/:id/read` - Mark as read
- `DELETE /api/notifications/:id` - Delete notification

### Activities
- `GET /api/activities` - List activities
- `GET /api/activities/recent` - Get recent activities

## 🧪 Testing

See [SETUP_AND_TESTING.md](./SETUP_AND_TESTING.md) for comprehensive testing guide including:

- Database connection verification
- Authentication testing
- CRUD operation testing
- Data persistence testing
- API error handling
- Performance benchmarking

### Quick Test Checklist

- [ ] Can log in with demo credentials
- [ ] Dashboard loads with data
- [ ] Jobs list displays from database
- [ ] Can create a job and it persists
- [ ] Can update candidate status and it persists
- [ ] No console errors on main pages
- [ ] Data survives page refresh
- [ ] Data survives backend restart

## 📊 Development Workflow

```bash
# Install dependencies
npm install

# Start backend (port 3001)
npm run dev --workspace=server

# Start frontend (port 5173) in another terminal
npm run dev --workspace=client

# Build for production
npm run build

# Lint code
npm run lint
```

## 🔍 Troubleshooting

### Database Connection Error
- Verify MySQL is running
- Check `.env` database credentials
- Ensure `hireflow_ai` database exists

### Port Already in Use
```bash
# Find process on port
lsof -i :3001

# Kill process
kill -9 <PID>
```

### Login Issues
- Clear browser localStorage
- Verify JWT_SECRET in `.env` matches server
- Check browser console for token errors

### CORS Errors
- Verify FRONTEND_URL in `.env` matches actual frontend URL
- Restart backend after changing CORS settings

## 📝 Documentation

- [**ARCHITECTURE.md**](./ARCHITECTURE.md) - System architecture and design patterns
- [**SETUP_AND_TESTING.md**](./SETUP_AND_TESTING.md) - Installation, setup, and testing guide

## 🔄 Development Phases

1. ✅ **Phase 1:** Project inspection and analysis
2. ✅ **Phase 2:** MySQL database schema design
3. ✅ **Phase 3:** Database schema and seed data
4. ✅ **Phase 4:** Database configuration and environment
5. ✅ **Phase 5:** Backend repository/data layer
6. ✅ **Phase 6:** MySQL-backed authentication
7. ✅ **Phase 7:** REST API endpoints
8. ✅ **Phase 8:** Frontend API client
9. ✅ **Phase 9:** Frontend migration to API
10. ✅ **Phase 10:** Form submissions via API
11. ✅ **Phase 11:** Loading and error states
12. ✅ **Phase 12:** End-to-end testing
13. 🔄 **Phase 13:** Remove mock data
14. ✅ **Phase 14:** Documentation
15. 🔄 **Phase 15:** Implementation report

## 🚧 Known Limitations

- AI resume parsing and scoring currently uses deterministic algorithms (no external AI model)
- File storage is via URL references (not implemented S3 integration)
- Email notifications not yet implemented
- Two-factor authentication not implemented
- Advanced analytics/reporting dashboard not implemented

## 📄 License

[Add your license here]

## 👥 Contributors

- Jem Arden Unido

## 🤝 Contributing

[Add contribution guidelines here]

---

**Last Updated:** October 2026  
**Status:** Production Ready  
**Database:** MySQL 8.0+  
**Node Version:** 16+
