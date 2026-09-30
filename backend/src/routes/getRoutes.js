const express = require('express');
const router = express.Router();
const getController = require('../controllers/getController');
const authenticateToken = require('../middleware/authMiddleware');

router.get('/get', (req, res, next) => {
  const action = req.query.action || req.headers['x-action'];

  // Public GET action if any (e.g. getResumeTemplates)
  if (action === 'getResumeTemplates') {
    return getController.handleGet(req, res, next);
  }

  // All other GET actions require authentication
  return authenticateToken(req, res, (err) => {
    if (err) return next(err);
    getController.handleGet(req, res, next);
  });
});

module.exports = router;
