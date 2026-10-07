# HireFlow AI — Architecture & Specification

## System Overview

HireFlow AI is an intelligent recruitment platform with AI-powered resume screening, candidate ranking, and recruitment pipeline management. The application follows a modern full-stack architecture with React frontend, Express backend, and MySQL database.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Web Browser                             │
│                   React 18 + TypeScript                      │
│              (Vite, TailwindCSS, Framer Motion)             │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP/REST
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                    Express Backend                           │
│              (Node.js, TypeScript, Helmet)                  │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │    Routes    │→→│  Middleware  │→→│  Controllers    │   │
│  └──────────────┘  └──────────────┘  └────────┬────────┘   │
│                                                │             │
│  ┌──────────────┐  ┌──────────────┐  ┌────────↓────────┐   │
│  │  Services    │←←│ Repositories │←←│    Database     │   │
│  └──────────────┘  └──────────────┘  │     Layer      │   │
│                                       └────────┬────────┘   │
└──────────────────────────────────────────────────┼──────────┘
                                                   │ SQL
                                                   ↓
┌─────────────────────────────────────────────────────────────┐
│                   MySQL Database                            │
│                    (InnoDB engine)                          │
│                                                              │
│  users | jobs | candidates | interviews | activities |      │
│  notifications | parsed_resumes | ai_scores                │
└─────────────────────────────────────────────────────────────┘
```

## Tech Stack

### Frontend
- **Framework:** React 18 + TypeScript (strict mode)
- **Build:** Vite 5
- **Styling:** TailwindCSS 3.4 + custom design tokens
- **Animation:** Framer Motion 11
- **State Management:** Zustand (auth), React hooks (data)
- **HTTP Client:** Axios with interceptors and automatic token refresh
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts with custom styling
- **Icons:** Lucide React
- **Router:** React Router v6
- **Drag & Drop:** @dnd-kit for Kanban pipelines
- **Notifications:** React Hot Toast

### Backend
- **Runtime:** Node.js 20 + TypeScript
- **Framework:** Express 4
- **Database:** MySQL 8.0 (InnoDB)
- **Connection:** mysql2/promise with connection pooling
- **Auth:** JWT (access + refresh tokens) + bcrypt password hashing
- **Validation:** Zod schema validation
- **Security:** Helmet.js, CORS configuration
- **File Upload:** Multer + file-type validation
- **Middleware:** Express middleware stack

## Database Schema

### Tables

**users**
- User accounts and authentication
- Fields: id, email, name, password_hash, avatar, role, department, created_at, updated_at
- Roles: admin, recruiter, hiring_manager, viewer, candidate

**jobs**
- Job postings and requisitions
- Fields: id, title, department, location, type, salary_min, salary_max, description, responsibilities (JSON), benefits (JSON), skills_required (JSON), skills_preferred (JSON), experience_years, education, status, deadline, applicant_count, created_by (FK), hiring_manager_id (FK), created_at, updated_at

**candidates**
- Applicants and candidate profiles
- Fields: id, name, email, phone, location, linkedin, github, portfolio, photo_url, resume_url, resume_text, parsed_data (JSON), ai_scores (JSON), match_scores (JSON), status (PipelineStage enum), job_id (FK), applied_at, created_at, updated_at

**interviews**
- Interview scheduling and tracking
- Fields: id, candidate_id (FK), job_id (FK), scheduled_at, type (enum), status (enum), questions (JSON), notes, created_at, updated_at

**activities**
- Audit trail of recruitment workflow
- Fields: id, type (enum), description, user_id (FK), metadata (JSON), created_at

**notifications**
- User notifications and alerts
- Fields: id, user_id (FK), title, message, type (enum), read (boolean), created_at, updated_at

### Relationships

```
users (1) ──→ (N) jobs (created_by)
users (1) ──→ (N) jobs (hiring_manager_id)
users (1) ──→ (N) activities (user_id)
users (1) ──→ (N) notifications (user_id)
jobs (1) ──→ (N) candidates (job_id)
jobs (1) ──→ (N) interviews (job_id)
candidates (1) ──→ (N) interviews (candidate_id)
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Jobs
- `GET /api/jobs` - Get all jobs (paginated)
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs` - Create new job (admin/hiring_manager)
- `PATCH /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job (admin)

### Candidates
- `GET /api/candidates` - Get all candidates (paginated)
- `GET /api/candidates/:id` - Get candidate details
- `POST /api/candidates` - Create new candidate
- `PATCH /api/candidates/:id` - Update candidate
- `DELETE /api/candidates/:id` - Delete candidate

### Interviews
- `GET /api/interviews` - Get all interviews (paginated)
- `GET /api/interviews/upcoming` - Get upcoming interviews
- `GET /api/interviews/:id` - Get interview details
- `POST /api/interviews` - Create new interview
- `PATCH /api/interviews/:id` - Update interview
- `DELETE /api/interviews/:id` - Delete interview

### Notifications
- `GET /api/notifications` - Get user notifications (paginated)
- `GET /api/notifications/unread` - Get unread notifications
- `GET /api/notifications/:id` - Get notification details
- `POST /api/notifications` - Create notification (admin)
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/mark-all-read` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

### Activities
- `GET /api/activities` - Get all activities (paginated)
- `GET /api/activities/recent` - Get recent activities
- `GET /api/activities/:id` - Get activity details

## Folder Structure

```
hireflow-ai/
├── client/                           # React Frontend
│   ├── src/
│   │   ├── components/               # Reusable UI components
│   │   │   ├── ui/                   # Base primitives (Button, Input, Card, etc.)
│   │   │   ├── layout/               # Shell, Sidebar, Navbar
│   │   │   └── shared/               # AnimatedCounter, ScoreCard, PageTransition
│   │   ├── features/                 # Feature modules
│   │   │   ├── auth/                 # Login, Register
│   │   │   ├── dashboard/            # Dashboard widgets
│   │   │   ├── candidates/           # Candidate list, profile, upload
│   │   │   ├── jobs/                 # Job management
│   │   │   ├── pipeline/             # Kanban pipeline
│   │   │   ├── interviews/           # Interview scheduler
│   │   │   └── ... (other features)
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── useApi.ts             # API hooks (useApi, usePaginatedApi, useMutation)
│   │   │   └── useAuth.ts            # Authentication hook
│   │   ├── services/                 # API client and services
│   │   │   └── api.ts                # Centralized axios API client
│   │   ├── stores/                   # Zustand stores
│   │   │   ├── authStore.ts          # Authentication state
│   │   │   ├── appStore.ts           # App UI state
│   │   │   └── themeStore.ts         # Theme management
│   │   ├── types/                    # TypeScript interfaces
│   │   │   └── index.ts              # All type definitions
│   │   ├── lib/                      # Utilities and helpers
│   │   │   └── utils.ts              # Helper functions
│   │   └── App.tsx                   # Main app component
│   ├── vite.config.ts                # Vite configuration
│   ├── tailwind.config.ts            # TailwindCSS configuration
│   ├── tsconfig.json                 # TypeScript configuration
│   └── package.json
│
├── server/                           # Express Backend
│   ├── src/
│   │   ├── config/                   # Configuration
│   │   │   └── database.ts           # MySQL connection pool
│   │   ├── middleware/               # Express middleware
│   │   │   └── auth.ts               # Authentication middleware
│   │   ├── routes/                   # API routes
│   │   │   ├── auth.ts               # Auth endpoints
│   │   │   ├── jobs.ts               # Job endpoints
│   │   │   ├── candidates.ts         # Candidate endpoints
│   │   │   ├── interviews.ts         # Interview endpoints
│   │   │   ├── notifications.ts      # Notification endpoints
│   │   │   └── activities.ts         # Activity endpoints
│   │   ├── services/                 # Business logic
│   │   │   └── AuthService.ts        # Auth service (JWT, password hashing)
│   │   ├── repositories/             # Data access layer
│   │   │   ├── UserRepository.ts
│   │   │   ├── JobRepository.ts
│   │   │   ├── CandidateRepository.ts
│   │   │   ├── InterviewRepository.ts
│   │   │   ├── ActivityRepository.ts
│   │   │   ├── NotificationRepository.ts
│   │   │   └── index.ts              # Repository exports
│   │   ├── utils/                    # Utilities
│   │   │   ├── db.ts                 # Database query helpers
│   │   │   └── helpers.ts            # General helpers
│   │   └── index.ts                  # Server entry point
│   ├── database/                     # Database setup
│   │   ├── schema.sql                # Database schema
│   │   └── seed.sql                  # Sample/seed data
│   ├── tsconfig.json
│   └── package.json
│
├── .env                              # Environment variables (local development)
├── .env.example                      # Environment variables template
├── .gitignore                        # Git ignore rules
├── ARCHITECTURE.md                   # This file
├── SETUP_AND_TESTING.md              # Setup and testing guide
└── README.md                         # Project README
```

## Data Flow

### User Authentication Flow

```
1. User enters credentials (login page)
2. Frontend: POST /api/auth/login { email, password }
3. Backend: 
   - Find user by email
   - Compare password with bcrypt hash
   - Generate JWT access token + refresh token
4. Frontend:
   - Store tokens in localStorage
   - Update authStore with user data
   - Redirect to /dashboard
5. All subsequent API requests include: Authorization: Bearer <token>
```

### API Request Flow

```
1. Frontend component calls API
2. Axios interceptor adds JWT token to Authorization header
3. Express middleware authenticates token
4. Route handler validates input with Zod
5. Service layer handles business logic
6. Repository layer queries database
7. Data returned through layers
8. Response sent to frontend
9. Frontend updates UI with data
```

### Database Query Flow

```
Frontend → API → Express → Service → Repository → mysql2 → MySQL
```

Example for fetching jobs:
```
GET /api/jobs
→ jobsApi.getAll()
→ authenticate middleware
→ jobsController.getAll()
→ JobRepository.findAll()
→ query('SELECT * FROM jobs')
→ mysql2 executes query
→ Results returned as JSON
```

## Security Features

- **Password Hashing:** bcryptjs (10 rounds)
- **JWT Tokens:** Signed with JWT_SECRET, includes expiration
- **Token Refresh:** Automatic token refresh via interceptor
- **SQL Injection Prevention:** Parameterized queries (?)
- **CORS:** Configured to specific frontend URL
- **Helmet:** Security headers (CSP, X-Frame-Options, etc.)
- **Protected Routes:** Frontend route guards + backend auth middleware
- **Role-Based Access Control:** Routes check user.role
- **Input Validation:** Zod schemas on all API endpoints
- **Error Handling:** Proper HTTP status codes, no stack traces in responses

## Environment Variables

```
# Node Environment
NODE_ENV=development|production

# Server
PORT=3001
API_URL=http://localhost:3001
FRONTEND_URL=http://localhost:5173

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=hireflow_ai
DB_POOL_MIN=2
DB_POOL_MAX=10

# JWT
JWT_SECRET=secret-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=http://localhost:5173

# Logging
LOG_LEVEL=debug
```

## Development Workflow

1. **Start Backend:** `npm run dev --workspace=server`
2. **Start Frontend:** `npm run dev --workspace=client`
3. **Access Application:** http://localhost:5173
4. **Database:** MySQL running on localhost:3306

## Performance Considerations

- **Connection Pooling:** Min 2, Max 10 connections
- **Pagination:** Default 50 items per page, max 100
- **JSON Fields:** Used for flexible nested data (parsed_data, ai_scores, etc.)
- **Indexes:** On frequently queried fields (status, user_id, job_id, created_at)
- **Token Refresh:** Automatic via axios interceptor

## Future Enhancements

- Real AI model integration for resume scoring
- WebSocket support for real-time notifications
- File storage (S3 or similar) for resumes
- Advanced search and filtering
- Reporting and analytics dashboards
- Email notifications
- Two-factor authentication
- Audit logging for compliance

