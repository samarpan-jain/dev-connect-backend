const express = require('express');
require('dotenv').config();
const connectDB = require('./config/database');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/auth.routes');
const profileRouter = require('./routes/profile.routes');

const PORT = process.env.APP_PORT || 3001;
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());
app.use('/auth', authRouter);
app.use('/profile', profileRouter);

// Connect to the database and start the server
connectDB().then(() => {
    console.log('Connected to the database');
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((err) => {
    console.error('Database connection error:', err);
});