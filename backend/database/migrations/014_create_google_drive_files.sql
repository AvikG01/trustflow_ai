-- Migration: 014_create_google_drive_files.sql
CREATE TABLE IF NOT EXISTS google_drive_files (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    resume_id VARCHAR(64) NULL,
    analysis_id VARCHAR(64) NULL,
    file_type ENUM('RESUME', 'REPORT', 'ATS_REPORT', 'CCS_REPORT', 'ATS_CCS_REPORT', 'OTHER') NOT NULL,
    drive_file_id VARCHAR(128) NOT NULL,
    drive_folder_id VARCHAR(128) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    version INT NOT NULL DEFAULT 1,
    reference_code VARCHAR(100) NOT NULL,
    reference_key VARCHAR(100) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_drive_files_user_id (user_id),
    INDEX idx_drive_files_reference_key (reference_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
