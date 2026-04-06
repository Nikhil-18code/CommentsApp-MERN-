const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const auth = require('../middlewares/auth');

// middleware
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: "Admin only" });
  }
  next();
};

// routes
router.get('/flagged', auth, isAdmin, adminController.getFlaggedComments);
router.post('/approve/:id', auth, isAdmin, adminController.approveComment);
router.post('/reject/:id', auth, isAdmin, adminController.rejectComment);

// 🔥 VERY IMPORTANT
module.exports = router;