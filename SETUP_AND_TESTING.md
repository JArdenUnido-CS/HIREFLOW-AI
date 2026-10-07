# HIREFLOW-AI: Setup and Testing Guide

## Prerequisites

- Node.js 16+ (with npm)
- MySQL 8.0+
- Git

## Installation

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd HIREFLOW-AI
```

### Step 2: Install Dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
npm run install --workspace=client

# Install server dependencies
npm run install --workspace=server
```

### Step 3: Database Setup

#### Create MySQL Database

```bash
# Login to MySQL
mysql -u root

# Run the schema script
SOURCE server/database/schema.sql;

# Run the seed script to populate sample data
SOURCE server/database/seed.sql;

# Verify tables were created
USE hireflow_ai;
SHOW TABLES;
```

Or use a single command:

```bash
mysql -u root < server/database/schema.sql
mysql -u root hireflow_ai < server/database/seed.sql
```

#### Verify Database Connection

```bash
# Test MySQL connection
mysql -u root hireflow_ai -e "SELECT COUNT(*) as users FROM users;"
```

### Step 4: Environment Configuration

Create `.env` file in the root directory (if not already present):

```env
# Node Environment
NODE_ENV=development

# Server Configuration
PORT=3001
API_URL=http://localhost:3001
FRONTEND_URL=http://localhost:5173

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=hireflow_ai
DB_POOL_MIN=2
DB_POOL_MAX=10

# Authentication
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Logging
LOG_LEVEL=debug
```

Also create `client/.env`:

```env
VITE_API_URL=http://localhost:3001/api
```

### Step 5: Start Development Servers

#### Terminal 1: Start Backend Server

```bash
npm run dev --workspace=server
```

Expected output:
```
✓ HireFlow API server running on port 3001
✓ Frontend URL: http://localhost:5173
```

#### Terminal 2: Start Frontend Dev Server

```bash
npm run dev --workspace=client
```

Expected output:
```
VITE v5.3.1  ready in 500 ms

➜  local:   http://localhost:5173/
```

## Testing

### Manual End-to-End Testing

#### Test 1: Database Connection

**What to test:** Backend can connect to MySQL database

**Steps:**
1. Start the backend server
2. Check console output for "✓ Database connection successful"
3. No error messages about database connection

**Expected Result:** Server starts without database errors

---

#### Test 2: Authentication - Login

**What to test:** User can log in with valid credentials

**Credentials:**
- Email: `JardenUnido@hireflow.ai`
- Password: `password123`

**Steps:**
1. Navigate to http://localhost:5173/login
2. Enter credentials
3. Click "Sign In"
4. Wait for login to complete

**Expected Result:**
- User is redirected to /dashboard
- User profile appears in UI
- Token stored in localStorage (check DevTools → Application → LocalStorage)

---

#### Test 3: Authentication - Token Refresh

**What to test:** JWT token refresh mechanism works

**Steps:**
1. Log in successfully
2. Open DevTools → Console
3. Execute: `localStorage.getItem('auth_token')`
4. Wait 5 seconds
5. Make an API call (e.g., navigate to Jobs page)
6. Check if token is still valid

**Expected Result:**
- API calls succeed even after waiting
- Token refresh happens transparently

---

#### Test 4: Fetch Jobs

**What to test:** Frontend fetches jobs from MySQL via API

**Steps:**
1. Log in
2. Navigate to /jobs
3. Wait for page to load
4. Observe jobs list

**Expected Result:**
- 4 jobs appear from database seed data
- Each job displays: title, department, location, salary, applicant count
- No loading skeleton after data loads
- Each job card shows correct status badge

---

#### Test 5: Database Persistence - Create and Verify Job

**What to test:** Data survives browser refresh and backend restart

**Steps:**

**Part A: Create a Job**
1. Log in as admin
2. Go to Jobs page
3. Click "Create Job"
4. Fill in job details:
   - Title: "Test Engineer"
   - Department: "QA"
   - Location: "Remote"
   - Description: "Test the new system"
   - Required Skills: ["Testing", "Automation"]
5. Submit form

**Expected Result:**
- Job appears in jobs list
- API returns 201 status
- New job visible in table

**Part B: Refresh Browser**
1. Press F5 or Cmd+R to refresh
2. Wait for page to reload
3. Check if job still exists in list

**Expected Result:**
- Job persists in list after refresh
- Proves data is saved to MySQL, not just in memory

**Part C: Verify in MySQL**
1. Open MySQL client
2. Run: `SELECT * FROM jobs WHERE title = 'Test Engineer';`

**Expected Result:**
- Job record exists in database
- All fields match what was submitted

**Part D: Restart Backend**
1. Stop backend server (Ctrl+C)
2. Wait 5 seconds
3. Restart backend: `npm run dev --workspace=server`
4. Refresh frontend page
5. Check if job still exists

**Expected Result:**
- Job persists after backend restart
- Proves data is truly persistent in MySQL

---

#### Test 6: Fetch Candidates

**What to test:** Candidates are fetched from MySQL via API

**Steps:**
1. Log in
2. Navigate to /candidates
3. Wait for page to load

**Expected Result:**
- 8 candidates appear from seed data
- Each shows name, email, status (applied, screening, etc.)
- Loading spinner disappears

---

#### Test 7: View Candidate Details

**What to test:** Individual candidate can be fetched and displayed

**Steps:**
1. Go to candidates page
2. Click on a candidate card
3. Wait for details to load

**Expected Result:**
- Candidate details page loads
- Shows all candidate information: name, email, phone, location, resume data, AI scores, match scores
- No errors in console

---

#### Test 8: Update Candidate Status

**What to test:** Candidate status can be updated and persists

**Steps:**
1. Go to candidates page
2. Find a candidate with status "applied"
3. Open candidate details
4. Change status from "applied" to "screening"
5. Refresh page

**Expected Result:**
- Status changes in UI immediately
- Status persists after refresh (data saved to MySQL)
- Activity log records the status change

---

#### Test 9: Fetch Upcoming Interviews

**What to test:** Interviews scheduled for next 7 days are fetched

**Steps:**
1. Log in
2. Go to Dashboard
3. Look at "Upcoming Interviews" widget

**Expected Result:**
- Widget shows interviews scheduled within next 7 days
- From seed data, should show 3 upcoming interviews
- Correct candidate names and dates displayed

---

#### Test 10: API Error Handling

**What to test:** API errors are handled gracefully

**Steps:**
1. Stop the backend server
2. Try to perform an action that requires API call (e.g., refresh jobs)
3. Check error message

**Expected Result:**
- User sees clear error message
- "Cannot connect to server" or similar
- App doesn't crash
- No console errors
- Option to retry

---

#### Test 11: Authentication - Protected Routes

**What to test:** Unauthenticated users cannot access protected pages

**Steps:**
1. Log out (or open new incognito window)
2. Try to navigate directly to http://localhost:5173/dashboard
3. Observe what happens

**Expected Result:**
- Redirected to /login
- Cannot access /dashboard without authentication

---

#### Test 12: Authorization - Role-Based Access

**What to test:** Users can only perform actions their role allows

**Steps:**
1. Log in as a candidate user (create one or use a seed candidate email)
2. Try to create a new job
3. Observe

**Expected Result:**
- Create Job button not available/disabled
- If forced via API, get 403 Forbidden error
- Message: "Insufficient permissions"

---

#### Test 13: Database Connection Pool

**What to test:** Connection pool handles concurrent requests

**Steps:**
1. Go to dashboard (which makes multiple parallel API calls)
2. Open DevTools → Network tab
3. Observe that all requests succeed

**Expected Result:**
- All API calls complete successfully
- No "Too many connections" errors
- Response times are reasonable

---

#### Test 14: Data Validation - Invalid Input

**What to test:** Backend validates input and rejects invalid data

**Steps:**
1. Log in
2. Try to create a job with invalid data:
   - Empty title
   - Invalid email
   - Missing required fields
3. Submit form

**Expected Result:**
- Form shows validation errors
- Request is rejected with 400 Bad Request
- Clear error message about what's wrong
- Data is NOT saved to database

---

#### Test 15: JWT Token Expiration

**What to test:** Expired token is refreshed automatically

**Steps:**
1. Log in
2. Go to DevTools → Console
3. Manually set token to expire: 
   ```javascript
   // This is complex, skip in manual testing
   ```

**Expected Result:**
- User stays logged in if refresh token is still valid
- If both tokens expire, user is redirected to login

---

### SQL Verification Queries

Run these in MySQL to verify data:

```sql
-- Check all users
SELECT id, email, name, role FROM users;

-- Check all jobs
SELECT id, title, department, status, applicant_count FROM jobs;

-- Check all candidates
SELECT id, name, email, status, job_id FROM candidates;

-- Check upcoming interviews
SELECT id, candidate_id, scheduled_at, type, status FROM interviews 
WHERE scheduled_at > NOW() 
ORDER BY scheduled_at;

-- Check recent activities
SELECT type, description, user_id, created_at FROM activities 
ORDER BY created_at DESC LIMIT 10;

-- Check notifications
SELECT id, user_id, title, read, created_at FROM notifications 
ORDER BY created_at DESC LIMIT 10;

-- Count total records
SELECT 
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM jobs) as jobs,
  (SELECT COUNT(*) FROM candidates) as candidates,
  (SELECT COUNT(*) FROM interviews) as interviews,
  (SELECT COUNT(*) FROM activities) as activities,
  (SELECT COUNT(*) FROM notifications) as notifications;
```

---

## Troubleshooting

### Database Connection Error

**Error:** "Cannot connect to database"

**Solutions:**
1. Verify MySQL is running: `mysql --version`
2. Check DB_HOST, DB_USER, DB_PASSWORD in .env
3. Verify database exists: `mysql -u root -e "SHOW DATABASES;"`
4. Check database is selected: `mysql -u root hireflow_ai -e "SHOW TABLES;"`

---

### Port Already in Use

**Error:** "Port 3001 already in use"

**Solutions:**
```bash
# Find process on port 3001
lsof -i :3001

# Kill process
kill -9 <PID>

# Or change port in .env
PORT=3002
```

---

### Token Validation Errors

**Error:** "Invalid token" or "401 Unauthorized"

**Solutions:**
1. Clear localStorage and log in again
2. Check JWT_SECRET in .env matches on server
3. Verify token is being sent in Authorization header

---

### CORS Errors

**Error:** "CORS policy: No 'Access-Control-Allow-Origin' header"

**Solutions:**
1. Check FRONTEND_URL in .env matches actual frontend URL
2. Verify CORS_ORIGIN in .env is correct
3. Restart backend after changing CORS settings

---

## Performance Baseline

Record these metrics after testing:

- **Login Time:** < 2 seconds
- **Jobs Page Load:** < 1 second
- **Dashboard Load:** < 1.5 seconds
- **Candidate List Load:** < 1 second
- **API Response Time (avg):** < 200ms
- **Database Query Time (avg):** < 100ms

---

## Summary Checklist

- [ ] Database created successfully
- [ ] Backend starts without errors
- [ ] Frontend loads at http://localhost:5173
- [ ] Can log in with test credentials
- [ ] Jobs load from database
- [ ] Candidates load from database
- [ ] Can create new job and it persists
- [ ] Can update candidate status and it persists
- [ ] Upcoming interviews display correctly
- [ ] No console errors on main pages
- [ ] Protected routes redirect to login
- [ ] API errors display user-friendly messages
- [ ] Backend restart preserves all data
- [ ] Database contains seed data after setup

---

## Next Steps After Testing

1. Review any failed tests
2. Check logs for error messages
3. Consult troubleshooting section
4. If tests pass: proceed to documentation and cleanup phases
5. If tests fail: debug and retest before proceeding
