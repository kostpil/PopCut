const Movie = require('../Models/Movie');

exports.populateMovies = async (req, res) => {
    try {
        const moviesList = req.body.movies;

        if (!moviesList || !Array.isArray(moviesList) || moviesList.length === 0) {
            return res.status(400).json({ error: "Παρακαλώ δώστε μια έγκυρη λίστα ταινιών." });
        }

        const insertedMovies = await Movie.insertMany(moviesList);

        res.status(201).json({
            message: "Η βάση δεδομένων ανανεώθηκε με επιτυχία.",
            count: insertedMovies.length
        });

    } catch (error) {
        console.error("Σφάλμα κατά το populate των ταινιών:", error);
        res.status(500).json({ error: "Υπήρξε πρόβλημα κατά την αποθήκευση των ταινιών." });
    }
};

exports.getMovies = async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        const movies = await Movie.find(query);
        res.json(movies);
    } catch (error) {
        res.status(500).json({ error: "Υπήρξε πρόβλημα κατά την ανάκτηση των ταινιών." });
    }
};