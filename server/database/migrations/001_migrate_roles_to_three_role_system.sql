-- =============================================================================
-- Migration: Consolidate 5-Role System to 3-Role System (CLIENT, EMPLOYER, ADMIN)
-- Date: November 13, 2026
-- =============================================================================

USE hireflow_ai;

-- =============================================================================
-- STEP 1: Create Backup Tables (for rollback capability)
-- =============================================================================

CREATE TABLE users_backup_pre_phase2 AS SELECT * FROM users;
CREATE TABLE jobs_backup_pre_phase2 AS SELECT * FROM jobs;
CREATE TABLE candidates_backup_pre_phase2 AS SELECT * FROM candidates;
CREATE TABLE interviews_backup_pre_phase2 AS SELECT * FROM interviews;
CREATE TABLE activities_backup_pre_phase2 AS SELECT * FROM activities;

-- =============================================================================
-- STEP 2: Add Ownership Fields to Track Resource Ownership
-- =============================================================================

ALTER TABLE jobs 
ADD COLUMN employer_id CHAR(36) AFTER hiring_manager_id,
ADD CONSTRAINT fk_jobs_employer FOREIGN KEY (employer_id) REFERENCES users(id) ON DELETE RESTRICT,
ADD INDEX idx_employer_id (employer_id);

ALTER TABLE candidates 
ADD COLUMN employer_id CHAR(36) AFTER job_id,
ADD CONSTRAINT fk_candidates_employer FOREIGN KEY (employer_id) REFERENCES users(id) ON DELETE RESTRICT,
ADD INDEX idx_employer_id (employer_id);

ALTER TABLE interviews 
ADD COLUMN employer_id CHAR(36) AFTER job_id,
ADD CONSTRAINT fk_interviews_employer FOREIGN KEY (employer_id) REFERENCES users(id) ON DELETE RESTRICT,
ADD INDEX idx_interviews_employer (employer_id);

-- =============================================================================
-- STEP 3: Create New EMPLOYER Account (Recruitment Manager)
-- =============================================================================
-- This account inherits all recruitment functionality from Jarden (who becomes ADMIN)

INSERT INTO users (id, email, name, password_hash, role, department, created_at, updated_at) 
VALUES (
  'usr_05',
  'recruiter@hireflow.ai',
  'Recruitment Manager',
  '$2a$10$KMaxa867u3c/6Vx2LZwlgOirsVisJDdIMaURMgMOsW4DmiSpq3oYe',
  'EMPLOYER',
  'Talent Acquisition',
  NOW(),
  NOW()
);

-- =============================================================================
-- STEP 4: Migrate Jarden's Recruitment Data to New EMPLOYER Account
-- =============================================================================
-- Transfer all jobs, candidates, and interviews created by Jarden to the new EMPLOYER account

-- Update jobs ownership
UPDATE jobs 
SET created_by = 'usr_05', hiring_manager_id = 'usr_05', employer_id = 'usr_05'
WHERE created_by = 'usr_01';

-- Update candidates ownership (based on job ownership)
UPDATE candidates 
SET employer_id = 'usr_05'
WHERE job_id IN (SELECT id FROM jobs WHERE employer_id = 'usr_05');

-- Update interviews ownership (based on job ownership)
UPDATE interviews 
SET employer_id = 'usr_05'
WHERE job_id IN (SELECT id FROM jobs WHERE employer_id = 'usr_05');

-- Update activities ownership
UPDATE activities 
SET user_id = 'usr_05'
WHERE user_id = 'usr_01' AND type IN (
  'candidate_added', 'stage_changed', 'interview_scheduled', 
  'offer_sent', 'note_added', 'job_created'
);

-- =============================================================================
-- STEP 5: Populate employer_id for Alex Rivera's data (if any)
-- =============================================================================

UPDATE jobs 
SET employer_id = 'usr_02'
WHERE created_by = 'usr_02' OR hiring_manager_id = 'usr_02';

UPDATE candidates 
SET employer_id = 'usr_02'
WHERE job_id IN (SELECT id FROM jobs WHERE employer_id = 'usr_02');

UPDATE interviews 
SET employer_id = 'usr_02'
WHERE job_id IN (SELECT id FROM jobs WHERE employer_id = 'usr_02');

-- =============================================================================
-- STEP 6: Populate employer_id for Maya Patel's data (if any)
-- =============================================================================

UPDATE jobs 
SET employer_id = 'usr_03'
WHERE (created_by = 'usr_03' OR hiring_manager_id = 'usr_03') AND employer_id IS NULL;

UPDATE candidates 
SET employer_id = 'usr_03'
WHERE job_id IN (SELECT id FROM jobs WHERE employer_id = 'usr_03');

UPDATE interviews 
SET employer_id = 'usr_03'
WHERE job_id IN (SELECT id FROM jobs WHERE employer_id = 'usr_03');

-- =============================================================================
-- STEP 7: Populate employer_id for Jordan Kim's data (if any)
-- =============================================================================

UPDATE jobs 
SET employer_id = 'usr_04'
WHERE (created_by = 'usr_04' OR hiring_manager_id = 'usr_04') AND employer_id IS NULL;

UPDATE candidates 
SET employer_id = 'usr_04'
WHERE job_id IN (SELECT id FROM jobs WHERE employer_id = 'usr_04');

UPDATE interviews 
SET employer_id = 'usr_04'
WHERE job_id IN (SELECT id FROM jobs WHERE employer_id = 'usr_04');

-- =============================================================================
-- STEP 8: Update Role ENUM - Add New Values
-- =============================================================================
-- First, extend the ENUM to include both old and new values

ALTER TABLE users MODIFY COLUMN role 
  ENUM('admin', 'recruiter', 'hiring_manager', 'viewer', 'candidate', 'CLIENT', 'EMPLOYER', 'ADMIN') 
  DEFAULT 'CLIENT';

-- =============================================================================
-- STEP 9: Migrate User Roles (Atomic Transaction)
-- =============================================================================

START TRANSACTION;

-- Jarden becomes ADMIN
UPDATE users SET role = 'ADMIN' WHERE id = 'usr_01' AND role = 'admin';

-- Hiring managers become EMPLOYER
UPDATE users SET role = 'EMPLOYER' WHERE role = 'hiring_manager';

-- Any recruiters become EMPLOYER
UPDATE users SET role = 'EMPLOYER' WHERE role = 'recruiter';

-- Candidates become CLIENT
UPDATE users SET role = 'CLIENT' WHERE role = 'candidate';

-- Viewers become CLIENT (legacy role)
UPDATE users SET role = 'CLIENT' WHERE role = 'viewer';

-- New EMPLOYER account already has EMPLOYER role from creation
-- (verify by SELECT query if needed)

COMMIT;

-- =============================================================================
-- STEP 10: Clean Up Old ENUM Values
-- =============================================================================
-- Remove deprecated role values from the ENUM

ALTER TABLE users MODIFY COLUMN role 
  ENUM('CLIENT', 'EMPLOYER', 'ADMIN') 
  DEFAULT 'CLIENT';

-- =============================================================================
-- STEP 11: Verify Migration Success
-- =============================================================================

-- Display final role distribution
SELECT role, COUNT(*) as count FROM users GROUP BY role;

-- Display user details after migration
SELECT id, email, name, role FROM users ORDER BY role, email;

-- Display ownership tracking
SELECT 
  'jobs' as table_name, 
  COUNT(*) as total_records,
  COUNT(DISTINCT employer_id) as distinct_employers
FROM jobs
UNION ALL
SELECT 
  'candidates' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT employer_id) as distinct_employers
FROM candidates
UNION ALL
SELECT 
  'interviews' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT employer_id) as distinct_employers
FROM interviews;

-- =============================================================================
-- End of Migration
-- =============================================================================
-- Success! All data migrated to new three-role system.
-- Rollback: Use tables prefixed with _backup_pre_phase2 if needed.
-- =============================================================================

