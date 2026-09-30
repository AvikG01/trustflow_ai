-- Migration: 003_create_resume_versions.sql
CREATE TABLE IF NOT EXISTS resume_versions (
    id VARCHAR(64) PRIMARY KEY,
    resume_id VARCHAR(64) NOT NULL,
    version_number INT NOT NULL,
    reference_code VARCHAR(100) NOT NULL UNIQUE,
    change_summary TEXT NULL,
    snapshot_json JSON NOT NULL,
    resume_data JSON NULL,
    created_by VARCHAR(64) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_resume_version (resume_id, version_number),
    FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
    INDEX idx_resume_versions_resume_id (resume_id),
    INDEX idx_resume_versions_version_number (version_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
