-- TrustFlow AI Database Schema

CREATE DATABASE IF NOT EXISTS trustflow_ai;
USE trustflow_ai;

-- 1. users
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
  account_type ENUM('FREE', 'PREMIUM') NOT NULL DEFAULT 'FREE',
  ats_ccs_access BOOLEAN NOT NULL DEFAULT FALSE,
  last_login DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. admin_users
CREATE TABLE IF NOT EXISTS admin_users (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  permissions JSON NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. user_sessions
CREATE TABLE IF NOT EXISTS user_sessions (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. resumes
CREATE TABLE IF NOT EXISTS resumes (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  title VARCHAR(150) NOT NULL,
  template_id VARCHAR(50) NOT NULL DEFAULT 'modern_clean',
  target_role VARCHAR(100) NULL,
  current_version INT NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. resume_versions
CREATE TABLE IF NOT EXISTS resume_versions (
  id VARCHAR(64) PRIMARY KEY,
  resume_id VARCHAR(64) NOT NULL,
  version_number INT NOT NULL,
  reference_code VARCHAR(100) UNIQUE NOT NULL,
  change_summary TEXT NULL,
  snapshot_json JSON NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
);

-- 6. resume_sections
CREATE TABLE IF NOT EXISTS resume_sections (
  id VARCHAR(64) PRIMARY KEY,
  resume_id VARCHAR(64) NOT NULL,
  section_type VARCHAR(50) NOT NULL,
  content_json JSON NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
);

-- 7. resume_analysis
CREATE TABLE IF NOT EXISTS resume_analysis (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  resume_id VARCHAR(64) NULL,
  reference_code VARCHAR(100) UNIQUE NOT NULL,
  target_job_title VARCHAR(150) NULL,
  target_job_description TEXT NULL,
  ats_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  ccs_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  overall_status VARCHAR(50) NOT NULL DEFAULT 'REVIEW_REQUIRED',
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  raw_analysis_json JSON NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 8. resume_analysis_parameters
CREATE TABLE IF NOT EXISTS resume_analysis_parameters (
  id VARCHAR(64) PRIMARY KEY,
  analysis_id VARCHAR(64) NOT NULL,
  category ENUM('ATS', 'CCS') NOT NULL,
  parameter_name VARCHAR(100) NOT NULL,
  score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  severity ENUM('CRITICAL', 'MAJOR', 'MINOR', 'NONE') NOT NULL DEFAULT 'NONE',
  current_value TEXT NULL,
  problem TEXT NULL,
  why_it_matters TEXT NULL,
  recommended_action TEXT NULL,
  FOREIGN KEY (analysis_id) REFERENCES resume_analysis(id) ON DELETE CASCADE
);

-- 9. job_searches
CREATE TABLE IF NOT EXISTS job_searches (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  search_query VARCHAR(150) NOT NULL,
  location VARCHAR(100) NULL,
  parameters_json JSON NULL,
  results_count INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 10. jobs
CREATE TABLE IF NOT EXISTS jobs (
  id VARCHAR(64) PRIMARY KEY,
  job_source VARCHAR(50) NOT NULL,
  source_job_id VARCHAR(100) NULL,
  title VARCHAR(150) NOT NULL,
  company VARCHAR(150) NOT NULL,
  location VARCHAR(100) NULL,
  job_url TEXT NOT NULL,
  job_description TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 11. job_matches
CREATE TABLE IF NOT EXISTS job_matches (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  resume_id VARCHAR(64) NOT NULL,
  job_id VARCHAR(64) NOT NULL,
  search_id VARCHAR(64) NULL,
  match_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  matching_skills_json JSON NULL,
  missing_skills_json JSON NULL,
  relevance_summary TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

-- 12. resume_job_optimizations
CREATE TABLE IF NOT EXISTS resume_job_optimizations (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  resume_id VARCHAR(64) NOT NULL,
  job_id VARCHAR(64) NULL,
  original_resume_version_id VARCHAR(64) NULL,
  optimized_resume_json JSON NOT NULL,
  changes_summary JSON NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
);

-- 13. generated_emails
CREATE TABLE IF NOT EXISTS generated_emails (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  resume_id VARCHAR(64) NULL,
  company_name VARCHAR(150) NOT NULL,
  job_title VARCHAR(150) NOT NULL,
  recruiter_info VARCHAR(150) NULL,
  generated_content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 14. uploaded_resumes
CREATE TABLE IF NOT EXISTS uploaded_resumes (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  stored_filename VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size INT NOT NULL,
  parsed_content_json JSON NULL,
  purpose ENUM('IMPORT', 'ATS_ANALYSIS') NOT NULL DEFAULT 'IMPORT',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 15. usage_limits
CREATE TABLE IF NOT EXISTS usage_limits (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) UNIQUE NOT NULL,
  resumes_count INT NOT NULL DEFAULT 0,
  job_optimizations_count INT NOT NULL DEFAULT 0,
  ai_emails_count INT NOT NULL DEFAULT 0,
  ats_ccs_access_granted BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 16. admin_actions
CREATE TABLE IF NOT EXISTS admin_actions (
  id VARCHAR(64) PRIMARY KEY,
  admin_id VARCHAR(64) NOT NULL,
  action_type VARCHAR(100) NOT NULL,
  target_type VARCHAR(50) NULL,
  target_id VARCHAR(64) NULL,
  details_json JSON NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 17. google_drive_files
CREATE TABLE IF NOT EXISTS google_drive_files (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  resume_id VARCHAR(64) NULL,
  analysis_id VARCHAR(64) NULL,
  file_type ENUM('RESUME', 'REPORT') NOT NULL,
  drive_file_id VARCHAR(128) NOT NULL,
  drive_folder_id VARCHAR(128) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  version INT NOT NULL DEFAULT 1,
  reference_code VARCHAR(100) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 18. audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NULL,
  action VARCHAR(100) NOT NULL,
  details_json JSON NULL,
  ip_address VARCHAR(45) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
