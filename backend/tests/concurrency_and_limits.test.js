const { test, describe, before } = require('node:test');
const assert = require('node:assert/strict');
const supertest = require('supertest');
const app = require('../src/app');
const aiQueue = require('../src/services/queue/aiQueue');
const runDbInit = require('../src/database/initDb');
const request = supertest(app);

describe('TrustFlow AI Concurrency, Admin & Usage Limits Test Suite', () => {
  let adminToken = '';
  let userToken = '';

  before(async () => {
    await runDbInit();
  });

  test('1. Admin Login & Access', async () => {
    const res = await request
      .post('/post')
      .send({
        action: 'login',
        email: 'admin@trustflow.ai',
        password: 'TrustFlow@Admin2026!',
      })
      .expect(200);

    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.role, 'ADMIN');
    adminToken = res.body.data.token;
  });

  test('2. Admin Fetch All Users (GET /get action=getAdminUsers)', async () => {
    const res = await request
      .get('/get?action=getAdminUsers')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    assert.equal(res.body.success, true);
    assert.ok(res.body.data.users.length >= 1);
  });

  test('3. Admin Fetch System Audit Logs (GET /get action=getAdminAuditLogs)', async () => {
    const res = await request
      .get('/get?action=getAdminAuditLogs')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data.logs));
  });

  test('4. Non-Admin Access Rejection on Admin Route', async () => {
    const regRes = await request.post('/post').send({
      action: 'register',
      name: 'Standard User',
      email: `standard_${Date.now()}@example.com`,
      password: 'StandardUserPass123!',
    });
    userToken = regRes.body.data.token;

    const res = await request
      .get('/get?action=getAdminUsers')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);

    assert.equal(res.body.success, false);
    assert.equal(res.body.errorCode, 'FORBIDDEN');
  });

  test('5. AI Queue Concurrency & Task Execution', async () => {
    const task1 = aiQueue.enqueueTask('Test Task 1', async () => {
      return 'Result 1';
    });
    const task2 = aiQueue.enqueueTask('Test Task 2', async () => {
      return 'Result 2';
    });

    const [res1, res2] = await Promise.all([task1, task2]);
    assert.equal(res1, 'Result 1');
    assert.equal(res2, 'Result 2');
  });

  test('6. Invalid Action Handling', async () => {
    const res = await request
      .post('/post')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ action: 'nonExistentAction' })
      .expect(400);

    assert.equal(res.body.success, false);
    assert.equal(res.body.errorCode, 'INVALID_ACTION');
  });

  test('7. Missing Action Parameter Handling', async () => {
    const res = await request
      .post('/post')
      .send({})
      .expect(400);

    assert.equal(res.body.success, false);
    assert.equal(res.body.errorCode, 'ACTION_REQUIRED');
  });
});
