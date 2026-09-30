const { google } = require('googleapis');
const env = require('../../config/env');
const logger = require('../../utils/logger');
const driveModel = require('../../models/driveModel');
const Readable = require('stream').Readable;

class GoogleDriveService {
  constructor() {
    this.clientId = env.GOOGLE.clientId;
    this.clientSecret = env.GOOGLE.clientSecret;
    this.redirectUri = env.GOOGLE.redirectUri;
    this.refreshToken = env.GOOGLE.refreshToken;

    this.oauth2Client = new google.auth.OAuth2(this.clientId, this.clientSecret, this.redirectUri);

    if (this.refreshToken) {
      this.oauth2Client.setCredentials({
        refresh_token: this.refreshToken,
        access_token: env.GOOGLE.accessToken,
      });
      this.drive = google.drive({ version: 'v3', auth: this.oauth2Client });
    } else {
      this.drive = null;
    }
  }

  /**
   * Upload Resume Document to Google Drive Resume Folder
   */
  async uploadResumeFile({ userId, resumeId, version = 1, fileBuffer, fileName, mimeType = 'application/json' }) {
    const shortUser = userId.substring(0, 8);
    const shortRes = resumeId.substring(0, 8);
    const refCode = `TF-${shortUser}-RES-${shortRes}-V-${version}`;
    const formattedFileName = `${refCode}_${fileName}`;
    const folderId = env.GOOGLE.resumeFolderId;

    let driveFileId = `MOCK-DRIVE-RESUME-${Date.now()}`;

    if (this.drive && folderId) {
      try {
        const stream = new Readable();
        stream.push(fileBuffer);
        stream.push(null);

        const response = await this.drive.files.create({
          requestBody: {
            name: formattedFileName,
            parents: [folderId],
            mimeType: mimeType,
          },
          media: {
            mimeType: mimeType,
            body: stream,
          },
          fields: 'id, name, mimeType',
        });
        driveFileId = response.data.id;
        logger.info(`Successfully uploaded Resume to Google Drive (ID: ${driveFileId}) with reference: ${refCode}`);
      } catch (err) {
        logger.warn(`Google Drive API Upload failed (${err.message}). Using local fallback reference.`);
      }
    } else {
      logger.info(`Google Drive API credentials incomplete. Generated local reference ID for resume: ${refCode}`);
    }

    await driveModel.recordDriveFile({
      userId,
      resumeId,
      fileType: 'RESUME',
      driveFileId,
      driveFolderId: folderId || 'LOCAL_FOLDER',
      fileName: formattedFileName,
      mimeType,
      version,
      referenceCode: refCode,
    });

    return {
      driveFileId,
      referenceCode: refCode,
      fileName: formattedFileName,
    };
  }

  /**
   * Upload ATS/CCS Analysis Report to Google Drive Report Folder
   */
  async uploadReportFile({ userId, resumeId, analysisId, reportData }) {
    const shortUser = userId ? userId.substring(0, 8) : 'USER';
    const shortRes = resumeId ? resumeId.substring(0, 8) : 'UPLOAD';
    const shortId = analysisId.substring(0, 8);
    const refCode = `TF-${shortUser}-RES-${shortRes}-ATSCCS-${shortId}`;
    const formattedFileName = `${refCode}_Audit_Report.json`;
    const folderId = env.GOOGLE.reportFolderId;

    const fileBuffer = Buffer.from(JSON.stringify(reportData, null, 2), 'utf-8');
    let driveFileId = `MOCK-DRIVE-REPORT-${Date.now()}`;

    if (this.drive && folderId) {
      try {
        const stream = new Readable();
        stream.push(fileBuffer);
        stream.push(null);

        const response = await this.drive.files.create({
          requestBody: {
            name: formattedFileName,
            parents: [folderId],
            mimeType: 'application/json',
          },
          media: {
            mimeType: 'application/json',
            body: stream,
          },
          fields: 'id, name, mimeType',
        });
        driveFileId = response.data.id;
        logger.info(`Successfully uploaded ATS/CCS Report to Google Drive (ID: ${driveFileId}) with reference: ${refCode}`);
      } catch (err) {
        logger.warn(`Google Drive Report Upload failed (${err.message}). Using local fallback reference.`);
      }
    } else {
      logger.info(`Google Drive credentials incomplete. Generated local reference ID for report: ${refCode}`);
    }

    await driveModel.recordDriveFile({
      userId,
      resumeId,
      analysisId,
      fileType: 'REPORT',
      driveFileId,
      driveFolderId: folderId || 'LOCAL_FOLDER',
      fileName: formattedFileName,
      mimeType: 'application/json',
      version: 1,
      referenceCode: refCode,
    });

    return {
      driveFileId,
      referenceCode: refCode,
      fileName: formattedFileName,
    };
  }
}

const googleDriveService = new GoogleDriveService();
module.exports = googleDriveService;
