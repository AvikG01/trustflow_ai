const db = require('../database/db');
const { v4: uuidv4 } = require('uuid');

async function createAnalysis({ userId, resumeId, targetJobTitle, targetJobDescription, atsScore, ccsScore, overallStatus, isApproved, parameters = [], rawAnalysis = {} }) {
  const analysisId = uuidv4();
  const shortUser = userId ? userId.substring(0, 8) : 'USER';
  const shortRes = resumeId ? resumeId.substring(0, 8) : 'UPLOAD';
  const shortId = analysisId.substring(0, 8);
  const refCode = `TF-${shortUser}-RES-${shortRes}-ATSCCS-${shortId}`;

  await db.query(
    `INSERT INTO resume_analysis
     (id, user_id, resume_id, reference_code, target_job_title, target_job_description, ats_score, ccs_score, overall_status, is_approved, raw_analysis_json, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [analysisId, userId, resumeId || null, refCode, targetJobTitle || '', targetJobDescription || '', atsScore, ccsScore, overallStatus, isApproved ? 1 : 0, JSON.stringify(rawAnalysis)]
  );

  if (Array.isArray(parameters)) {
    for (const param of parameters) {
      await db.query(
        `INSERT INTO resume_analysis_parameters
         (id, analysis_id, category, parameter_name, score, severity, current_value, problem, why_it_matters, recommended_action)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          analysisId,
          param.category || 'ATS',
          param.parameter_name || 'General',
          param.score || 0,
          (() => {
            const valid = ['CRITICAL', 'MAJOR', 'MINOR', 'NONE'];
            let s = String(param.severity || 'NONE').toUpperCase();
            if (s === 'HIGH') s = 'CRITICAL';
            if (s === 'MODERATE' || s === 'MEDIUM') s = 'MAJOR';
            if (s === 'LOW') s = 'MINOR';
            return valid.includes(s) ? s : 'NONE';
          })(),
          param.current_value || '',
          param.problem || '',
          param.why_it_matters || '',
          param.recommended_action || '',
        ]
      );
    }
  }

  return getAnalysisById(analysisId, userId);
}

async function getAnalysisById(analysisId, userId) {
  let sql = 'SELECT * FROM resume_analysis WHERE id = ?';
  const params = [analysisId];
  if (userId) {
    sql += ' AND user_id = ?';
    params.push(userId);
  }

  const rows = await db.query(sql, params);
  if (!rows || rows.length === 0) return null;

  const analysis = rows[0];
  const parameterRows = await db.query('SELECT * FROM resume_analysis_parameters WHERE analysis_id = ?', [analysisId]);

  analysis.ats_score = parseFloat(analysis.ats_score || 0);
  analysis.ccs_score = parseFloat(analysis.ccs_score || 0);
  analysis.is_approved = Boolean(analysis.is_approved);
  analysis.parameters = parameterRows || [];
  if (typeof analysis.raw_analysis_json === 'string') {
    try {
      analysis.raw_analysis_json = JSON.parse(analysis.raw_analysis_json);
    } catch (e) {}
  }
  return analysis;
}

async function getAnalysisHistoryByUserId(userId) {
  return await db.query(
    `SELECT id, user_id, resume_id, reference_code, target_job_title, ats_score, ccs_score, overall_status, is_approved, created_at
     FROM resume_analysis WHERE user_id = ? ORDER BY created_at DESC`,
    [userId]
  );
}

async function deleteAnalysis(analysisId, userId) {
  const result = await db.query('DELETE FROM resume_analysis WHERE id = ? AND user_id = ?', [analysisId, userId]);
  return result && result.affectedRows > 0;
}

module.exports = {
  createAnalysis,
  getAnalysisById,
  getAnalysisHistoryByUserId,
  deleteAnalysis,
};
