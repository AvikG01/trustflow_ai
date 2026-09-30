const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const logger = require('../../utils/logger');

async function parseResumeFile(filePath, originalFilename, mimeType) {
  const ext = path.extname(originalFilename).toLowerCase();
  let rawText = '';

  try {
    if (ext === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      rawText = pdfData.text || '';
    } else if (ext === '.docx') {
      const docxResult = await mammoth.extractRawText({ path: filePath });
      rawText = docxResult.value || '';
    } else if (ext === '.doc') {
      // Basic text extraction fallback for legacy .doc
      const buffer = fs.readFileSync(filePath);
      rawText = buffer.toString('utf8').replace(/[^\x20-\x7E\n\r\t]/g, ' ');
    } else {
      throw new Error(`Unsupported document extension: ${ext}`);
    }
  } finally {
    // MANDATORY REQUIREMENT (Section 9): Do not permanently retain unnecessary uploaded files on Render filesystem
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        logger.info(`Cleaned up temporary upload file: ${filePath}`);
      } catch (e) {
        logger.warn(`Failed to cleanup temp file ${filePath}: ${e.message}`);
      }
    }
  }

  return normalizeExtractedTextToSchema(rawText, originalFilename);
}

function normalizeExtractedTextToSchema(rawText, originalFilename) {
  const lines = rawText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);

  // Extract Email & Phone
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = rawText.match(/(\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/);

  const personal = {
    name: lines[0] || path.basename(originalFilename, path.extname(originalFilename)),
    email: emailMatch ? emailMatch[0] : '',
    phone: phoneMatch ? phoneMatch[0] : '',
    location: '',
  };

  const skills = [];
  const commonSkills = ['JavaScript', 'Node.js', 'Express', 'React', 'Python', 'Java', 'SQL', 'MySQL', 'MongoDB', 'AWS', 'Docker', 'Git', 'HTML', 'CSS'];
  commonSkills.forEach((skill) => {
    if (new RegExp(`\\b${skill}\\b`, 'i').test(rawText)) {
      skills.push({ name: skill, level: 'Proficient' });
    }
  });

  const summary = lines.slice(1, 4).join(' ');

  return {
    parsed_title: `Imported Resume - ${personal.name}`,
    raw_text_snippet: rawText.substring(0, 500),
    sections: [
      { section_type: 'personal', content_json: personal },
      { section_type: 'summary', content_json: { text: summary } },
      { section_type: 'skills', content_json: skills },
      { section_type: 'work_experience', content_json: [] },
      { section_type: 'education', content_json: [] },
      { section_type: 'projects', content_json: [] },
      { section_type: 'certifications', content_json: [] },
      { section_type: 'internships', content_json: [] },
    ],
  };
}

module.exports = {
  parseResumeFile,
};
