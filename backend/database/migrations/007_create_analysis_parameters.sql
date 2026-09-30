-- Migration: 007_create_analysis_parameters.sql
CREATE TABLE IF NOT EXISTS resume_analysis_parameters (
    id VARCHAR(64) PRIMARY KEY,
    analysis_id VARCHAR(64) NOT NULL,
    category ENUM('ATS', 'CCS', 'SKILLS', 'PROJECTS', 'CERTIFICATIONS', 'INTERNSHIPS', 'EXPERIENCE', 'EDUCATION', 'KEYWORDS', 'FORMATTING', 'ROLE_RELEVANCE', 'CREDIBILITY', 'CONSISTENCY', 'ACHIEVEMENTS', 'CONTACT_INFORMATION', 'OTHER') NOT NULL DEFAULT 'ATS',
    parameter_name VARCHAR(100) NOT NULL,
    score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    severity ENUM('CRITICAL', 'MAJOR', 'MINOR', 'INFO', 'NONE') NOT NULL DEFAULT 'NONE',
    current_value TEXT NULL,
    problem TEXT NULL,
    why_it_matters TEXT NULL,
    recommended_action TEXT NULL,
    recommendation TEXT NULL,
    verification_status ENUM('VERIFIED', 'UNVERIFIED', 'VERIFICATION_UNAVAILABLE', 'SUSPICIOUS') NOT NULL DEFAULT 'VERIFICATION_UNAVAILABLE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (analysis_id) REFERENCES resume_analysis(id) ON DELETE CASCADE,
    INDEX idx_analysis_params_analysis_id (analysis_id),
    INDEX idx_analysis_params_severity (severity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
