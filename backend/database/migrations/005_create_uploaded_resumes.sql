-- Migration: 005_create_uploaded_resumes.sql
CREATE TABLE IF NOT EXISTS uploaded_resumes (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    resume_id VARCHAR(64) NULL,
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    mime_type VARCHAR(100) NULL,
    file_size INT NOT NULL,
    file_hash VARCHAR(64) NULL,
    source_type VARCHAR(50) NULL DEFAULT 'UPLOAD',
    processing_status ENUM('UPLOADED', 'PROCESSING', 'EXTRACTED', 'FAILED', 'IMPORTED') NOT NULL DEFAULT 'UPLOADED',
    parsed_content_json JSON NULL,
    extracted_data JSON NULL,
    purpose ENUM('IMPORT', 'ATS_ANALYSIS') NOT NULL DEFAULT 'IMPORT',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE SET NULL,
    INDEX idx_uploaded_resumes_user_id (user_id),
    INDEX idx_uploaded_resumes_processing_status (processing_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
