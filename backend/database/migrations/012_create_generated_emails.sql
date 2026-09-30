-- Migration: 012_create_generated_emails.sql
CREATE TABLE IF NOT EXISTS generated_emails (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    resume_id VARCHAR(64) NULL,
    job_id VARCHAR(64) NULL,
    recipient_name VARCHAR(150) NULL,
    recipient_email VARCHAR(150) NULL,
    company_name VARCHAR(150) NOT NULL,
    job_title VARCHAR(150) NOT NULL,
    recruiter_info VARCHAR(150) NULL,
    subject VARCHAR(255) NULL,
    email_body TEXT NULL,
    generated_content TEXT NOT NULL,
    generation_number INT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE SET NULL,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL,
    INDEX idx_generated_emails_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
