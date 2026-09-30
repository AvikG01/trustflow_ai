-- Migration: 011_create_resume_optimizations.sql
CREATE TABLE IF NOT EXISTS resume_job_optimizations (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    resume_id VARCHAR(64) NOT NULL,
    job_id VARCHAR(64) NULL,
    job_description TEXT NULL,
    original_resume_version_id VARCHAR(64) NULL,
    original_version_id VARCHAR(64) NULL,
    optimized_version_id VARCHAR(64) NULL,
    optimization_number INT NOT NULL DEFAULT 1,
    optimized_resume_json JSON NOT NULL,
    changes_summary JSON NULL,
    changes_data JSON NULL,
    status VARCHAR(50) DEFAULT 'COMPLETED',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL,
    INDEX idx_resume_opts_user_id (user_id),
    INDEX idx_resume_opts_resume_id (resume_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
