const express = require('express');
require('dotenv').config();
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const connectDB = require('./config/database');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/auth.router');
const profileRouter = require('./routes/profile.router');
const connReqRouter = require('./routes/connectionReq.router');
const userRouter = require('./routes/user.router');
const cors = require('cors');

const PORT = process.env.APP_PORT || 3001;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const app = express();

// Enable CORS
const corsOptions = {
  origin: ['*'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
};

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

// Routes
app.use('/auth', authRouter);
app.use('/profile', profileRouter);
app.use('/connection-requests', connReqRouter);
app.use('/users', userRouter);


// Swagger setup
const options = {
  definition: {
    openapi: '3.0.0', // Set the OpenAPI version
    info: {
      title: 'Deconnect APIs', // Title for your API documentation
      version: '1.0.0',
      description: 'A simple Express REST API for demonstration',
    },
    servers: [
      {
        url: BASE_URL,
        description: 'Swagger Base URL',
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Path to the API docs (absolute - robust)
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Connect to the database and start the server
connectDB().then(() => {
    console.log('Connected to the database');
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((err) => {
    console.error('Database connection error:', err);
});