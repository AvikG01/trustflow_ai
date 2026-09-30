-- Migration: 013_create_usage_limits.sql
CREATE TABLE IF NOT EXISTS usage_limits (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL UNIQUE,
    max_resumes INT NOT NULL DEFAULT 2,
    resumes_count INT NOT NULL DEFAULT 0,
    resumes_used INT NOT NULL DEFAULT 0,
    max_optimizations INT NOT NULL DEFAULT 3,
    job_optimizations_count INT NOT NULL DEFAULT 0,
    optimizations_used INT NOT NULL DEFAULT 0,
    max_ai_emails INT NOT NULL DEFAULT 5,
    ai_emails_count INT NOT NULL DEFAULT 0,
    ai_emails_used INT NOT NULL DEFAULT 0,
    ats_ccs_access BOOLEAN NOT NULL DEFAULT FALSE,
    ats_ccs_access_granted BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
