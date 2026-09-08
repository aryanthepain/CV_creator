
const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require("./routers/userRoutes");
const passport = require("passport");
const cors = require("cors");
const cookieSession = require('cookie-session');
const projectRoutes = require('./routers/projectRoutes');
require('./config/passport');
const authRoutes = require('./routers/auth');
const session = require('express-session');
require('dotenv').config();

// Security: Require session secret from environment (reject placeholders and weak secrets)
const PLACEHOLDER_SECRETS = [
  'your_session_secret_here',
  'replace_with_at_least_32_chars_random_hex_secret',
  'DSAI',
];
const secret = process.env.SECRETKEY || '';
const hasLowEntropy = new Set(secret).size < 8;
if (!secret || PLACEHOLDER_SECRETS.includes(secret) || secret.length < 32 || hasLowEntropy) {
  console.error('FATAL: SECRETKEY environment variable must be set to a cryptographically secure string (at least 32 characters with sufficient entropy) and cannot be a placeholder value. Exiting.');
  process.exit(1);
}
const chatRoutes = require('./routers/chatRoutes')
const User = require('./models/userModel');
const app = express();

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use(express.json());

app.use(
  session({
    secret: process.env.SECRETKEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    },
  })
);



app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.use("/auth",authRoutes);



app.use((req, res, next) => {
  next();
});

app.use('/user', userRoutes);
app.use('/project', projectRoutes);
app.use('/chat',chatRoutes);

app.get('/search', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not Authorized' });
    }
    try {
        const query = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 50) : '';
        if (!query) {
            return res.json([]);
        }
        // Escape regex special characters to prevent ReDoS
        const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 50);
        const users = await User.find(
            { name: { $regex: safeQuery, $options: 'i' } },
            "_id name"
        ).limit(limit);
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
