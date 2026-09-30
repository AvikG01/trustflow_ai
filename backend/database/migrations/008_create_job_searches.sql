-- Migration: 008_create_job_searches.sql
CREATE TABLE IF NOT EXISTS job_searches (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    search_query VARCHAR(150) NULL,
    query VARCHAR(150) NULL,
    location VARCHAR(100) NULL,
    experience VARCHAR(50) NULL,
    salary_preference VARCHAR(100) NULL,
    work_mode VARCHAR(50) NULL,
    skills JSON NULL,
    parameters_json JSON NULL,
    results_count INT DEFAULT 0,
    status ENUM('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'COMPLETED',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_job_searches_user_id (user_id),
    INDEX idx_job_searches_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
