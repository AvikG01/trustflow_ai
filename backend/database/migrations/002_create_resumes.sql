-- Migration: 002_create_resumes.sql
CREATE TABLE IF NOT EXISTS resumes (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    title VARCHAR(150) NOT NULL,
    resume_name VARCHAR(150) NULL,
    template_id VARCHAR(50) NOT NULL DEFAULT 'modern_clean',
    template_type VARCHAR(50) NOT NULL DEFAULT 'MODERN_TECHNICAL',
    target_role VARCHAR(100) NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    current_version INT NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_resumes_user_id (user_id),
    INDEX idx_resumes_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
