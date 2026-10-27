const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/watched/:watched_movie_id/comments', authMiddleware, commentController.createComment);

router.get('/watched/:watched_movie_id/comments', commentController.getCommentsByWatchedMovie);

module.exports = router;