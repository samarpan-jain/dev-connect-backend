const express = require('express');
require('dotenv').config();
const connectDB = require('./config/database');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/auth.router');
const profileRouter = require('./routes/profile.router');
const connReqRouter = require('./routes/connectionReq.router');
const userRouter = require('./routes/user.router');

const PORT = process.env.APP_PORT || 3001;
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/auth', authRouter);
app.use('/profile', profileRouter);
app.use('/connection-requests', connReqRouter);
app.use('/users', userRouter);

// Connect to the database and start the server
connectDB().then(() => {
    console.log('Connected to the database');
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((err) => {
    console.error('Database connection error:', err);
});