# HireFlow AI — Architecture & Specification

## Tech Stack

### Frontend
- **Framework:** React 18 + TypeScript (strict mode)
- **Build:** Vite 5
- **Styling:** TailwindCSS 3.4 + custom design tokens
- **Animation:** Framer Motion 11
- **State:** Zustand (global) + React Query (server state)
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts with custom styling
- **Icons:** Lucide React
- **HTTP:** Axios with interceptors
- **Router:** React Router v6
- **DnD:** @dnd-kit for Kanban

### Backend
- **Runtime:** Node.js 20 + TypeScript
- **Framework:** Express 4
- **Database:** PostgreSQL 16 + Knex.js (query builder + migrations)
- **Auth:** JWT (access + refresh tokens) + bcrypt
- **Validation:** Zod
- **File Upload:** Multer + file-type validation
- **AI Intelligence Layer:** Deterministic scoring algorithms (no external API dependency)

### Architecture Pattern
- **Frontend:** Feature-based modules, shared UI component library
- **Backend:** Clean Architecture — Controller → Service → Repository → Database

## Database Schema (Core Tables)

- users (id, email, password_hash, name, avatar_url, role, created_at)
- sessions (id, user_id, token, expires_at, ip_address, user_agent)
- jobs (id, title, department, location, salary_min, salary_max, type, skills_required, skills_preferred, description, responsibilities, benefits, status, deadline, created_by, created_at)
- candidates (id, name, email, phone, location, linkedin, github, portfolio, photo_url, resume_url, resume_text, parsed_data, ai_scores, status, created_at)
- applications (id, candidate_id, job_id, stage, match_scores, notes, applied_at)
- interviews (id, application_id, scheduled_at, type, questions, status, notes)
- activities (id, user_id, type, description, metadata, created_at)
- notifications (id, user_id, title, message, read, created_at)

## Folder Structure

```
hireflow-ai/
├── client/                     # React Frontend
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css           # Tailwind + custom styles
│       ├── components/         # Shared UI components
│       │   ├── ui/             # Base primitives (Button, Input, Card, Modal...)
│       │   ├── layout/         # Shell, Sidebar, Navbar, PageContainer
│       │   └── shared/         # AnimatedCounter, ScoreCard, RadialProgress...
│       ├── features/           # Feature modules
│       │   ├── auth/           # Login, Register, ForgotPassword
│       │   ├── dashboard/      # Main dashboard widgets
│       │   ├── candidates/     # Candidate list, profile, upload
│       │   ├── jobs/           # Job management
│       │   ├── pipeline/       # Kanban recruitment board
│       │   ├── analytics/      # Charts and analytics
│       │   ├── interviews/     # Interview scheduler + questions
│       │   ├── search/         # Global search
│       │   ├── notifications/  # Notification center
│       │   └── settings/       # User and app settings
│       ├── hooks/              # Custom hooks
│       ├── stores/             # Zustand stores
│       ├── lib/                # Utilities, API client, constants
│       ├── types/              # TypeScript interfaces
│       └── data/               # Mock/sample data
├── server/                     # Express Backend
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts
│       ├── config/
│       ├── middleware/
│       ├── routes/
│       ├── controllers/
│       ├── services/
│       ├── repositories/
│       ├── models/
│       ├── utils/
│       └── data/               # Seed data
└── package.json                # Root workspace config
```

## Implementation Phases

1. **Foundation** — Project setup, build tooling, design system
2. **Auth & Layout** — JWT auth flow, app shell, navigation
3. **Core Features** — Dashboard, Resume upload, AI parsing
4. **Advanced** — Job matching, pipeline, analytics
5. **Polish** — Animations, sample data, edge cases
