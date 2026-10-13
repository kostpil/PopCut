const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    director: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    genre: {
        type: [String],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    poster_url: {
        type: String,
        default: ""
    },
    runtime: {
        type: Number,
        required: true
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 10
    }
}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);