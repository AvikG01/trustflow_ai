# TrustFlow AI - Backend Security Specification

Security architecture implemented across the TrustFlow AI backend:

---

## 1. Secrets Non-Exposure Guarantee

The backend guarantees that the following sensitive data are **NEVER** exposed in API responses, logs, or client-side assets:
- Plaintext Passwords & Password Hashes (`password_hash`)
- JWT Secrets (`JWT_SECRET`)
- Gemini AI API Keys (`GEMINI_RESUME_API_KEY`, `GEMINI_JOB_API_KEY`)
- Google Client Secret (`GOOGLE_CLIENT_SECRET`)
- Google Access/Refresh Tokens (`GOOGLE_ACCESS_TOKEN`, `GOOGLE_REFRESH_TOKEN`)
- Administrator ATS/CCS Password (`ADMIN_ATS_CCS_PASSWORD_HASH`)

---

## 2. Password Hashing & Authentication Security
- User passwords are processed using `bcrypt.hash` with salt factor 10.
- Administrator ATS/CCS password authorization is verified using bcrypt hash comparison (`bcrypt.compareSync`).

---

## 3. Rate Limiting & Denial of Service Protection
- Express `express-rate-limit` middleware enforces sliding window rate limits per IP (`RATE_LIMIT_WINDOW` = 15 minutes, `RATE_LIMIT_MAX_REQUESTS` = 100).
- Prevents RPM/TPM API flooding.

---

## 4. HTTP Headers & Cross-Origin Resource Sharing (CORS)
- `helmet` middleware is active, enforcing security headers (`X-Frame-Options`, `Strict-Transport-Security`, `X-Content-Type-Options`).
- `cors` middleware restricts origin access and allowed headers (`Content-Type`, `Authorization`, `x-action`, `x-ats-password`).

---

## 5. SQL Injection & Parameter Sanitization
- Database queries use MySQL parameterized queries (`?` placeholders). Raw string concatenations inside SQL statements are forbidden.

---

## 6. Audit Logging
- System activities (Registration, Login, Resume Upload, ATS Analysis, Admin Actions, Google Drive Sync) are recorded in the `audit_logs` table.
- Sanitizer strips sensitive credentials before logging.
