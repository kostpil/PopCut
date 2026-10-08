const express = require('express');
const app = express();
const PORT = 3000;

const mongoose = require('mongoose');

const bcrypt = require('bcrypt');
const User = require('./Models/User');

const DB_URL = "mongodb+srv://harisduff_db_user:QTeAZJ3yhGQ15pJ5@cluster0.6e2kp7l.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";


mongoose.connect(DB_URL)
    .then(() => console.log("Επιτυχής σύνδεση με τη βάση MongoDB Atlas"))
    .catch((err) => console.error("Σφάλμα σύνδεσης με τη βάση:", err));

// Επιτρέπει στο Node.js να διαβάζει δεδομένα JSON από το Postman
app.use(express.json());

app.get('/api/test', (req, res) => {
    res.json({ 
        message: "Το Backend λειτουργεί!", 
        status: "Success" 
    });
});

app.post('/api/register', async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        //Έλεγχος αν συμπληρώθηκαν τα πεδία
        if (!email || !password) {
            return res.status(400).json({ error: "Παρακαλώ συμπληρώστε email και password!" });
        }

        //Έλεγχος αν το email υπάρχει ήδη στη βάση
        const userExists = await User.findOne({ email: email });
        if (userExists) {
            return res.status(400).json({ error: "Αυτό το email χρησιμοποιείται ήδη!" });
        }

        //Κρυπτογράφηση του κωδικού
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        //Αποθήκευση στη MongoDB
        const newUser = new User({
            email: email,
            password: hashedPassword
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
});

/*app.post('/api/login', (req, res) => {
    const email = req.body.email;     // input από το Postman body
    const password = req.body.password;     // input από το Postman body

    if (!email || !password) {
        return res.status(400).json({ error: "Παρακαλώ συμπληρώστε email και password!" });
    }

    res.json({ 
        message: `Ο χρήστης ${email} δημιουργήθηκε με επιτυχία στο Backend!`,
        receivedData: { email: email }
    });
});*/


app.post('/api/login', async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        if (!email || !password) {
            return res.status(400).json({ error: "Παρακαλώ συμπληρώστε email και password!" });
        }

        //Αναζήτηση του χρήστη στη βάση με βάση το email
        //(Το findOne ψάχνει στη MongoDB αν υπάρχει αυτό το email)
        const user = await User.findOne({ email: email });
        
        if (!user) {
            return res.status(401).json({ error: "Το email ή το password είναι λανθασμένα!" });
        }

        //Έλεγχος κωδικού με το bcrypt
        //Συγκρίνουμε τον απλό κωδικό από το Postman με τον κρυπτογραφημένο κωδικό από τη βάση (user.password)
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        
        //Αν ο κωδικός δεν ταιριάζει, επιστρέφει σφάλμα
        if (!isPasswordCorrect) {
            return res.status(401).json({ error: "Το email ή το password είναι λανθασμένα!" });
        }

        // 4. ΑΠΑΝΤΗΣΗ ΕΠΙΤΥΧΙΑΣ
        //Επιστροφή ενός προσωρινόυ token
        res.json({
            message: "Το Login πέτυχε! Καλώς ορίσατε.",
            userId: user._id,
            token: "fake-jwt-token-will-be-real-tomorrow" // Σύντομα θα το κάνουμε πραγματικό JWT Token
        });

    } catch (error) {
        console.error("Σφάλμα κατά το login:", error);
        res.status(500).json({ error: "Υπήρξε κάποιο πρόβλημα στον server." });
    }
});

// Εκκίνηση του server
app.listen(PORT, () => {
    console.log(`Ο server ξεκίνησε στο: http://localhost:${PORT}`);
});