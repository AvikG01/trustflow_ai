const db = require('../database/db');
const { v4: uuidv4 } = require('uuid');

async function createJobSearch(userId, queryStr, location, parameters = {}) {
  const searchId = uuidv4();
  await db.query(
    `INSERT INTO job_searches (id, user_id, search_query, location, parameters_json, created_at)
     VALUES (?, ?, ?, ?, ?, NOW())`,
    [searchId, userId, queryStr, location, JSON.stringify(parameters)]
  );
  return searchId;
}

async function saveJob({ jobSource, sourceJobId, title, company, location, jobUrl, jobDescription }) {
  const jobId = uuidv4();
  await db.query(
    `INSERT INTO jobs (id, job_source, source_job_id, title, company, location, job_url, job_description, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [jobId, jobSource, sourceJobId || null, title, company, location || '', jobUrl, jobDescription || '']
  );
  return jobId;
}

async function createJobMatch({ userId, resumeId, jobId, searchId, matchScore, matchingSkills = [], missingSkills = [], relevanceSummary = '' }) {
  const matchId = uuidv4();
  const validResumeId = (resumeId && resumeId !== 'DEFAULT') ? resumeId : null;
  await db.query(
    `INSERT INTO job_matches (id, user_id, resume_id, job_id, search_id, match_score, matching_skills_json, missing_skills_json, relevance_summary, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [matchId, userId, validResumeId, jobId, searchId || null, matchScore, JSON.stringify(matchingSkills), JSON.stringify(missingSkills), relevanceSummary]
  );
  return matchId;
}

async function getJobSearchesByUserId(userId) {
  return await db.query(
    `SELECT id, user_id, search_query, location, parameters_json, results_count, created_at
     FROM job_searches WHERE user_id = ? ORDER BY created_at DESC`,
    [userId]
  );
}

async function getJobMatchesByUserId(userId) {
  return await db.query(
    `SELECT jm.id, jm.match_score, jm.matching_skills_json, jm.missing_skills_json, jm.relevance_summary, jm.created_at,
            j.title AS job_title, j.company, j.location, j.job_url, j.job_source
     FROM job_matches jm
     JOIN jobs j ON jm.job_id = j.id
     WHERE jm.user_id = ? ORDER BY jm.created_at DESC`,
    [userId]
  );
}

async function saveOptimization({ userId, resumeId, jobId, originalVersionId, optimizedResumeJson, changesSummary = {} }) {
  const optId = uuidv4();
  await db.query(
    `INSERT INTO resume_job_optimizations (id, user_id, resume_id, job_id, original_resume_version_id, optimized_resume_json, changes_summary, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
    [optId, userId, resumeId, jobId || null, originalVersionId || null, JSON.stringify(optimizedResumeJson || {}), JSON.stringify(changesSummary || {})]
  );
  return optId;
}

async function saveGeneratedEmail({ userId, resumeId, companyName, jobTitle, recruiterInfo, content }) {
  const emailId = uuidv4();
  await db.query(
    `INSERT INTO generated_emails (id, user_id, resume_id, company_name, job_title, recruiter_info, generated_content, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
    [emailId, userId, resumeId || null, companyName, jobTitle, recruiterInfo || '', content]
  );
  return emailId;
}

async function searchExistingJobsInDb({ queryStr = '', location = '', limit = 20 }) {
  const normQuery = `%${queryStr.trim()}%`;
  const normLoc = `%${location.trim()}%`;
  return await db.query(
    `SELECT id, job_source, source_job_id, title, company, location, job_url, job_description, created_at
     FROM jobs
     WHERE (title LIKE ? OR company LIKE ? OR job_description LIKE ?)
       AND (? = '%%' OR location LIKE ?)
     ORDER BY created_at DESC LIMIT ?`,
    [normQuery, normQuery, normQuery, normLoc, normLoc, limit]
  );
}

module.exports = {
  createJobSearch,
  saveJob,
  createJobMatch,
  getJobSearchesByUserId,
  getJobMatchesByUserId,
  saveOptimization,
  saveGeneratedEmail,
  searchExistingJobsInDb,
};
