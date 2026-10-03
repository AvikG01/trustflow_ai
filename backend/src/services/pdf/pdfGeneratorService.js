const PDFDocument = require('pdfkit');

/**
 * PDF Generator Service for TrustFlow AI
 * Generates deterministic A4 (595.28 x 841.89 pt) PDF buffers for all resume templates.
 */
class PDFGeneratorService {
  /**
   * Main entry point for PDF generation
   * @param {Object} resume Canonical resume object
   * @param {string} templateId Template key ('modern_clean', 'executive_impact', 'creative_minimalist' or 'template1'/'template2'/'template3')
   * @returns {Promise<Buffer>} PDF file buffer
   */
  async generateResumePDF(resume, templateId = 'modern_clean') {
    if (!resume) {
      throw new Error('Resume data is required for PDF generation');
    }

    const normTemplate = (templateId || resume.template || 'modern_clean').toLowerCase();

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 36,
          compress: false,
          bufferPages: true,
          info: {
            Title: `${resume.personalInfo?.fullName || 'Resume'} - TrustFlow AI`,
            Author: resume.personalInfo?.fullName || 'TrustFlow AI User',
            Subject: 'Professional Resume',
            Creator: 'TrustFlow AI Resume Platform',
          },
        });

        const buffers = [];
        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          this.validatePDFBuffer(pdfBuffer, resume);
          resolve(pdfBuffer);
        });
        doc.on('error', (err) => reject(err));

        if (normTemplate.includes('executive') || normTemplate === 'template2') {
          this.renderExecutiveTemplate(doc, resume);
        } else if (normTemplate.includes('creative') || normTemplate.includes('minimal') || normTemplate === 'template3') {
          this.renderCreativeTemplate(doc, resume);
        } else {
          this.renderModernTemplate(doc, resume);
        }

        doc.end();
      } catch (err) {
        reject(new Error(`PDF Generation failed: ${err.message}`));
      }
    });
  }

  /**
   * Verify PDF buffer integrity and basic content presence
   */
  validatePDFBuffer(buffer, resume) {
    if (!buffer || buffer.length === 0) {
      throw new Error('PDF_GENERATION_FAILED: Generated PDF buffer is empty.');
    }

    const header = buffer.toString('utf-8', 0, 5);
    if (header !== '%PDF-') {
      throw new Error('PDF_GENERATION_FAILED: Invalid PDF file signature header.');
    }

    // Basic content validation: buffer must be larger than minimal PDF skeleton (1KB)
    if (buffer.length < 1000) {
      throw new Error('PDF_CONTENT_VALIDATION_FAILED: PDF buffer size is abnormally small.');
    }
  }

  /**
   * Template 1: Modern Clean
   */
  renderModernTemplate(doc, resume) {
    const primaryColor = '#0891b2'; // Cyan-600
    const darkColor = '#0f172a';    // Slate-900
    const textColor = '#334155';    // Slate-700
    const lightBg = '#f8fafc';

    const personal = resume.personalInfo || {};

    // Header
    doc.fillColor(darkColor).fontSize(22).font('Helvetica-Bold').text(personal.fullName || 'UNNAMED CANDIDATE', { align: 'left' });

    if (resume.targetRole) {
      doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold').text(personal.targetRole || resume.targetRole, { align: 'left' });
    }

    // Contact line
    const contacts = [
      personal.email,
      personal.phone,
      personal.location,
      personal.linkedin,
      personal.github,
      personal.portfolio,
    ].filter(Boolean);

    doc.moveDown(0.3);
    doc.fillColor(textColor).fontSize(9).font('Helvetica').text(contacts.join('  •  '), { align: 'left' });

    // Divider Line
    doc.moveDown(0.5);
    doc.strokeColor(primaryColor).lineWidth(1.5).moveTo(36, doc.y).lineTo(559.28, doc.y).stroke();
    doc.moveDown(0.8);

    // Summary Section
    if (resume.summary) {
      this.renderSectionHeader(doc, 'PROFESSIONAL SUMMARY', primaryColor);
      doc.fillColor(textColor).fontSize(9.5).font('Helvetica').text(resume.summary, { align: 'justify', lineGap: 2 });
      doc.moveDown(0.8);
    }

    // Skills Section
    const skills = Array.isArray(resume.skills) ? resume.skills : [];
    if (skills.length > 0) {
      this.renderSectionHeader(doc, 'TECHNICAL & PROFESSIONAL SKILLS', primaryColor);
      const skillText = skills.map((s) => (typeof s === 'string' ? s : s.name || s.skill)).filter(Boolean).join('  •  ');
      doc.fillColor(textColor).fontSize(9.5).font('Helvetica').text(skillText, { lineGap: 3 });
      doc.moveDown(0.8);
    }

    // Experience Section
    const experiences = Array.isArray(resume.experience) ? resume.experience : [];
    if (experiences.length > 0) {
      this.renderSectionHeader(doc, 'WORK EXPERIENCE', primaryColor);
      experiences.forEach((exp) => {
        this.renderExperienceItem(doc, exp, primaryColor, darkColor, textColor);
      });
    }

    // Internships Section
    const internships = Array.isArray(resume.internships) ? resume.internships : [];
    if (internships.length > 0) {
      this.renderSectionHeader(doc, 'INTERNSHIPS', primaryColor);
      internships.forEach((item) => {
        this.renderExperienceItem(doc, item, primaryColor, darkColor, textColor);
      });
    }

    // Projects Section
    const projects = Array.isArray(resume.projects) ? resume.projects : [];
    if (projects.length > 0) {
      this.renderSectionHeader(doc, 'KEY PROJECTS', primaryColor);
      projects.forEach((proj) => {
        doc.fillColor(darkColor).fontSize(10.5).font('Helvetica-Bold').text(proj.title || proj.name || 'Project');
        if (proj.technologies || proj.techStack) {
          const techStr = Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies || proj.techStack;
          doc.fillColor(primaryColor).fontSize(8.5).font('Helvetica-Oblique').text(`Technologies: ${techStr}`);
        }
        if (proj.description) {
          doc.fillColor(textColor).fontSize(9).font('Helvetica').text(proj.description, { lineGap: 2 });
        }
        doc.moveDown(0.5);
      });
    }

    // Education Section
    const education = Array.isArray(resume.education) ? resume.education : [];
    if (education.length > 0) {
      this.renderSectionHeader(doc, 'EDUCATION', primaryColor);
      education.forEach((edu) => {
        const degreeField = [edu.degree, edu.fieldOfStudy || edu.field].filter(Boolean).join(' in ');
        doc.fillColor(darkColor).fontSize(10).font('Helvetica-Bold').text(degreeField || 'Degree');
        const instYear = [edu.institution || edu.school, edu.graduationYear || edu.year || edu.dates].filter(Boolean).join('  |  ');
        doc.fillColor(textColor).fontSize(9).font('Helvetica').text(instYear);
        doc.moveDown(0.4);
      });
    }

    // Certifications Section
    const certs = Array.isArray(resume.certifications) ? resume.certifications : [];
    if (certs.length > 0) {
      this.renderSectionHeader(doc, 'CERTIFICATIONS', primaryColor);
      certs.forEach((cert) => {
        const certName = typeof cert === 'string' ? cert : cert.name || cert.title;
        const certMeta = typeof cert === 'object' ? [cert.issuer, cert.date].filter(Boolean).join(' - ') : '';
        doc.fillColor(darkColor).fontSize(9.5).font('Helvetica-Bold').text(certName, { continued: !!certMeta });
        if (certMeta) {
          doc.fillColor(textColor).font('Helvetica').text(` (${certMeta})`);
        } else {
          doc.text('');
        }
      });
    }
  }

  /**
   * Template 2: Executive Impact
   */
  renderExecutiveTemplate(doc, resume) {
    const primaryColor = '#1e293b'; // Slate-800
    const accentColor = '#0284c7';  // Light blue
    const darkColor = '#020617';
    const textColor = '#334155';

    const personal = resume.personalInfo || {};

    // Header Background Block
    doc.rect(36, 36, 523.28, 64).fill('#0f172a');

    // Name & Title in Header Block
    doc.fillColor('#ffffff').fontSize(20).font('Helvetica-Bold').text(personal.fullName || 'UNNAMED CANDIDATE', 48, 48);
    const subTitle = [personal.targetRole || resume.targetRole, personal.location].filter(Boolean).join('  •  ');
    doc.fillColor('#94a3b8').fontSize(9.5).font('Helvetica').text(subTitle, 48, 74);

    doc.y = 112;

    // Contact Line
    const contacts = [personal.email, personal.phone, personal.linkedin, personal.github, personal.portfolio].filter(Boolean);
    doc.fillColor(textColor).fontSize(8.5).font('Helvetica').text(contacts.join('  |  '), 36, doc.y, { align: 'center' });
    doc.moveDown(0.8);

    doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(36, doc.y).lineTo(559.28, doc.y).stroke();
    doc.moveDown(0.8);

    // Render Body Sections
    if (resume.summary) {
      this.renderSectionHeader(doc, 'EXECUTIVE SUMMARY', primaryColor);
      doc.fillColor(textColor).fontSize(9.5).font('Helvetica').text(resume.summary, { align: 'justify', lineGap: 2 });
      doc.moveDown(0.8);
    }

    const skills = Array.isArray(resume.skills) ? resume.skills : [];
    if (skills.length > 0) {
      this.renderSectionHeader(doc, 'CORE COMPETENCIES & SKILLS', primaryColor);
      const skillText = skills.map((s) => (typeof s === 'string' ? s : s.name || s.skill)).filter(Boolean).join('  •  ');
      doc.fillColor(textColor).fontSize(9.5).font('Helvetica').text(skillText, { lineGap: 3 });
      doc.moveDown(0.8);
    }

    const experiences = Array.isArray(resume.experience) ? resume.experience : [];
    if (experiences.length > 0) {
      this.renderSectionHeader(doc, 'PROFESSIONAL EXPERIENCE', primaryColor);
      experiences.forEach((exp) => {
        this.renderExperienceItem(doc, exp, accentColor, darkColor, textColor);
      });
    }

    const education = Array.isArray(resume.education) ? resume.education : [];
    if (education.length > 0) {
      this.renderSectionHeader(doc, 'EDUCATION & CREDENTIALS', primaryColor);
      education.forEach((edu) => {
        const degreeField = [edu.degree, edu.fieldOfStudy || edu.field].filter(Boolean).join(' in ');
        doc.fillColor(darkColor).fontSize(10).font('Helvetica-Bold').text(degreeField || 'Degree');
        const instYear = [edu.institution || edu.school, edu.graduationYear || edu.year].filter(Boolean).join('  |  ');
        doc.fillColor(textColor).fontSize(9).font('Helvetica').text(instYear);
        doc.moveDown(0.4);
      });
    }

    const projects = Array.isArray(resume.projects) ? resume.projects : [];
    if (projects.length > 0) {
      this.renderSectionHeader(doc, 'LEADERSHIP & INITIATIVES', primaryColor);
      projects.forEach((proj) => {
        doc.fillColor(darkColor).fontSize(10).font('Helvetica-Bold').text(proj.title || proj.name || 'Project');
        if (proj.description) {
          doc.fillColor(textColor).fontSize(9).font('Helvetica').text(proj.description, { lineGap: 2 });
        }
        doc.moveDown(0.4);
      });
    }

    const certs = Array.isArray(resume.certifications) ? resume.certifications : [];
    if (certs.length > 0) {
      this.renderSectionHeader(doc, 'CERTIFICATIONS & LICENSES', primaryColor);
      certs.forEach((cert) => {
        const certName = typeof cert === 'string' ? cert : cert.name || cert.title;
        const certMeta = typeof cert === 'object' ? [cert.issuer, cert.date].filter(Boolean).join(' - ') : '';
        doc.fillColor(darkColor).fontSize(9.5).font('Helvetica-Bold').text(certName, { continued: !!certMeta });
        if (certMeta) {
          doc.fillColor(textColor).font('Helvetica').text(` (${certMeta})`);
        } else {
          doc.text('');
        }
      });
    }
  }

  /**
   * Template 3: Creative Minimalist
   */
  renderCreativeTemplate(doc, resume) {
    const primaryColor = '#475569'; // Slate-600
    const darkColor = '#1e293b';
    const textColor = '#334155';

    const personal = resume.personalInfo || {};

    doc.fillColor(darkColor).fontSize(24).font('Helvetica-Bold').text(personal.fullName || 'UNNAMED CANDIDATE', { align: 'center' });
    if (personal.targetRole || resume.targetRole) {
      doc.fillColor(primaryColor).fontSize(11).font('Helvetica').text(personal.targetRole || resume.targetRole, { align: 'center' });
    }

    const contacts = [personal.email, personal.phone, personal.location, personal.linkedin, personal.portfolio].filter(Boolean);
    doc.moveDown(0.4);
    doc.fillColor(textColor).fontSize(8.5).font('Helvetica').text(contacts.join('  •  '), { align: 'center' });

    doc.moveDown(0.6);
    doc.strokeColor('#e2e8f0').lineWidth(0.8).moveTo(100, doc.y).lineTo(495.28, doc.y).stroke();
    doc.moveDown(0.8);

    if (resume.summary) {
      this.renderSectionHeader(doc, 'About', primaryColor);
      doc.fillColor(textColor).fontSize(9.5).font('Helvetica').text(resume.summary, { align: 'justify', lineGap: 2 });
      doc.moveDown(0.8);
    }

    const skills = Array.isArray(resume.skills) ? resume.skills : [];
    if (skills.length > 0) {
      this.renderSectionHeader(doc, 'Skills', primaryColor);
      const skillText = skills.map((s) => (typeof s === 'string' ? s : s.name || s.skill)).filter(Boolean).join('  •  ');
      doc.fillColor(textColor).fontSize(9.5).font('Helvetica').text(skillText, { lineGap: 3 });
      doc.moveDown(0.8);
    }

    const experiences = Array.isArray(resume.experience) ? resume.experience : [];
    if (experiences.length > 0) {
      this.renderSectionHeader(doc, 'Experience', primaryColor);
      experiences.forEach((exp) => {
        this.renderExperienceItem(doc, exp, primaryColor, darkColor, textColor);
      });
    }

    const education = Array.isArray(resume.education) ? resume.education : [];
    if (education.length > 0) {
      this.renderSectionHeader(doc, 'Education', primaryColor);
      education.forEach((edu) => {
        const degreeField = [edu.degree, edu.fieldOfStudy || edu.field].filter(Boolean).join(' in ');
        doc.fillColor(darkColor).fontSize(10).font('Helvetica-Bold').text(degreeField || 'Degree');
        const instYear = [edu.institution || edu.school, edu.graduationYear || edu.year].filter(Boolean).join('  |  ');
        doc.fillColor(textColor).fontSize(9).font('Helvetica').text(instYear);
        doc.moveDown(0.4);
      });
    }

    const projects = Array.isArray(resume.projects) ? resume.projects : [];
    if (projects.length > 0) {
      this.renderSectionHeader(doc, 'Projects', primaryColor);
      projects.forEach((proj) => {
        doc.fillColor(darkColor).fontSize(10).font('Helvetica-Bold').text(proj.title || proj.name || 'Project');
        if (proj.description) {
          doc.fillColor(textColor).fontSize(9).font('Helvetica').text(proj.description, { lineGap: 2 });
        }
        doc.moveDown(0.4);
      });
    }

    const certs = Array.isArray(resume.certifications) ? resume.certifications : [];
    if (certs.length > 0) {
      this.renderSectionHeader(doc, 'Certifications', primaryColor);
      certs.forEach((cert) => {
        const certName = typeof cert === 'string' ? cert : cert.name || cert.title;
        const certMeta = typeof cert === 'object' ? [cert.issuer, cert.date].filter(Boolean).join(' - ') : '';
        doc.fillColor(darkColor).fontSize(9.5).font('Helvetica-Bold').text(certName, { continued: !!certMeta });
        if (certMeta) {
          doc.fillColor(textColor).font('Helvetica').text(` (${certMeta})`);
        } else {
          doc.text('');
        }
      });
    }
  }

  /**
   * Section Header Helper
   */
  renderSectionHeader(doc, title, color) {
    doc.fillColor(color).fontSize(11).font('Helvetica-Bold').text(title.toUpperCase());
    doc.moveDown(0.2);
  }

  /**
   * Experience Item Helper
   */
  renderExperienceItem(doc, exp, accentColor, darkColor, textColor) {
    const title = exp.position || exp.title || exp.role || 'Position';
    const company = exp.company || exp.employer || exp.organization || 'Company';
    const dates = [exp.startDate, exp.endDate || exp.current ? 'Present' : ''].filter(Boolean).join(' - ') || exp.duration || exp.dates || '';
    const loc = exp.location || '';

    doc.fillColor(darkColor).fontSize(10.5).font('Helvetica-Bold').text(title, { continued: true });
    doc.fillColor(accentColor).font('Helvetica').text(`  |  ${company}`);

    const dateLoc = [dates, loc].filter(Boolean).join('  •  ');
    if (dateLoc) {
      doc.fillColor('#64748b').fontSize(8.5).font('Helvetica-Oblique').text(dateLoc);
    }

    if (exp.description) {
      doc.fillColor(textColor).fontSize(9).font('Helvetica').text(exp.description, { lineGap: 2 });
    }

    if (Array.isArray(exp.bulletPoints || exp.bullets || exp.highlights)) {
      const bullets = exp.bulletPoints || exp.bullets || exp.highlights;
      bullets.forEach((bullet) => {
        doc.fillColor(textColor).fontSize(9).font('Helvetica').text(`•  ${bullet}`, { indent: 10, lineGap: 1.5 });
      });
    }

    doc.moveDown(0.6);
  }
}

const pdfGeneratorService = new PDFGeneratorService();
module.exports = pdfGeneratorService;
