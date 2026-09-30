-- Migration: 018_alter_job_matches_nullable.sql
ALTER TABLE job_matches MODIFY COLUMN resume_id VARCHAR(64) NULL;
