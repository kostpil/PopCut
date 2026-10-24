const ReviewComment = require('../Models/ReviewComment');

exports.createComment = async (req, res) => {
    try {
        const { comment } = req.body;
        const { watched_movie_id } = req.params;
        const commenter_id = req.user.id;

        if (!comment || comment.trim() === "") {
            return res.status(400).json({ message: "Το σχόλιο δεν μπορεί να είναι κενό." });
        }

        const newComment = new ReviewComment({
            watched_movie_id,
            commenter_id,
            comment
        });

        await newComment.save();
        await newComment.populate('commenter_id', 'username email');

        res.status(201).json({ message: "Το σχόλιο προστέθηκε με επιτυχία!", comment: newComment });
    } catch (error) {
        res.status(500).json({ message: "Σφάλμα κατά την προσθήκη του σχολίου.", error: error.message });
    }
};

exports.getCommentsByWatchedMovie = async (req, res) => {
    try {
        const { watched_movie_id } = req.params;

        const comments = await ReviewComment.find({ watched_movie_id })
            .populate('commenter_id', 'username email')
            .sort({ createdAt: 1 });

        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: "Σφάλμα κατά την ανάκτηση των σχολίων.", error: error.message });
    }
};