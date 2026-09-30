const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authenticateToken = require('../middleware/authMiddleware');
const { handleUploadSingle } = require('../middleware/uploadMiddleware');

// Handle optional file upload for uploadResume action or multipart requests
router.post('/post', (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    return handleUploadSingle('file')(req, res, (err) => {
      if (err) return next(err);
      processPostWithAuth(req, res, next);
    });
  }
  processPostWithAuth(req, res, next);
});

function processPostWithAuth(req, res, next) {
  const action = req.body?.action || req.query?.action || req.headers['x-action'];

  // If action is missing or public, let postController handle it directly
  if (!action || action === 'register' || action === 'login') {
    return postController.handlePost(req, res, next);
  }

  // Protected actions require JWT authentication
  return authenticateToken(req, res, (err) => {
    if (err) return next(err);
    postController.handlePost(req, res, next);
  });
}

module.exports = router;
