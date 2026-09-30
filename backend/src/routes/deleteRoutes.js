const express = require('express');
const router = express.Router();
const deleteController = require('../controllers/deleteController');
const authenticateToken = require('../middleware/authMiddleware');

function routeDelete(req, res, next) {
  authenticateToken(req, res, (err) => {
    if (err) return next(err);
    deleteController.handleDelete(req, res, next);
  });
}

// Support HTTP DELETE and POST /delete
router.all('/delete', (req, res, next) => {
  if (['DELETE', 'POST'].includes(req.method.toUpperCase())) {
    return routeDelete(req, res, next);
  }
  return res.status(405).json({ success: false, message: 'Method Not Allowed', errorCode: 'METHOD_NOT_ALLOWED' });
});

module.exports = router;
