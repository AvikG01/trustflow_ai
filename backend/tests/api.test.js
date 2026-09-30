const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const supertest = require('supertest');
const app = require('../src/app');
const request = supertest(app);

describe('TrustFlow AI Backend End-to-End Test Suite', () => {
  let userToken = '';
  let userId = '';
  let resumeId = '';
  let analysisId = '';

  const testUser = {
    name: 'Test Engineer',
    email: `test_${Date.now()}@example.com`,
    password: 'SecurePassword123!',
  };

  test('1. User Registration (POST /post action=register)', async () => {
    const res = await request
      .post('/post')
      .send({
        action: 'register',
        name: testUser.name,
        email: testUser.email,
        password: testUser.password,
      })
      .expect(201);

    assert.equal(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.equal(res.body.data.user.email, testUser.email);
    assert.equal(res.body.data.user.account_type, 'FREE');
    assert.equal(res.body.data.user.usage.max_resumes, 2);
    assert.equal(res.body.data.user.usage.max_job_optimizations, 3);
    assert.equal(res.body.data.user.usage.max_ai_emails, 5);

    userToken = res.body.data.token;
    userId = res.body.data.user.id;
  });

  test('2. Duplicate Email Registration Rejection', async () => {
    const res = await request
      .post('/post')
      .send({
        action: 'register',
        name: testUser.name,
        email: testUser.email,
        password: testUser.password,
      })
      .expect(409);

    assert.equal(res.body.success, false);
    assert.equal(res.body.errorCode, 'DUPLICATE_USER');
  });

  test('3. User Login (POST /post action=login)', async () => {
    const res = await request
      .post('/post')
      .send({
        action: 'login',
        email: testUser.email,
        password: testUser.password,
      })
      .expect(200);

    assert.equal(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.ok(!res.body.data.user.password_hash);
  });

  test('4. Fetch Profile (GET /get action=getProfile)', async () => {
    const res = await request
      .get('/get?action=getProfile')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.email, testUser.email);
  });

  test('5. Create First Resume (POST /post action=createResume)', async () => {
    const res = await request
      .post('/post')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        action: 'createResume',
        title: 'Backend Software Architect Resume',
        template_id: 'modern_clean',
        target_role: 'Senior Node.js Developer',
        sections: [
          {
            section_type: 'personal',
            content_json: { name: testUser.name, email: testUser.email, phone: '+1234567890' },
          },
          {
            section_type: 'skills',
            content_json: ['Node.js', 'Express', 'MySQL', 'Gemini AI'],
          },
          {
            section_type: 'internships',
            content_json: [{ company: 'TechCorp', duration_months: 2 }],
          },
          {
            section_type: 'certifications',
            content_json: [{ name: 'Oracle Java Certification', issuer: 'Oracle Academy' }],
          },
        ],
      })
      .expect(201);

    assert.equal(res.body.success, true);
    assert.ok(res.body.data.resume.id);
    assert.ok(res.body.data.google_drive.referenceCode.includes('TF-'));
    resumeId = res.body.data.resume.id;
  });

  test('6. Create Second Resume (Reaching FREE Limit of 2)', async () => {
    const res = await request
      .post('/post')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        action: 'createResume',
        title: 'Full Stack Engineer Resume',
        template_id: 'executive_bold',
        target_role: 'Full Stack Lead',
        sections: [],
      })
      .expect(201);

    assert.equal(res.body.success, true);
  });

  test('7. Create Third Resume (Exceeding FREE Limit of 2 should fail)', async () => {
    const res = await request
      .post('/post')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        action: 'createResume',
        title: 'Third Exceeding Resume',
        template_id: 'technical_grid',
        sections: [],
      })
      .expect(403);

    assert.equal(res.body.success, false);
    assert.equal(res.body.errorCode, 'LIMIT_EXCEEDED');
  });

  test('8. ATS/CCS Analysis Rejection Without Admin Password', async () => {
    const res = await request
      .post('/post')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        action: 'analyzeResume',
        resume_id: resumeId,
        target_job_title: 'Senior Node.js Backend Engineer',
      })
      .expect(403);

    assert.equal(res.body.success, false);
    assert.equal(res.body.errorCode, 'ATS_PASSWORD_REQUIRED');
  });

  test('9. ATS/CCS Analysis Execution With Valid Admin Password', async () => {
    const res = await request
      .post('/post')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        action: 'analyzeResume',
        ats_password: 'TrustFlow@Admin2026#ATSCCS',
        resume_id: resumeId,
        target_job_title: 'Senior Node.js Architect',
        target_job_description: 'Looking for expert Node.js, Express, MySQL developer',
      });

    if (res.status !== 200) {
      console.log('TEST 9 FAILED WITH STATUS:', res.status, 'BODY:', res.body);
    }
    assert.equal(res.status, 200);

    try {
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.report.ats_score > 0);
      assert.equal(Boolean(res.body.data.report.is_approved), false);
      assert.equal(res.body.data.report.overall_status, 'REVIEW_REQUIRED');
    } catch (err) {
      console.log('TEST 9 ASSERTION FAIL:', err.message, 'report body:', JSON.stringify(res.body));
      throw err;
    }

    analysisId = res.body.data.report.id;
  });

  test('10. Update Resume (UPDATE /update action=updateResume)', async () => {
    const res = await request
      .post('/update') // Testing route handler for /update
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        action: 'updateResume',
        resume_id: resumeId,
        title: 'Updated Backend Software Architect Resume',
        change_summary: 'Added AWS certification',
      })
      .expect(200);

    assert.equal(res.body.success, true);
    assert.equal(res.body.data.resume.current_version, 2);
  });

  test('11. Retrieve Resume Versions (GET /get action=getResumeVersions)', async () => {
    const res = await request
      .get(`/get?action=getResumeVersions&resume_id=${resumeId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    assert.equal(res.body.success, true);
    assert.equal(res.body.data.versions.length, 2);
  });

  test('12. AI Job Search (POST /post action=searchJobs)', async () => {
    const res = await request
      .post('/post')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        action: 'searchJobs',
        target_role: 'Backend Architect',
        location: 'Remote',
        skills: ['Node.js', 'Express', 'MySQL'],
      })
      .expect(200);

    assert.equal(res.body.success, true);
    assert.ok(res.body.data.matches.length > 0);
  });

  test('13. Resume Optimization For Job (POST /post action=optimizeResumeForJob)', async () => {
    const res = await request
      .post('/post')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        action: 'optimizeResumeForJob',
        resume_id: resumeId,
        job_description: 'We need a Node.js Express developer who understands rate limiting and security',
      })
      .expect(200);

    assert.equal(res.body.success, true);
    assert.ok(res.body.data.result.optimized_resume);
  });

  test('14. AI HR Email Generation (POST /post action=generateHREmail)', async () => {
    const res = await request
      .post('/post')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        action: 'generateHREmail',
        job_title: 'Senior Backend Engineer',
        company_name: 'TechFlow Systems',
        recruiter_info: 'Jane Doe, Lead Recruiter',
        resume_id: resumeId,
      })
      .expect(200);

    assert.equal(res.body.success, true);
    assert.ok(res.body.data.email.subject);
    assert.ok(res.body.data.email.body.includes('TechFlow Systems'));
  });

  test('15. Delete Resume (DELETE /delete action=deleteResume)', async () => {
    const res = await request
      .post('/delete')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        action: 'deleteResume',
        resume_id: resumeId,
      })
      .expect(200);

    assert.equal(res.body.success, true);
  });
});
