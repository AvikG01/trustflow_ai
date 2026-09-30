const express = require('express');
const router = express.Router();
const updateController = require('../controllers/updateController');
const authenticateToken = require('../middleware/authMiddleware');

function routeUpdate(req, res, next) {
  authenticateToken(req, res, (err) => {
    if (err) return next(err);
    updateController.handleUpdate(req, res, next);
  });
}

// Support HTTP UPDATE, PUT, and POST /update for stack compatibility
router.all('/update', (req, res, next) => {
  if (['UPDATE', 'PUT', 'POST'].includes(req.method.toUpperCase())) {
    return routeUpdate(req, res, next);
  }
  return res.status(405).json({ success: false, message: 'Method Not Allowed', errorCode: 'METHOD_NOT_ALLOWED' });
});

module.exports = router;
