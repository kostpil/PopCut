const express = require('express');
const router = express.Router();
const watchedController = require('../controllers/watchedController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/watched', authMiddleware, watchedController.logMovie);
router.get('/watched', authMiddleware, watchedController.getUserWatchedMovies);
router.get('/feed', watchedController.getAllWatchedMovies);
router.get('/watched/:id', watchedController.getWatchedMovieById);

module.exports = router;