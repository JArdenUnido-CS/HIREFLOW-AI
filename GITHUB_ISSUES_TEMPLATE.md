# GitHub Issues - HIREFLOW-AI Remaining Work

This document contains templated GitHub issues for the HIREFLOW-AI project. These can be created on GitHub to track remaining work.

---

## Issue #1: Resume Upload & Processing System

```markdown
### Title
Feature: Resume Upload & File Processing System

### Type
Enhancement / Feature

### Priority
High 🔴

### Description
Implement a complete resume upload system allowing users to upload, parse, and manage candidate resumes.

### User Story
As a recruiter, I want to upload candidate resumes so that the system can automatically extract and parse resume data into candidate profiles.

### Requirements
- [x] Upload interface with drag-and-drop
- [x] Support PDF and DOC file formats
- [x] Parse resume to extract text and metadata
- [x] Store resume files (local or S3)
- [x] Auto-create/update candidate from resume
- [x] Resume versioning and history
- [x] Download uploaded resume
- [x] Delete resume

### Technical Details
**Components**:
- ResumeUploadModal.tsx
- ResumeParser.ts (service)

**Database Changes**:
- Add resume_versions table
- Add resume_file_path tracking

**API Endpoints**:
- POST /api/candidates/:id/resume
- GET /api/candidates/:id/resume
- DELETE /api/candidates/:id/resume
- POST /api/resumes/parse

**Storage Options**:
1. Local file system (development)
2. AWS S3 (production)
3. Digital Ocean Spaces

### Acceptance Criteria
- User can drag-drop PDF/DOC file
- System extracts text and data
- Candidate profile auto-populated
- Resume accessible for download
- Multiple versions tracked
- Works with >50MB files

### Effort Estimate
2-3 weeks

### Dependencies
None (can start immediately)

### Labels
enhancement, feature, high-priority

---
```

## Issue #2: Email Notifications System

```markdown
### Title
Feature: Email Notifications for Key Events

### Type
Enhancement / Feature

### Priority
High 🔴

### Description
Send email notifications to users for key recruitment events (interview scheduled, offer sent, etc.).

### User Story
As a hiring manager, I want to receive email notifications when important events occur so I stay informed without checking the app constantly.

### Requirements
- [x] Interview scheduled notification
- [x] Offer sent confirmation
- [x] Status change notifications
- [x] Daily/weekly digest
- [x] Notification preferences
- [x] Email templates

### Technical Details
**Services**:
- SendGrid, AWS SES, or Nodemailer
- Bull queue for sending (optional but recommended)

**Components**:
- NotificationPreferences.tsx
- Email templates (HTML)

**API Endpoints**:
- PATCH /api/users/:id/notification-preferences
- POST /api/emails/send (internal)

**Database Changes**:
- Add notification_preferences table
- Add email_queue table (if using queue)

### Acceptance Criteria
- User receives email on interview schedule
- Emails are responsive/mobile-friendly
- User can opt-out from preferences
- Emails sent within 30 seconds
- Failed sends logged and retried

### Effort Estimate
1-2 weeks

### Dependencies
Issue #1 (useful for resume emails, but not blocking)

### Labels
enhancement, feature, high-priority

---
```

## Issue #3: Advanced Search & Filtering

```markdown
### Title
Feature: Advanced Search and Filtering for Candidates

### Type
Enhancement / Feature

### Priority
High 🔴

### Description
Implement advanced search with multiple filter criteria, saved searches, and export capabilities.

### User Story
As a recruiter, I want to search for candidates by multiple criteria (skills, experience, salary, location) so I can find the right candidates faster.

### Requirements
- [x] Multi-criteria search
- [x] Filter by experience range
- [x] Filter by location
- [x] Filter by skills
- [x] Filter by salary expectations
- [x] Save search filters
- [x] Export results to CSV/Excel
- [x] Sort by match score

### Technical Details
**Components**:
- AdvancedSearchPage.tsx
- SearchFilters.tsx
- SavedSearches.tsx

**Database Changes**:
- Add saved_searches table
- Add index on skills, location, experience

**API Endpoints**:
- POST /api/search/advanced (with complex query)
- POST /api/saved-searches
- GET /api/saved-searches
- DELETE /api/saved-searches/:id
- POST /api/search/export

### Performance Considerations
- Add database indexes
- Implement pagination
- Consider Elasticsearch for >100k records

### Acceptance Criteria
- Search completes in <500ms
- Filter with 5+ criteria works
- Saved searches persist
- Export includes all visible columns
- Mobile-friendly search interface

### Effort Estimate
1 week

### Dependencies
None

### Labels
enhancement, feature, performance

---
```

## Issue #4: Kanban Pipeline Board

```markdown
### Title
Feature: Kanban Board for Recruitment Pipeline

### Type
Enhancement / Feature

### Priority
Medium 🟡

### Description
Create a visual Kanban board showing candidate progression through recruitment stages with drag-and-drop functionality.

### User Story
As a hiring manager, I want to see all candidates in a visual pipeline so I can manage the recruitment process at a glance.

### Requirements
- [x] Columns for each pipeline stage
- [x] Drag candidates between stages
- [x] Quick actions on hover (call, email, etc.)
- [x] Bulk operations
- [x] Stage metrics/counts
- [x] Responsive on mobile

### Technical Details
**Component**:
- KanbanBoard.tsx
- KanbanColumn.tsx
- CandidateKanbanCard.tsx

**Libraries**:
- react-beautiful-dnd or dnd-kit

**API Updates**:
- Add batch update endpoint: PATCH /api/candidates/batch-update

### Acceptance Criteria
- Drag-drop works smoothly
- Stage transitions persist
- Smooth animations
- Mobile-responsive layout
- Shows 20+ cards per stage without lag

### Effort Estimate
1-2 weeks

### Dependencies
None

### Labels
enhancement, feature, ui

---
```

## Issue #5: Interview Notes & Feedback Forms

```markdown
### Title
Feature: Interview Notes and Feedback Collection

### Type
Enhancement / Feature

### Priority
Medium 🟡

### Description
Allow users to add notes during/after interviews and collect structured feedback with scoring.

### User Story
As an interviewer, I want to record notes and score candidates on competencies so the team can make informed hiring decisions.

### Requirements
- [x] Add notes to interviews
- [x] Rate candidates on competencies (1-5 stars)
- [x] Overall recommendation (yes/no/maybe)
- [x] View feedback history
- [x] Compare feedback across interviews
- [x] Structured feedback form

### Technical Details
**Components**:
- InterviewNotesModal.tsx
- FeedbackForm.tsx
- CompetencyRating.tsx

**Database Changes**:
- Add interview_notes table
- Add interview_feedback table with scores

**API Endpoints**:
- POST /api/interviews/:id/notes
- PATCH /api/interviews/:id/feedback
- GET /api/interviews/:id/feedback

### Acceptance Criteria
- Notes saved with timestamps
- Feedback scores visible on candidate profile
- Multiple feedbacks aggregated
- Email notified when all feedback collected

### Effort Estimate
1 week

### Dependencies
None

### Labels
enhancement, feature

---
```

## Issue #6: Two-Factor Authentication (2FA)

```markdown
### Title
Security: Implement Two-Factor Authentication

### Type
Security / Enhancement

### Priority
Medium 🟡

### Description
Add 2FA support for enhanced account security with SMS/Email OTP and TOTP options.

### User Story
As a system administrator, I want to enforce two-factor authentication so user accounts are protected against unauthorized access.

### Requirements
- [x] SMS OTP verification
- [x] Email OTP verification
- [x] Time-based OTP (TOTP - Google Authenticator)
- [x] Backup codes generation
- [x] 2FA enforcement per role
- [x] Optional/mandatory toggle

### Technical Details
**Libraries**:
- speakeasy (TOTP generation)
- qrcode (QR code generation)
- Twilio or AWS SNS (SMS)

**Database Changes**:
- Add 2fa_secret VARCHAR(255) to users
- Add 2fa_enabled BOOLEAN to users
- Add 2fa_backup_codes JSON to users

**API Endpoints**:
- POST /api/auth/2fa/setup
- POST /api/auth/2fa/verify
- POST /api/auth/2fa/backup-codes
- PATCH /api/auth/2fa/disable

### Acceptance Criteria
- User can enable 2FA
- QR code generated correctly
- OTP verification works
- Backup codes generated and stored securely
- Failed attempts rate-limited

### Effort Estimate
1 week

### Dependencies
None

### Labels
security, enhancement, high-priority

---
```

## Issue #7: Analytics Dashboard

```markdown
### Title
Feature: Hiring Analytics & Metrics Dashboard

### Type
Enhancement / Feature

### Priority
Medium 🟡

### Description
Create comprehensive analytics dashboard showing key recruitment metrics and trends.

### Metrics Included
- Time-to-hire by position
- Source effectiveness
- Pipeline conversion rates
- Offer acceptance rate
- Cost per hire
- Application trends
- Interview duration analysis

### Technical Details
**Components**:
- AnalyticsPage.tsx
- MetricsCard.tsx
- TrendChart.tsx

**Charting Library**:
- Recharts or Chart.js

**API Endpoints**:
- GET /api/analytics/metrics
- GET /api/analytics/trends
- GET /api/analytics/pipeline

### Database Changes**:
- Pre-aggregate common metrics
- Add analytics_cache table for performance

### Acceptance Criteria
- Charts load in <1 second
- Date range filtering works
- Export to PDF/PNG
- Mobile-responsive charts
- Real-time data updates

### Effort Estimate
2-3 weeks

### Dependencies
None

### Labels
enhancement, feature, analytics

---
```

## Issue #8: Role-Based Access Control (RBAC) Refinement

```markdown
### Title
Security: Implement Granular Role-Based Access Control

### Type
Security / Enhancement

### Priority
High 🔴

### Description
Implement fine-grained permissions system with role-based access control.

### Roles
- **Admin**: Full system access
- **Recruiter**: Manage jobs, candidates, interviews
- **Hiring Manager**: View candidates, schedule interviews
- **Candidate**: View own profile, apply to jobs
- **Viewer**: Read-only access

### Requirements
- [x] Permission middleware on endpoints
- [x] Role-based UI rendering
- [x] Audit logging for permission checks
- [x] Bulk permission management
- [x] Custom role creation

### Technical Details
**Database Changes**:
- Add permissions table
- Add role_permissions junction table
- Add user_roles table

**API Changes**:
- Add middleware: checkPermission('resource', 'action')
- Add endpoints for role management

**Frontend**:
- Wrap components with <CanAccess> component
- Show/hide UI based on permissions

### Acceptance Criteria
- Users can only access allowed resources
- API endpoints check permissions
- Audit log tracks permission usage
- Permission denied shows helpful message

### Effort Estimate
3-5 days

### Dependencies
None

### Labels
security, enhancement, high-priority

---
```

## Issue #9: Testing Suite

```markdown
### Title
Testing: Implement Comprehensive Test Suite

### Type
Technical Debt

### Priority
High 🔴

### Description
Add unit, integration, and E2E tests for codebase quality and regression prevention.

### Test Coverage Target
- Unit tests: 80% coverage on services/utils
- Integration tests: All API endpoints
- E2E tests: Critical user workflows

### Testing Stack
**Backend**:
- Jest (unit + integration)
- Supertest (HTTP testing)

**Frontend**:
- Jest + React Testing Library
- Vitest (Vite integration)

**E2E**:
- Cypress or Playwright

### Test Scenarios
- User authentication flow
- Create job + candidate
- Schedule interview
- Update candidate status
- Delete with confirmation
- Permission checks

### Effort Estimate
2-3 weeks

### Dependencies
None (but should be done before production)

### Labels
testing, technical-debt, high-priority

---
```

## Issue #10: API Documentation (Swagger/OpenAPI)

```markdown
### Title
Documentation: Generate API Documentation with Swagger

### Type
Documentation

### Priority
Medium 🟡

### Description
Add Swagger/OpenAPI documentation for all API endpoints with interactive testing.

### Requirements
- [x] Document all endpoints
- [x] Include request/response examples
- [x] Add auth examples
- [x] Interactive API explorer
- [x] Error response documentation

### Implementation
**Library**: swagger-jsdoc + swagger-ui-express

**Endpoint**: /api/docs

### Acceptance Criteria
- Swagger UI accessible at /api/docs
- All endpoints documented
- Example requests/responses
- Auth header included in examples
- Easy to understand

### Effort Estimate
2-3 days

### Dependencies
None

### Labels
documentation, api

---
```

---

## How to Use This Template

1. Copy each issue to GitHub
2. Adjust labels as needed (team-specific)
3. Update effort estimates based on team capacity
4. Link related issues
5. Schedule in sprints

---

## Priority Recommendation for Next Development Phase

**Must Have (Next Sprint)**:
1. Issue #1 - Resume Upload
2. Issue #2 - Email Notifications
3. Issue #6 - 2FA

**Should Have (Following Sprint)**:
1. Issue #3 - Advanced Search
2. Issue #4 - Kanban Board
3. Issue #8 - RBAC Refinement

**Nice to Have (Backlog)**:
1. Issue #5 - Interview Notes
2. Issue #7 - Analytics
3. Issue #9 - Testing
4. Issue #10 - API Documentation

---

**Generated**: October 7, 2026  
**Total Remaining Work**: ~8-10 weeks of development
