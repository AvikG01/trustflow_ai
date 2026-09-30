# TrustFlow AI - AI Queue & Concurrency Protection

To protect Gemini API quotas and handle concurrent requests safely without exceeding API rate limits or triggering 429 errors under heavy load, TrustFlow AI features a dedicated **AI Queue Manager** (`src/services/queue/aiQueue.js`).

---

## 1. Concurrency Architecture

- **Controlled Concurrency Limit**: Controlled via `AI_QUEUE_CONCURRENCY` (default `2`). At any given moment, a maximum of 2 Gemini AI requests run concurrently.
- **Task Queueing**: Requests exceeding concurrency capacity are queued in memory (`QUEUED` status) and processed sequentially as running tasks finish.
- **Idempotency Protection**: Enqueueing a task with an idempotency key avoids duplicate execution if a client retries the same analysis request.

---

## 2. Exponential Backoff Retry System

If Gemini API returns a transient error or rate-limit indicator:
1. Job status switches to `RETYRING`.
2. Backoff delay is calculated: `Math.pow(2, retries) * 500ms` (1s, 2s, 4s).
3. Executes up to `maxRetries = 3`.
4. If retries exhaust, job status transitions to `FAILED` and error details are reported.

---

## 3. Job Lifecycle Statuses

- `QUEUED`: Enqueued in queue waiting for active execution slot.
- `PROCESSING`: Currently executing Gemini API call.
- `RETYRING`: Transient failure occurred; awaiting exponential backoff delay.
- `COMPLETED`: Execution succeeded; result cached and returned.
- `FAILED`: Maximum retries exhausted or non-recoverable error encountered.
