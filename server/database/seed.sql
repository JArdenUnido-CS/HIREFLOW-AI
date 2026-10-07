-- =============================================================================
-- HIREFLOW-AI Sample Data - Seeds for Development and Testing
-- =============================================================================

USE hireflow_ai;

-- =============================================================================
-- Insert Sample Users
-- =============================================================================

-- Admin user (password: password123 - bcrypt hash)
INSERT INTO users (id, email, name, password_hash, role, department, created_at) VALUES
('usr_01', 'JardenUnido@hireflow.ai', 'Jem Arden Unido', '$2a$10$KMaxa867u3c/6Vx2LZwlgOirsVisJDdIMaURMgMOsW4DmiSpq3oYe', 'admin', 'Talent Acquisition', '2024-01-15 08:00:00'),
('usr_02', 'alex.rivera@hireflow.ai', 'Alex Rivera', '$2a$10$KMaxa867u3c/6Vx2LZwlgOirsVisJDdIMaURMgMOsW4DmiSpq3oYe', 'hiring_manager', 'Engineering', '2024-02-01 09:30:00'),
('usr_03', 'maya.patel@hireflow.ai', 'Dr. Maya Patel', '$2a$10$KMaxa867u3c/6Vx2LZwlgOirsVisJDdIMaURMgMOsW4DmiSpq3oYe', 'hiring_manager', 'AI/ML', '2024-02-15 10:00:00'),
('usr_04', 'jordan.kim@hireflow.ai', 'Jordan Kim', '$2a$10$KMaxa867u3c/6Vx2LZwlgOirsVisJDdIMaURMgMOsW4DmiSpq3oYe', 'hiring_manager', 'Design', '2024-03-01 08:00:00');

-- =============================================================================
-- Insert Sample Jobs
-- =============================================================================

INSERT INTO jobs (id, title, department, location, type, salary_min, salary_max, description, responsibilities, benefits, skills_required, skills_preferred, experience_years, education, status, deadline, created_by, hiring_manager_id, created_at) VALUES
(
  'job_01',
  'Senior Frontend Engineer',
  'Engineering',
  'San Francisco, CA',
  'full-time',
  160000,
  220000,
  'Join our product team to build the next generation of collaborative tools.',
  '["Lead frontend architecture decisions", "Mentor junior engineers", "Ship high-quality features"]',
  '["Equity package", "Unlimited PTO", "Health & dental", "Learning budget"]',
  '["React", "TypeScript", "System Design", "CSS-in-JS"]',
  '["GraphQL", "Next.js", "Figma", "Testing"]',
  5,
  'Bachelor\'s in Computer Science or equivalent',
  'open',
  '2026-09-15',
  'usr_01',
  'usr_02',
  '2026-06-01 10:00:00'
),
(
  'job_02',
  'Machine Learning Engineer',
  'AI/ML',
  'Remote',
  'full-time',
  180000,
  260000,
  'Build and deploy ML models that power intelligent recruitment features.',
  '["Design ML pipelines", "Train and evaluate models", "Collaborate with product"]',
  '["Stock options", "Remote-first", "401k match", "Conference budget"]',
  '["Python", "PyTorch", "NLP", "MLOps"]',
  '["Transformers", "Kubernetes", "AWS SageMaker"]',
  4,
  'Master\'s in ML, AI, or related field',
  'open',
  '2026-08-30',
  'usr_01',
  'usr_03',
  '2026-05-20 08:00:00'
),
(
  'job_03',
  'Product Designer',
  'Design',
  'New York, NY',
  'full-time',
  140000,
  190000,
  'Shape the user experience of our recruitment platform.',
  '["Own end-to-end design process", "Conduct user research", "Build design systems"]',
  '["Design tools budget", "Flexible hours", "Health insurance"]',
  '["Figma", "User Research", "Prototyping", "Design Systems"]',
  '["Motion Design", "Frontend Development", "Data Visualization"]',
  4,
  'Bachelor\'s in Design, HCI, or equivalent',
  'open',
  '2026-09-01',
  'usr_01',
  'usr_04',
  '2026-06-10 09:00:00'
),
(
  'job_04',
  'Backend Engineer',
  'Engineering',
  'Austin, TX',
  'full-time',
  150000,
  210000,
  'Build scalable APIs and services for our growing platform.',
  '["Design REST APIs", "Optimize database queries", "Implement security best practices"]',
  '["Equity", "Relocation support", "Gym membership"]',
  '["Node.js", "PostgreSQL", "TypeScript", "Docker"]',
  '["Redis", "Kafka", "AWS", "Terraform"]',
  4,
  'Bachelor\'s in Computer Science',
  'open',
  '2026-09-20',
  'usr_01',
  'usr_02',
  '2026-06-15 11:00:00'
);

-- =============================================================================
-- Insert Sample Candidates
-- =============================================================================

INSERT INTO candidates (
  id, name, email, phone, location, linkedin, github, portfolio, status, job_id, applied_at
) VALUES
(
  'cand_01',
  'Emily Zhang',
  'emily.zhang@gmail.com',
  '+1 (415) 555-0142',
  'San Francisco, CA',
  'linkedin.com/in/emilyzhang',
  'github.com/emilyzhang',
  NULL,
  'interview',
  'job_01',
  '2026-07-20 14:30:00'
),
(
  'cand_02',
  'Marcus Johnson',
  'marcus.j@outlook.com',
  '+1 (512) 555-0198',
  'Austin, TX',
  'linkedin.com/in/marcusjohnson',
  'github.com/marcusj',
  NULL,
  'shortlisted',
  'job_04',
  '2026-07-18 09:15:00'
),
(
  'cand_03',
  'Priya Sharma',
  'priya.sharma@proton.me',
  '+1 (646) 555-0173',
  'New York, NY',
  'linkedin.com/in/priyasharma',
  NULL,
  'priyasharma.design',
  'screening',
  'job_03',
  '2026-07-25 11:00:00'
),
(
  'cand_04',
  'David Park',
  'david.park@gmail.com',
  '+1 (206) 555-0156',
  'Seattle, WA',
  NULL,
  'github.com/davidpark',
  NULL,
  'applied',
  'job_02',
  '2026-07-28 16:45:00'
),
(
  'cand_05',
  'Sofia Rodriguez',
  'sofia.r@yahoo.com',
  '+1 (305) 555-0187',
  'Miami, FL',
  'linkedin.com/in/sofiarodriguez',
  NULL,
  NULL,
  'technical_test',
  'job_01',
  '2026-07-15 08:30:00'
),
(
  'cand_06',
  'James Wilson',
  'james.w@gmail.com',
  '+1 (773) 555-0134',
  'Chicago, IL',
  NULL,
  'github.com/jameswilson',
  NULL,
  'offer',
  'job_04',
  '2026-07-01 10:00:00'
),
(
  'cand_07',
  'Aisha Patel',
  'aisha.patel@icloud.com',
  '+1 (408) 555-0199',
  'San Jose, CA',
  'linkedin.com/in/aishapatel',
  NULL,
  NULL,
  'hired',
  'job_02',
  '2026-06-15 09:30:00'
),
(
  'cand_08',
  'Chen Wei',
  'chen.wei@outlook.com',
  '+1 (212) 555-0167',
  'New York, NY',
  NULL,
  NULL,
  'chenwei.design',
  'rejected',
  'job_03',
  '2026-07-10 14:00:00'
);

-- =============================================================================
-- Insert Sample Interviews
-- =============================================================================

INSERT INTO interviews (id, candidate_id, job_id, scheduled_at, type, status, created_at) VALUES
(
  'int_01',
  'cand_01',
  'job_01',
  '2026-08-02 10:00:00',
  'technical',
  'scheduled',
  '2026-07-28 10:00:00'
),
(
  'int_02',
  'cand_02',
  'job_04',
  '2026-08-03 14:00:00',
  'behavioral',
  'scheduled',
  '2026-07-28 11:00:00'
),
(
  'int_03',
  'cand_05',
  'job_01',
  '2026-08-01 11:30:00',
  'coding',
  'scheduled',
  '2026-07-28 12:00:00'
);

-- =============================================================================
-- Insert Sample Activities
-- =============================================================================

INSERT INTO activities (id, type, description, user_id, created_at) VALUES
(
  'act_01',
  'candidate_added',
  'David Park applied for Machine Learning Engineer',
  'usr_01',
  '2026-07-28 16:45:00'
),
(
  'act_02',
  'stage_changed',
  'Emily Zhang moved to Interview stage',
  'usr_01',
  '2026-07-27 14:00:00'
),
(
  'act_03',
  'interview_scheduled',
  'Technical interview scheduled with Emily Zhang',
  'usr_01',
  '2026-07-26 10:30:00'
),
(
  'act_04',
  'stage_changed',
  'Marcus Johnson moved to Shortlisted',
  'usr_01',
  '2026-07-25 16:20:00'
),
(
  'act_05',
  'job_created',
  'New job posted: Backend Engineer',
  'usr_01',
  '2026-07-24 09:00:00'
),
(
  'act_06',
  'offer_sent',
  'Offer letter sent to James Wilson',
  'usr_01',
  '2026-07-23 15:45:00'
),
(
  'act_07',
  'note_added',
  'Recruiter note added to Sofia Rodriguez profile',
  'usr_01',
  '2026-07-22 11:15:00'
);

-- =============================================================================
-- Insert Sample Notifications
-- =============================================================================

INSERT INTO notifications (id, user_id, title, message, type, is_read, created_at) VALUES
(
  'notif_01',
  'usr_01',
  'New Application',
  'David Park applied for Machine Learning Engineer',
  'info',
  0,
  '2026-07-28 16:45:00'
),
(
  'notif_02',
  'usr_01',
  'Interview Tomorrow',
  'Technical interview with Emily Zhang at 10:00 AM',
  'warning',
  0,
  '2026-07-28 09:00:00'
),
(
  'notif_03',
  'usr_01',
  'Offer Accepted',
  'James Wilson accepted the Senior Engineer offer',
  'success',
  1,
  '2026-07-27 15:00:00'
),
(
  'notif_04',
  'usr_01',
  'Assessment Complete',
  'Sofia Rodriguez completed the technical assessment',
  'info',
  1,
  '2026-07-26 18:00:00'
);

-- =============================================================================
-- End of Seed Data
-- =============================================================================
