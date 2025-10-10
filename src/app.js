const express = require('express');
require('dotenv').config();

const PORT = process.env.APP_PORT || 3000;
const app = express();

app.use('/', (req, res) => {
    res.send('Hello from the server!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});