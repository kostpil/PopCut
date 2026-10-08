const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = 3000;

// Allows Node.js to read JSON data from Postman
app.use(express.json());

const DB_URL = "mongodb+srv://harisduff_db_user:QTeAZJ3yhGQ15pJ5@cluster0.6e2kp7l.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(DB_URL)
    .then(() => console.log("Η σύνδεση με τη MongoDB Atlas πέτυχε!"))
    .catch((err) => console.error("Σφάλμα σύνδεσης με τη βάση:", err));

app.use('/api', authRoutes);

app.listen(PORT, () => {
    console.log(`Ο server ξεκίνησε στο: http://localhost:${PORT}`);
});