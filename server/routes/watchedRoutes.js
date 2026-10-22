const express = require('express');
const router = express.Router();
const watchedController = require('../controllers/watchedController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/watched', authMiddleware, watchedController.logMovie);
router.get('/watched', authMiddleware, watchedController.getUserWatchedMovies);

module.exports = router;