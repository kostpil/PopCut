const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../Models/User'); // (..) -> Search for "Models/User" outside "controller"

exports.register = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        if (!email || !password) {
            return res.status(400).json({ error: "Παρακαλώ συμπληρώστε email και password!" });
        }

        const userExists = await User.findOne({ email: email });
        if (userExists) {
            return res.status(400).json({ error: "Αυτό το email χρησιμοποιείται ήδη!" });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({ 
            email: email, 
            password: hashedPassword,
            age: req.body.age || null
        });

        await newUser.save();

        res.status(201).json({ 
            message: "Ο χρήστης δημιουργήθηκε με επιτυχία!",
            userId: newUser._id
        });
    } catch (error) {
        console.error("Σφάλμα κατά το register:", error);
        res.status(500).json({ error: "Υπήρξε κάποιο πρόβλημα στον server." });
    }
};

exports.login = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        if (!email || !password) {
            return res.status(400).json({ error: "Παρακαλώ συμπληρώστε email και password!" });
        }

        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(401).json({ error: "Το email ή το password είναι λανθασμένα!" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ error: "Το email ή το password είναι λανθασμένα!" });
        }

        const token = jwt.sign(
            { id: user._id },
            "MY_SUPER_SECRET_KEY_123456789",
            { expiresIn: '1d' }                 // Expire in 1 day for safety reasons
        );

        res.json({
            message: "Το Login πέτυχε! Καλώς ορίσατε.",
            userId: user._id,
            token: token
        });
    } catch (error) {
        console.error("Σφάλμα κατά το login:", error);
        res.status(500).json({ error: "Υπήρξε κάποιο πρόβλημα στον server." });
    }
};

exports.getProfile = async (req, res) => {
    try {
        res.json(req.user);
    } catch (error) {
        console.error("Σφάλμα κατά την ανάκτηση του προφίλ:", error);
        res.status(500).json({ error: "Υπήρξε πρόβλημα στον server." });
    }
};