const db = require('../database/db');
const { v4: uuidv4 } = require('uuid');

async function recordDriveFile({ userId, resumeId = null, analysisId = null, fileType, driveFileId, driveFolderId, fileName, mimeType, version = 1, referenceCode }) {
  const id = uuidv4();
  await db.query(
    `INSERT INTO google_drive_files
     (id, user_id, resume_id, analysis_id, file_type, drive_file_id, drive_folder_id, file_name, mime_type, version, reference_code, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [id, userId, resumeId, analysisId, fileType, driveFileId, driveFolderId, fileName, mimeType, version, referenceCode]
  );
  return id;
}

async function getDriveFilesByUserId(userId) {
  return await db.query(
    `SELECT id, user_id, resume_id, analysis_id, file_type, drive_file_id, drive_folder_id, file_name, mime_type, version, reference_code, created_at
     FROM google_drive_files WHERE user_id = ? ORDER BY created_at DESC`,
    [userId]
  );
}

async function getDriveFileById(id, userId) {
  const rows = await db.query(
    `SELECT id, user_id, resume_id, analysis_id, file_type, drive_file_id, drive_folder_id, file_name, mime_type, version, reference_code, created_at
     FROM google_drive_files WHERE id = ? AND user_id = ? LIMIT 1`,
    [id, userId]
  );
  return rows[0] || null;
}

async function getDriveFileByResumeId(resumeId, userId) {
  const rows = await db.query(
    `SELECT id, user_id, resume_id, analysis_id, file_type, drive_file_id, drive_folder_id, file_name, mime_type, version, reference_code, created_at
     FROM google_drive_files WHERE resume_id = ? AND user_id = ? AND file_type = 'RESUME' ORDER BY version DESC, created_at DESC LIMIT 1`,
    [resumeId, userId]
  );
  return rows[0] || null;
}

module.exports = {
  recordDriveFile,
  getDriveFilesByUserId,
  getDriveFileById,
  getDriveFileByResumeId,
};
