# TrustFlow AI - Render Deployment Guide

The TrustFlow AI backend is fully optimized for single-instance or multi-instance deployment on **Render** (as well as Railway, AWS App Runner, or Heroku).

---

## 1. Pre-Deployment Environment Setup

Create a Web Service on Render and configure the following Environment Variables in the Render Dashboard:

| Variable Name | Required Value Description |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `5000` (Render overrides with `$PORT` automatically) |
| `MYSQL_HOST` | Hostname of remote MySQL database (e.g., Aiven, PlanetScale, AWS RDS) |
| `MYSQL_PORT` | `3306` |
| `MYSQL_DATABASE` | `trustflow_ai` |
| `MYSQL_USER` | Production MySQL Username |
| `MYSQL_PASSWORD` | Production MySQL Password |
| `JWT_SECRET` | 64-character random cryptographically secure string |
| `JWT_EXPIRES_IN` | `7d` |
| `ADMIN_ATS_CCS_PASSWORD_HASH` | Bcrypt hash of secret administrator ATS/CCS password |
| `GEMINI_RESUME_API_KEY` | Gemini API Key for Service A (Resume Analysis) |
| `GEMINI_JOB_API_KEY` | Gemini API Key for Service B (Job Search & HR Emails) |
| `GOOGLE_CLIENT_ID` | OAuth2 Client ID for Google Drive API |
| `GOOGLE_CLIENT_SECRET` | OAuth2 Client Secret for Google Drive API |
| `GOOGLE_REFRESH_TOKEN` | Authorized OAuth2 Refresh Token for Normal Google Account |
| `GOOGLE_DRIVE_RESUME_FOLDER_ID` | Google Drive Folder ID for uploaded resumes |
| `GOOGLE_DRIVE_REPORT_FOLDER_ID` | Google Drive Folder ID for audit reports |
| `AI_QUEUE_CONCURRENCY` | `2` (recommended for Render prototype capacity 50-70 requests/min) |
| `TOP_RESUME_APPROVAL_THRESHOLD` | `65` |

---

## 2. Render Build & Start Commands

- **Environment**: `Node`
- **Build Command**:
  ```bash
  npm install
  ```
- **Start Command**:
  ```bash
  npm start
  ```

---

## 3. Database Initialization on Render

Run database schema migration once during deployment:
```bash
npm run db:init
```

---

## 4. Render Ephemeral Filesystem Handling

The backend implements automatic temporary file cleanup (`fs.unlinkSync`) inside `src/services/resume/resumeParser.js`. Uploaded files are processed in memory and immediately removed from the Render ephemeral disk after parsing.
