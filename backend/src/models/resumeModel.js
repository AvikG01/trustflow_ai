const db = require('../database/db');
const { v4: uuidv4 } = require('uuid');

async function createResume(userId, { title, template_id = 'modern_clean', target_role = '', sections = [] }) {
  const resumeId = uuidv4();
  await db.query(
    `INSERT INTO resumes (id, user_id, title, template_id, target_role, current_version, created_at)
     VALUES (?, ?, ?, ?, ?, 1, NOW())`,
    [resumeId, userId, title, template_id, target_role]
  );

  // Save initial sections
  if (Array.isArray(sections)) {
    for (let i = 0; i < sections.length; i++) {
      const sec = sections[i];
      await db.query(
        `INSERT INTO resume_sections (id, resume_id, section_type, content_json, sort_order)
         VALUES (?, ?, ?, ?, ?)`,
        [uuidv4(), resumeId, sec.section_type, JSON.stringify(sec.content_json || {}), i]
      );
    }
  }

  // Create Version 1 snapshot
  const versionId = uuidv4();
  const refCode = `TF-${userId.substring(0, 8)}-RES-${resumeId.substring(0, 8)}-V-1`;
  await db.query(
    `INSERT INTO resume_versions (id, resume_id, version_number, reference_code, change_summary, snapshot_json, created_at)
     VALUES (?, ?, 1, ?, 'Initial Creation', ?, NOW())`,
    [versionId, resumeId, refCode, JSON.stringify({ title, template_id, target_role, sections })]
  );

  return getResumeById(resumeId, userId);
}

async function getResumesByUserId(userId) {
  return await db.query(
    `SELECT id, user_id, title, template_id, target_role, current_version, created_at, updated_at
     FROM resumes WHERE user_id = ? ORDER BY updated_at DESC`,
    [userId]
  );
}

async function getResumeById(resumeId, userId) {
  const resumes = await db.query(
    `SELECT id, user_id, title, template_id, target_role, current_version, created_at, updated_at
     FROM resumes WHERE id = ? AND user_id = ?`,
    [resumeId, userId]
  );

  if (!resumes || resumes.length === 0) return null;
  const resume = resumes[0];

  const sections = await db.query(
    `SELECT id, section_type, content_json, sort_order FROM resume_sections
     WHERE resume_id = ? ORDER BY sort_order ASC`,
    [resumeId]
  );

  resume.sections = sections.map((s) => ({
    id: s.id,
    section_type: s.section_type,
    content_json: typeof s.content_json === 'string' ? JSON.parse(s.content_json) : s.content_json,
    sort_order: s.sort_order,
  }));

  return resume;
}

async function updateResume(resumeId, userId, { title, template_id, target_role, sections, change_summary = 'Updated draft' }) {
  const existing = await getResumeById(resumeId, userId);
  if (!existing) return null;

  const newVersion = parseInt(existing.current_version || 1, 10) + 1;

  await db.query(
    `UPDATE resumes
     SET title = COALESCE(?, title),
         template_id = COALESCE(?, template_id),
         target_role = COALESCE(?, target_role),
         current_version = ?,
         updated_at = NOW()
     WHERE id = ? AND user_id = ?`,
    [title, template_id, target_role, newVersion, resumeId, userId]
  );

  // Update sections if provided
  if (Array.isArray(sections)) {
    // Clear old sections and insert updated ones
    await db.query('DELETE FROM resume_sections WHERE resume_id = ?', [resumeId]);
    for (let i = 0; i < sections.length; i++) {
      const sec = sections[i];
      await db.query(
        `INSERT INTO resume_sections (id, resume_id, section_type, content_json, sort_order)
         VALUES (?, ?, ?, ?, ?)`,
        [uuidv4(), resumeId, sec.section_type, JSON.stringify(sec.content_json || {}), i]
      );
    }
  }

  // Create new version trace
  const versionId = uuidv4();
  const refCode = `TF-${userId.substring(0, 8)}-RES-${resumeId.substring(0, 8)}-V-${newVersion}`;
  await db.query(
    `INSERT INTO resume_versions (id, resume_id, version_number, reference_code, change_summary, snapshot_json, created_at)
     VALUES (?, ?, ?, ?, ?, ?, NOW())`,
    [versionId, resumeId, newVersion, refCode, change_summary, JSON.stringify({ title: title || existing.title, template_id: template_id || existing.template_id, target_role: target_role || existing.target_role, sections: sections || existing.sections })]
  );

  return getResumeById(resumeId, userId);
}

async function getResumeVersions(resumeId, userId) {
  const existing = await getResumeById(resumeId, userId);
  if (!existing) return null;

  return await db.query(
    `SELECT id, resume_id, version_number, reference_code, change_summary, created_at
     FROM resume_versions WHERE resume_id = ? ORDER BY version_number DESC`,
    [resumeId]
  );
}

async function getResumeVersionDetail(resumeId, versionNumber, userId) {
  const existing = await getResumeById(resumeId, userId);
  if (!existing) return null;

  const versions = await db.query(
    `SELECT id, resume_id, version_number, reference_code, change_summary, snapshot_json, created_at
     FROM resume_versions WHERE resume_id = ? AND version_number = ?`,
    [resumeId, versionNumber]
  );

  if (!versions || versions.length === 0) return null;
  const ver = versions[0];
  ver.snapshot_json = typeof ver.snapshot_json === 'string' ? JSON.parse(ver.snapshot_json) : ver.snapshot_json;
  return ver;
}

async function duplicateResume(resumeId, userId) {
  const source = await getResumeById(resumeId, userId);
  if (!source) return null;

  const duplicatedTitle = `${source.title} (Copy)`;
  return await createResume(userId, {
    title: duplicatedTitle,
    template_id: source.template_id,
    target_role: source.target_role,
    sections: source.sections,
  });
}

async function deleteResume(resumeId, userId) {
  const result = await db.query('DELETE FROM resumes WHERE id = ? AND user_id = ?', [resumeId, userId]);
  return result && result.affectedRows > 0;
}

module.exports = {
  createResume,
  getResumesByUserId,
  getResumeById,
  updateResume,
  getResumeVersions,
  getResumeVersionDetail,
  duplicateResume,
  deleteResume,
};
