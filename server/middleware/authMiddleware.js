const jwt = require('jsonwebtoken');
const User = require('../Models/User');

module.exports = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: "Δεν έχετε δικαίωμα πρόσβασης. Λείπει το token!" });
        }

        jwt.verify(token, "MY_SUPER_SECRET_KEY_123456789", async (err, decoded) => {
            if (err) {
                return res.status(403).json({ error: "Μη έγκυρο token." });
            }

            const user = await User.findById(decoded.id).select('-password');
            if (!user) {
                return res.status(404).json({ error: "Ο χρήστης δεν βρέθηκε." });
            }

            req.user = user;
            next();
        });

    } catch (error) {
        console.error("Σφάλμα στο auth middleware:", error);
        res.status(500).json({ error: "Πρόβλημα κατά την ταυτοποίηση του χρήστη." });
    }
};