-- =============================================================================
-- HIREFLOW-AI MySQL Database Schema
-- Database: hireflow_ai
-- =============================================================================

-- Drop existing database (optional for fresh setup)
-- DROP DATABASE IF EXISTS hireflow_ai;

-- Create database
CREATE DATABASE IF NOT EXISTS hireflow_ai
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE hireflow_ai;

-- =============================================================================
-- Users Table
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY COMMENT 'UUID primary key',
  email VARCHAR(255) UNIQUE NOT NULL COMMENT 'Unique email address',
  name VARCHAR(255) NOT NULL COMMENT 'Full name',
  password_hash VARCHAR(255) NOT NULL COMMENT 'bcrypt hashed password',
  avatar VARCHAR(500) COMMENT 'Avatar URL',
  role ENUM('admin', 'recruiter', 'hiring_manager', 'viewer', 'candidate') NOT NULL DEFAULT 'candidate' COMMENT 'User role',
  department VARCHAR(100) COMMENT 'Department name',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Account creation timestamp',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User accounts and authentication';

-- =============================================================================
-- Jobs Table
-- =============================================================================
CREATE TABLE IF NOT EXISTS jobs (
  id CHAR(36) PRIMARY KEY COMMENT 'UUID primary key',
  title VARCHAR(255) NOT NULL COMMENT 'Job title',
  department VARCHAR(100) NOT NULL COMMENT 'Department name',
  location VARCHAR(255) NOT NULL COMMENT 'Work location',
  type ENUM('full-time', 'part-time', 'contract', 'internship', 'remote') NOT NULL COMMENT 'Employment type',
  salary_min INT COMMENT 'Minimum salary',
  salary_max INT COMMENT 'Maximum salary',
  description LONGTEXT NOT NULL COMMENT 'Full job description',
  responsibilities JSON COMMENT 'Array of responsibilities',
  benefits JSON COMMENT 'Array of benefits',
  skills_required JSON COMMENT 'Array of required skills',
  skills_preferred JSON COMMENT 'Array of preferred skills',
  experience_years INT COMMENT 'Required years of experience',
  education VARCHAR(255) COMMENT 'Education requirement',
  status ENUM('open', 'closed', 'paused', 'draft') NOT NULL DEFAULT 'draft' COMMENT 'Job posting status',
  deadline DATE COMMENT 'Application deadline',
  applicant_count INT DEFAULT 0 COMMENT 'Number of applicants',
  created_by CHAR(36) NOT NULL COMMENT 'User who created this job',
  hiring_manager_id CHAR(36) COMMENT 'Assigned hiring manager ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Job creation timestamp',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (hiring_manager_id) REFERENCES users(id) ON DELETE SET NULL,
  
  INDEX idx_status (status),
  INDEX idx_created_by (created_by),
  INDEX idx_hiring_manager_id (hiring_manager_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Job postings and requisitions';

-- =============================================================================
-- Candidates Table
-- =============================================================================
CREATE TABLE IF NOT EXISTS candidates (
  id CHAR(36) PRIMARY KEY COMMENT 'UUID primary key',
  name VARCHAR(255) NOT NULL COMMENT 'Candidate full name',
  email VARCHAR(255) NOT NULL COMMENT 'Candidate email',
  phone VARCHAR(20) NOT NULL COMMENT 'Phone number',
  location VARCHAR(255) NOT NULL COMMENT 'Geographic location',
  linkedin VARCHAR(500) COMMENT 'LinkedIn profile URL',
  github VARCHAR(500) COMMENT 'GitHub profile URL',
  portfolio VARCHAR(500) COMMENT 'Portfolio URL',
  photo_url VARCHAR(500) COMMENT 'Profile photo URL',
  resume_url VARCHAR(500) COMMENT 'Resume file URL',
  resume_text LONGTEXT COMMENT 'Extracted resume text',
  parsed_data JSON COMMENT 'Parsed resume data (experience, education, skills, etc)',
  ai_scores JSON COMMENT 'AI evaluation scores',
  match_scores JSON COMMENT 'Job-to-candidate match scores',
  status ENUM('applied', 'screening', 'shortlisted', 'interview', 'technical_test', 'hr_interview', 'offer', 'hired', 'rejected') NOT NULL DEFAULT 'applied' COMMENT 'Pipeline stage',
  job_id CHAR(36) COMMENT 'Job ID they applied for',
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Application submission time',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL,
  
  INDEX idx_status (status),
  INDEX idx_job_id (job_id),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Candidate profiles and applications';

-- =============================================================================
-- Interviews Table
-- =============================================================================
CREATE TABLE IF NOT EXISTS interviews (
  id CHAR(36) PRIMARY KEY COMMENT 'UUID primary key',
  candidate_id CHAR(36) NOT NULL COMMENT 'Candidate being interviewed',
  job_id CHAR(36) COMMENT 'Job position related to interview',
  scheduled_at TIMESTAMP NOT NULL COMMENT 'Interview scheduled date/time',
  type ENUM('technical', 'behavioral', 'hr', 'coding', 'final') NOT NULL COMMENT 'Interview type',
  status ENUM('scheduled', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled' COMMENT 'Interview status',
  questions JSON COMMENT 'Interview questions array',
  notes LONGTEXT COMMENT 'Interview feedback and notes',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  
  FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL,
  
  INDEX idx_candidate_id (candidate_id),
  INDEX idx_job_id (job_id),
  INDEX idx_status (status),
  INDEX idx_scheduled_at (scheduled_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Interview scheduling and tracking';

-- =============================================================================
-- Activities Table (Audit Log)
-- =============================================================================
CREATE TABLE IF NOT EXISTS activities (
  id CHAR(36) PRIMARY KEY COMMENT 'UUID primary key',
  type ENUM('candidate_added', 'stage_changed', 'interview_scheduled', 'offer_sent', 'note_added', 'job_created') NOT NULL COMMENT 'Activity type',
  description LONGTEXT NOT NULL COMMENT 'Activity description',
  user_id CHAR(36) NOT NULL COMMENT 'User who performed the action',
  metadata JSON COMMENT 'Additional activity metadata',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Activity timestamp',
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at),
  INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Audit trail of recruitment workflow events';

-- =============================================================================
-- Notifications Table
-- =============================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id CHAR(36) PRIMARY KEY COMMENT 'UUID primary key',
  user_id CHAR(36) NOT NULL COMMENT 'Recipient user ID',
  title VARCHAR(255) NOT NULL COMMENT 'Notification title',
  message LONGTEXT NOT NULL COMMENT 'Notification message',
  type ENUM('info', 'success', 'warning', 'error') NOT NULL DEFAULT 'info' COMMENT 'Notification type',
  is_read TINYINT(1) DEFAULT 0 COMMENT 'Read status',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  INDEX idx_user_id (user_id),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User notifications';

-- =============================================================================
-- End of Schema
-- =============================================================================
