const express = require('express');
const router = express.Router();
const watchedController = require('../controllers/watchedController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/watched', authMiddleware, watchedController.logMovie);
router.get('/watched', authMiddleware, watchedController.getUserWatchedMovies);
router.get('/feed', watchedController.getAllWatchedMovies);
router.get('/watched/:id', watchedController.getWatchedMovieById);
router.get('/watched/user/:userId', watchedController.getUserWatchedMovies);
router.delete('/watched/:id', authMiddleware, watchedController.deleteWatchedMovie);

module.exports = router;