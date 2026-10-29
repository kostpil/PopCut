const WatchedMovie = require('../Models/WatchedMovie');
const ReviewComment = require('../Models/ReviewComment');

exports.logMovie = async (req, res) => {
    try {
        const { movie_id, rating, review, watchedAt } = req.body;
        const user_id = req.user.id;

        const alreadyLogged = await WatchedMovie.findOne({ user_id, movie_id });
        if (alreadyLogged) {
            return res.status(400).json({ message: "Η ταινία έχει ήδη καταχωρηθεί." });
        }

        const newLog = new WatchedMovie({
            user_id,
            movie_id,
            rating,
            review,
            watchedAt: watchedAt || Date.now()
        });

        await newLog.save();
        res.status(201).json({ message: "Η ταινία καταχωρήθηκε με επιτυχία!", log: newLog });
    } catch (error) {
        res.status(500).json({ message: "Σφάλμα κατά την καταχώρηση της ταινίας", error: error.message });
    }
};

exports.getUserWatchedMovies = async (req, res) => {
    try {
        const user_id = req.params.userId || req.user.id;

        const watchedMovies = await WatchedMovie.find({ user_id })
            .populate('movie_id', 'title year poster_url runtime')
            .sort({ createdAt: -1 });

        res.status(200).json(watchedMovies);
    } catch (error) {
        res.status(500).json({ message: "Σφάλμα κατά την ανάκτηση των ταινιών", error: error.message });
    }
};

exports.getAllWatchedMovies = async (req, res) => {
    try {
        const feed = await WatchedMovie.find()
            .populate('user_id', 'email username')
            .populate('movie_id', 'title year poster_url')
            .sort({ createdAt: -1 });

        res.status(200).json(feed);
    } catch (error) {
        res.status(500).json({ message: "Σφάλμα κατά την ανάκτηση του Community Feed", error: error.message });
    }
};

exports.getWatchedMovieById = async (req, res) => {
    try {
        const { id } = req.params;

        const watchedMovie = await WatchedMovie.findById(id)
            .populate('user_id', 'email username')
            .populate('movie_id');

        if (!watchedMovie) {
            return res.status(404).json({ message: "Η καταγραφή δεν βρέθηκε!" });
        }

        res.status(200).json(watchedMovie);
    } catch (error) {
        res.status(500).json({ message: "Σφάλμα κατά την ανάκτηση της ταινίας", error: error.message });
    }
};

exports.deleteWatchedMovie = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        const watchedMovie = await WatchedMovie.findOne({ _id: id, user_id });
        
        if (!watchedMovie) {
            return res.status(404).json({ message: "Η κριτική δεν βρέθηκε ή δεν έχετε δικαίωμα διαγραφής!" });
        }

        await ReviewComment.deleteMany({ watched_movie_id: id });
        await WatchedMovie.findByIdAndDelete(id);

        res.status(200).json({ message: "Η κριτική και όλα τα σχόλιά της διαγράφηκαν με επιτυχία." });
    } catch (error) {
        res.status(500).json({ message: "Σφάλμα κατά τη διαγραφή της κριτικής.", error: error.message });
    }
};