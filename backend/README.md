# TRUSTFLOW AI - Backend Service

Production-oriented backend for **TrustFlow AI** — an AI-powered resume building, ATS/CCS analysis, job discovery, and resume optimization platform.

---

## 🚀 Key Architectural Highlights

1. **Mandatory Technology & CommonJS ONLY**:
   - Built strictly using **Node.js**, **Express.js**, and **CommonJS** (`require()` / `module.exports`).
   - No ES Modules (`import`/`export`) or TypeScript.
   - Relational **MySQL** storage layer with parameterized query execution.
   - Deployable on **Render** (target prototype capacity: 50–70 requests/minute).

2. **Strict Four-Main-API Operations Architecture**:
   - The backend deliberately avoids dozens of fragmented REST endpoints.
   - Exposes **ONLY FOUR MAIN API ROUTES**:
     - `POST /post`
     - `GET /get`
     - `UPDATE /update` (Also accepts `PUT` & `POST` for client HTTP compatibility)
     - `DELETE /delete` (Also accepts `POST` for client HTTP compatibility)
   - Every operation is dispatched inside the designated main controller using `action = functionName` and clean `switch (action)` logic.

3. **Dual Logically-Separated Gemini AI Services**:
   - **Service A (Resume AIService)**: Dedicated to ATS+CCS resume evaluation, certification verification, internship duration auditing, fact/figure checking, and job-description resume optimization. Uses `GEMINI_RESUME_API_KEY`.
   - **Service B (Job AIService)**: Dedicated to permitted job discovery, skill matching, and AI HR application email generation. Uses `GEMINI_JOB_API_KEY`.

4. **Strict Concurrency & Rate Limit Protection Queue**:
   - In-memory AI Queue Manager queues AI jobs with controlled concurrency (`AI_QUEUE_CONCURRENCY`, default 2).
   - Features **Exponential Backoff Retries**, job state tracking (`QUEUED`, `PROCESSING`, `COMPLETED`, `FAILED`, `RETYRING`), and **Idempotency protection**.

5. **Mandatory Google Drive Integration**:
   - Supports standard Google Accounts via OAuth2 (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`).
   - Uploads completed resume JSON/documents to `GOOGLE_DRIVE_RESUME_FOLDER_ID` using deterministic references: `TF-{USER_ID}-RES-{RESUME_ID}-V-{VERSION}`.
   - Uploads ATS/CCS audit reports to `GOOGLE_DRIVE_REPORT_FOLDER_ID` using reference: `TF-{USER_ID}-RES-{RESUME_ID}-ATSCCS-{ANALYSIS_ID}`.

6. **Strict Business & Credibility Rules**:
   - **Administrator ATS/CCS Password**: ATS/CCS evaluation is restricted and requires a special administrator-controlled password (`ADMIN_ATS_CCS_PASSWORD_HASH`). Free and Premium users both require this authorization password.
   - **65% Score Approval Threshold**: Scores above 65% are **NOT** automatically labeled as "top/best resume". Instead, `is_approved = false` and `overall_status = "REVIEW_REQUIRED"` are enforced along with a list of remaining weaknesses.
   - **Certifications**: Mark status as `"Verification unavailable"` when external API verification cannot be performed. Never blindly approve entered names.
   - **Internships**: Internships under 3 months receive withheld full approval/relevance treatment and are flagged.

---

## 🛠 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── env.js
│   │   └── constants.js
│   ├── database/
│   │   ├── db.js
│   │   ├── schema.sql
│   │   └── initDb.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── adminMiddleware.js
│   │   ├── atsPasswordMiddleware.js
│   │   ├── rateLimiter.js
│   │   ├── uploadMiddleware.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── userModel.js
│   │   ├── resumeModel.js
│   │   ├── analysisModel.js
│   │   ├── jobModel.js
│   │   ├── driveModel.js
│   │   ├── usageModel.js
│   │   └── auditModel.js
│   ├── services/
│   │   ├── ai/
│   │   │   ├── resumeAIService.js
│   │   │   └── jobAIService.js
│   │   ├── googleDrive/
│   │   │   └── googleDriveService.js
│   │   ├── queue/
│   │   │   └── aiQueue.js
│   │   ├── resume/
│   │   │   └── resumeParser.js
│   │   └── jobs/
│   ├── controllers/
│   │   ├── postController.js
│   │   ├── getController.js
│   │   ├── updateController.js
│   │   └── deleteController.js
│   ├── routes/
│   │   ├── postRoutes.js
│   │   ├── getRoutes.js
│   │   ├── updateRoutes.js
│   │   └── deleteRoutes.js
│   ├── validators/
│   │   └── actionValidators.js
│   ├── utils/
│   │   ├── responseHandler.js
│   │   └── logger.js
│   └── app.js
├── tests/
│   ├── api.test.js
│   └── concurrency_and_limits.test.js
├── server.js
├── package.json
├── .env.example
├── README.md
├── API_DOCUMENTATION.md
├── SCHEMA.md
├── DEPLOYMENT.md
├── SECURITY.md
└── CONCURRENCY.md
```

---

## ⚙️ Installation & Local Setup

### 1. Prerequisites
- Node.js >= 18.0.0
- MySQL Server 8.x (or local fallback mode for offline testing)

### 2. Quick Installation
```bash
# Clone or navigate to backend repository
cd D:\resume_pro\backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

### 3. Initialize Database
```bash
npm run db:init
```

### 4. Run Application
```bash
# Production mode
npm start

# Development watch mode
npm run dev
```

---

## 🧪 Automated Testing

Run the complete end-to-end test suite:
```bash
npm test
```

All 22 test cases verify registration, login, JWT authorization, usage limits enforcement, file upload parsing, ATS authorization password check, Gemini AI queue execution, job discovery, HR email generation, and Google Drive metadata recording.

---

## 📄 License
ISC License — TrustFlow AI Engineering Team.
