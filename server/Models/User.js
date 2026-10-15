const mongoose = require('mongoose');       // Σύνδεση με βάση δεδομένων mongoDB

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: false
    }
}, {
    timestamps: true // createdAt και updatedAt
    }
);

// Εξαγωγή του User για χρήση στο server.js
module.exports = mongoose.model('User', UserSchema);