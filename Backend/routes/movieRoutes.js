const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');

router.post('/movies/populate', movieController.populateMovies);

module.exports = router;