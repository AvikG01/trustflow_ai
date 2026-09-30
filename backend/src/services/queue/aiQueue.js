const { v4: uuidv4 } = require('uuid');
const env = require('../../config/env');
const logger = require('../../utils/logger');

class AIQueueManager {
  constructor() {
    this.queue = [];
    this.activeJobs = new Map();
    this.jobHistory = new Map();
    this.concurrencyLimit = env.AI_QUEUE_CONCURRENCY || 2;
    this.currentlyRunning = 0;
  }

  /**
   * Enqueue an AI processing task
   */
  async enqueueTask(taskName, taskFn, idempotencyKey = null) {
    // Check idempotency
    if (idempotencyKey && this.jobHistory.has(idempotencyKey)) {
      const existing = this.jobHistory.get(idempotencyKey);
      if (existing.status === 'COMPLETED') {
        logger.info(`Returning cached idempotent result for job key: ${idempotencyKey}`);
        return existing.result;
      }
      if (existing.status === 'PROCESSING' || existing.status === 'QUEUED') {
        logger.info(`Waiting for existing idempotent job key: ${idempotencyKey}`);
        return existing.promise;
      }
    }

    const jobId = idempotencyKey || uuidv4();

    let resolvePromise, rejectPromise;
    const promise = new Promise((resolve, reject) => {
      resolvePromise = resolve;
      rejectPromise = reject;
    });

    const job = {
      id: jobId,
      taskName,
      taskFn,
      status: 'QUEUED',
      retries: 0,
      maxRetries: 3,
      promise,
      resolve: resolvePromise,
      reject: rejectPromise,
      enqueuedAt: new Date(),
    };

    this.queue.push(job);
    this.jobHistory.set(jobId, job);
    logger.info(`AI Task [${taskName}] enqueued with Job ID: ${jobId}. Queue length: ${this.queue.length}`);

    this.processNext();
    return promise;
  }

  async processNext() {
    if (this.currentlyRunning >= this.concurrencyLimit || this.queue.length === 0) {
      return;
    }

    const job = this.queue.shift();
    if (!job) return;

    this.currentlyRunning++;
    job.status = 'PROCESSING';
    job.startedAt = new Date();
    this.activeJobs.set(job.id, job);

    logger.info(`Processing AI Task [${job.taskName}] (Job ID: ${job.id}). Running concurrent: ${this.currentlyRunning}`);

    this.executeWithRetry(job)
      .then((result) => {
        job.status = 'COMPLETED';
        job.result = result;
        job.completedAt = new Date();
        job.resolve(result);
      })
      .catch((err) => {
        job.status = 'FAILED';
        job.error = err.message;
        job.failedAt = new Date();
        job.reject(err);
      })
      .finally(() => {
        this.activeJobs.delete(job.id);
        this.currentlyRunning--;
        logger.info(`Finished AI Task [${job.taskName}] (Job ID: ${job.id}). Remaining queue: ${this.queue.length}`);
        this.processNext();
      });
  }

  async executeWithRetry(job) {
    while (job.retries <= job.maxRetries) {
      try {
        return await job.taskFn();
      } catch (err) {
        job.retries++;
        if (job.retries > job.maxRetries) {
          throw err;
        }

        job.status = 'RETYRING';
        const backoffMs = Math.pow(2, job.retries) * 500; // Exponential backoff: 1s, 2s, 4s
        logger.warn(`AI Job ID ${job.id} failed (${err.message}). Retrying ${job.retries}/${job.maxRetries} in ${backoffMs}ms...`);
        await new Promise((res) => setTimeout(res, backoffMs));
      }
    }
  }

  getJobStatus(jobId) {
    const job = this.jobHistory.get(jobId);
    if (!job) return null;
    return {
      id: job.id,
      taskName: job.taskName,
      status: job.status,
      retries: job.retries,
      enqueuedAt: job.enqueuedAt,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
    };
  }
}

const aiQueue = new AIQueueManager();
module.exports = aiQueue;
