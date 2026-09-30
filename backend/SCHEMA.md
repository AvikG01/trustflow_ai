# TrustFlow AI - Database Schema Documentation

The system uses **MySQL** as its primary relational store.

---

## Relational Entity Schema

### 1. `users`
- `id` (VARCHAR(64), PK): Unique User ID (UUID).
- `name` (VARCHAR(100)): User full name.
- `email` (VARCHAR(150), UNIQUE): Unique email address.
- `password_hash` (VARCHAR(255)): Bcrypt password hash.
- `role` (ENUM('USER', 'ADMIN')): System access role. Default `USER`.
- `account_type` (ENUM('FREE', 'PREMIUM')): Subscription plan type. Default `FREE`.
- `ats_ccs_access` (BOOLEAN): Special ATS/CCS permission indicator. Default `FALSE`.
- `last_login` (DATETIME): Timestamp of last successful login.
- `created_at` (DATETIME): Registration timestamp.
- `updated_at` (DATETIME): Last modification timestamp.

### 2. `admin_users`
- `id` (VARCHAR(64), PK): Unique Admin Record ID.
- `user_id` (VARCHAR(64), FK -> users.id ON DELETE CASCADE).
- `permissions` (JSON): Granular administrative permissions.

### 3. `user_sessions`
- `id` (VARCHAR(64), PK): Session ID.
- `user_id` (VARCHAR(64), FK -> users.id ON DELETE CASCADE).
- `refresh_token` (TEXT): Encrypted refresh token.
- `expires_at` (DATETIME): Token expiration timestamp.

### 4. `resumes`
- `id` (VARCHAR(64), PK): Resume ID.
- `user_id` (VARCHAR(64), FK -> users.id ON DELETE CASCADE).
- `title` (VARCHAR(150)): Resume title.
- `template_id` (VARCHAR(50)): Resume template identifier ('modern_clean', 'executive_bold', 'technical_grid').
- `target_role` (VARCHAR(100)): Desired job role.
- `current_version` (INT): Current active version number (default 1).

### 5. `resume_versions`
- `id` (VARCHAR(64), PK): Version ID.
- `resume_id` (VARCHAR(64), FK -> resumes.id ON DELETE CASCADE).
- `version_number` (INT): Incremental version number.
- `reference_code` (VARCHAR(100), UNIQUE): Deterministic reference (`TF-{USER_ID}-RES-{RESUME_ID}-V-{VERSION}`).
- `change_summary` (TEXT): Description of modifications made.
- `snapshot_json` (JSON): Full JSON snapshot of resume at this version.

### 6. `resume_sections`
- `id` (VARCHAR(64), PK): Section ID.
- `resume_id` (VARCHAR(64), FK -> resumes.id ON DELETE CASCADE).
- `section_type` (VARCHAR(50)): Section type ('personal', 'summary', 'objective', 'education', 'skills', 'projects', 'certifications', 'internships', 'work_experience', 'achievements', 'publications', 'links', 'languages', 'additional').
- `content_json` (JSON): Structured section content.
- `sort_order` (INT): Section rendering order.

### 7. `resume_analysis`
- `id` (VARCHAR(64), PK): Analysis Report ID.
- `user_id` (VARCHAR(64), FK -> users.id ON DELETE CASCADE).
- `resume_id` (VARCHAR(64), FK -> resumes.id ON DELETE CASCADE).
- `reference_code` (VARCHAR(100), UNIQUE): Report reference (`TF-{USER_ID}-RES-{RESUME_ID}-ATSCCS-{ANALYSIS_ID}`).
- `target_job_title` (VARCHAR(150)): Target job title evaluated against.
- `ats_score` (DECIMAL(5,2)): Calculated ATS compatibility score (0-100).
- `ccs_score` (DECIMAL(5,2)): Calculated Executive Candidate Credibility System score (0-100).
- `overall_status` (VARCHAR(50)): Status ('REVIEW_REQUIRED', 'FLAWED').
- `is_approved` (BOOLEAN): Approval flag (strictly set to false when threshold rule is enforced).

### 8. `resume_analysis_parameters`
- `id` (VARCHAR(64), PK): Parameter Record ID.
- `analysis_id` (VARCHAR(64), FK -> resume_analysis.id ON DELETE CASCADE).
- `category` (ENUM('ATS', 'CCS')): Evaluation stream.
- `parameter_name` (VARCHAR(100)): Name of parameter evaluated.
- `score` (DECIMAL(5,2)): Parameter score.
- `severity` (ENUM('CRITICAL', 'MAJOR', 'MINOR', 'NONE')): Flaw severity.
- `current_value` (TEXT): Evaluated resume content.
- `problem` (TEXT): Issue description.
- `why_it_matters` (TEXT): Business/ATS impact.
- `recommended_action` (TEXT): Corrective action guidance.

### 9. `job_searches`
- `id` (VARCHAR(64), PK): Search ID.
- `user_id` (VARCHAR(64), FK -> users.id ON DELETE CASCADE).
- `search_query` (VARCHAR(150)): Job role search query.
- `location` (VARCHAR(100)): Target location.
- `parameters_json` (JSON): Filter parameters.

### 10. `jobs`
- `id` (VARCHAR(64), PK): Job listing ID.
- `job_source` (VARCHAR(50)): Platform ('LinkedIn', 'Naukri', 'Indeed').
- `source_job_id` (VARCHAR(100)): Source platform ID.
- `title` (VARCHAR(150)): Job title.
- `company` (VARCHAR(150)): Employer company name.
- `location` (VARCHAR(100)): Job location.
- `job_url` (TEXT): Permitted job link.

### 11. `job_matches`
- `id` (VARCHAR(64), PK): Job match ID.
- `user_id` (VARCHAR(64), FK -> users.id ON DELETE CASCADE).
- `resume_id` (VARCHAR(64), FK -> resumes.id ON DELETE CASCADE).
- `job_id` (VARCHAR(64), FK -> jobs.id ON DELETE CASCADE).
- `match_score` (DECIMAL(5,2)): Alignment match percentage.

### 12. `resume_job_optimizations`
- `id` (VARCHAR(64), PK): Optimization Record ID.
- `user_id` (VARCHAR(64), FK -> users.id ON DELETE CASCADE).
- `resume_id` (VARCHAR(64), FK -> resumes.id ON DELETE CASCADE).
- `optimized_resume_json` (JSON): Tailored resume content (facts strictly preserved).

### 13. `generated_emails`
- `id` (VARCHAR(64), PK): Email ID.
- `user_id` (VARCHAR(64), FK -> users.id ON DELETE CASCADE).
- `company_name` (VARCHAR(150)): Recruiter company name.
- `job_title` (VARCHAR(150)): Target job title.
- `generated_content` (TEXT): AI generated email subject and body.

### 14. `uploaded_resumes`
- `id` (VARCHAR(64), PK): Upload Record ID.
- `user_id` (VARCHAR(64), FK -> users.id ON DELETE CASCADE).
- `original_filename` (VARCHAR(255)): Original document name.
- `file_type` (VARCHAR(50)): Document MIME type.
- `purpose` (ENUM('IMPORT', 'ATS_ANALYSIS')): Upload purpose.

### 15. `usage_limits`
- `id` (VARCHAR(64), PK): Usage record ID.
- `user_id` (VARCHAR(64), UNIQUE, FK -> users.id ON DELETE CASCADE).
- `resumes_count` (INT): Current resumes created counter.
- `job_optimizations_count` (INT): Current job optimizations executed counter.
- `ai_emails_count` (INT): Current HR emails generated counter.

### 16. `admin_actions`
- `id` (VARCHAR(64), PK): Admin action ID.
- `admin_id` (VARCHAR(64), FK -> users.id ON DELETE CASCADE).
- `action_type` (VARCHAR(100)): Description of administrative action.

### 17. `google_drive_files`
- `id` (VARCHAR(64), PK): Drive record ID.
- `user_id` (VARCHAR(64), FK -> users.id ON DELETE CASCADE).
- `resume_id` (VARCHAR(64), NULL).
- `analysis_id` (VARCHAR(64), NULL).
- `file_type` (ENUM('RESUME', 'REPORT')).
- `drive_file_id` (VARCHAR(128)): Google Drive file ID.
- `drive_folder_id` (VARCHAR(128)): Target Google Drive folder ID.
- `file_name` (VARCHAR(255)): File name.
- `version` (INT): Version number.
- `reference_code` (VARCHAR(100)): Reference code (`TF-{USER_ID}-RES-{RESUME_ID}-V-{VERSION}` or `TF-{USER_ID}-RES-{RESUME_ID}-ATSCCS-{ANALYSIS_ID}`).

### 18. `audit_logs`
- `id` (VARCHAR(64), PK): Audit log ID.
- `user_id` (VARCHAR(64), NULL).
- `action` (VARCHAR(100)): System activity description.
- `details_json` (JSON): Sanitized details (secrets redacted).
- `ip_address` (VARCHAR(45)): Client IP address.
