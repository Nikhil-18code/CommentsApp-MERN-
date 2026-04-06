const express = require('express');
const router = express.Router();

const commentController = require('../controllers/commentController');
const authMiddleware = require('../middlewares/auth');

//public routes
router.get('/', commentController.getComments);
router.get('/count', commentController.getCommentsCount);
router.get('/:id/replies', commentController.getReplies);

//protected routes
router.post('/', authMiddleware, commentController.createComment);
router.put('/:id', authMiddleware, commentController.updateComment);
router.delete('/:id', authMiddleware, commentController.deleteComment);
router.post('/:id/like', authMiddleware, commentController.toggleLike);

module.exports = router;