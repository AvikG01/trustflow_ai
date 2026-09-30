# TrustFlow AI - API Action Specification

The TrustFlow AI backend strictly exposes **FOUR main endpoints**:

- `POST /post`
- `GET /get`
- `UPDATE /update` (also supports `PUT` and `POST /update`)
- `DELETE /delete` (also supports `POST /delete`)

All operational sub-routes are passed using the parameter `action` in the JSON request body, query parameter, or `x-action` header.

---

## Standard Response Envelope Formats

### Success Response (HTTP 200 / 201)
```json
{
  "success": true,
  "message": "Human readable success message",
  "data": {}
}
```

### Error Response (HTTP 400 / 401 / 403 / 404 / 409 / 429 / 500)
```json
{
  "success": false,
  "message": "Human readable error description",
  "errorCode": "ERROR_CODE_CONSTANT",
  "details": {}
}
```

---

## 1. POST Operations (`POST /post`)

| Action | Auth Required | Description | Request Body Parameters |
|---|---|---|---|
| `register` | Public | Register new user account (FREE account created by default, usage limits initialized) | `action`, `name`, `email`, `password` |
| `login` | Public | Authenticate user & issue JWT | `action`, `email`, `password` |
| `createResume` | JWT | Create resume from scratch (Enforces FREE limit: 2 resumes max) | `action`, `title`, `template_id`, `target_role`, `sections` |
| `saveDraft` | JWT | Save draft modifications for an existing resume | `action`, `resume_id`, `title`, `template_id`, `sections` |
| `duplicateResume` | JWT | Duplicate an existing resume (Enforces resume creation limit) | `action`, `resume_id` |
| `uploadResume` | JWT | Upload PDF/DOC/DOCX resume file to parse and create resume or analyze | `action`, `purpose` (`IMPORT`/`ATS_ANALYSIS`), `file` (multipart upload) |
| `analyzeResume` | JWT + ATS Password | Run ATS + CCS Analysis Pipeline using Gemini Service A | `action`, `ats_password`, `resume_id`, `target_job_title`, `target_job_description` |
| `searchJobs` | JWT | Curate & match job listings from permitted sources using Gemini Service B | `action`, `target_role`, `location`, `skills`, `experience_years` |
| `optimizeResumeForJob` | JWT | Optimize resume for job description (Enforces FREE limit: 3 mods max) | `action`, `resume_id`, `job_description` |
| `generateHREmail` | JWT | Generate tailored AI job application email (Enforces FREE limit: 5 emails max) | `action`, `job_title`, `company_name`, `recruiter_info`, `resume_id` |
| `syncGoogleDrive` | JWT | Trigger document sync to Google Drive Resume Folder | `action`, `resume_id` |

---

## 2. GET Operations (`GET /get`)

| Action | Auth Required | Description | Query Parameters |
|---|---|---|---|
| `getProfile` | JWT | Fetch authenticated user profile & current usage limits | `action=getProfile` |
| `getResumes` | JWT | List all resumes belonging to user | `action=getResumes` |
| `getResume` | JWT | Fetch single resume details and sections | `action=getResume`, `resume_id` |
| `getResumeVersions` | JWT | List all version snapshots for a resume | `action=getResumeVersions`, `resume_id` |
| `getResumeVersion` | JWT | Fetch specific historical snapshot for a resume version | `action=getResumeVersion`, `resume_id`, `version` |
| `getAnalysis` | JWT | Fetch specific ATS+CCS audit report details | `action=getAnalysis`, `analysis_id` |
| `getAnalysisHistory` | JWT | Fetch user analysis audit history | `action=getAnalysisHistory` |
| `getJobSearches` | JWT | Fetch historical job searches | `action=getJobSearches` |
| `getJobMatches` | JWT | Fetch calculated job matches | `action=getJobMatches` |
| `getDriveFiles` | JWT | List Google Drive uploaded file references | `action=getDriveFiles` |
| `getUsageLimits` | JWT | Fetch user usage limits and counters | `action=getUsageLimits` |
| `getResumeTemplates` | Public | List available resume structures/templates | `action=getResumeTemplates` |
| `getAdminUsers` | Admin JWT | List all system registered users | `action=getAdminUsers` |
| `getAdminAuditLogs` | Admin JWT | List system-wide audit logs | `action=getAdminAuditLogs`, `limit` |
| `getAdminStats` | Admin JWT | System performance & account metrics | `action=getAdminStats` |

---

## 3. UPDATE Operations (`UPDATE /update`)

| Action | Auth Required | Description | Request Body Parameters |
|---|---|---|---|
| `updateResume` | JWT | Update resume sections & title, incrementing major version number | `action`, `resume_id`, `title`, `template_id`, `target_role`, `sections`, `change_summary` |
| `updateUserProfile` | JWT | Update candidate profile name | `action`, `name` |
| `grantATSCCS` | Admin JWT | Grant or revoke ATS/CCS access status | `action`, `target_user_id`, `grant` (boolean) |
| `updateUsageLimits` | Admin JWT | Adjust user limits & usage counters | `action`, `target_user_id`, `resumes_count`, `job_optimizations_count`, `ai_emails_count` |

---

## 4. DELETE Operations (`DELETE /delete`)

| Action | Auth Required | Description | Request Parameters |
|---|---|---|---|
| `deleteResume` | JWT | Delete a resume, its sections, and update counter | `action=deleteResume`, `resume_id` |
| `deleteAnalysis` | JWT | Delete an ATS/CCS analysis report | `action=deleteAnalysis`, `analysis_id` |
| `deleteUser` | Admin JWT | Delete user account and associated resources | `action=deleteUser`, `target_user_id` |
