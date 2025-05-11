require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('./dbConfig');

const server = express();
const PORT = process.env.PORT || 3000;

connectDB();

server.use(express.urlencoded({ extended: false}));
server.use(express.json());

//ensure we are set up to send our static file
server.use(express.static(path.join(__dirname, 'view')));

server.get('/', (req, res) => {
    //base url sends you to the welcome page
    res.sendFile(path.join(__dirname, 'view', 'index.html'));
});

//routes
server.use('/api/auth', require('./routes/api/users')); //user related routes
server.use('/api/events', require('./routes/api/events')); //event related routes
server.use('/api/bookings', require('./routes/api/bookings')); //booking related routes

//catch all for non-existent requests, using /{*splat} because it replaced * for wildcards in express 5.x
server.all('/{*splat}', (req, res) => {
    res.status(404);
    if(req.accepts('text/html')) {
        res.sendFile(path.join(__dirname, 'view', '404.html'));
    } else if(req.accepts('application/json')) {
        res.json({ "error": '404 not found'});
        return;
    } else {
        res.type('txt').send('404 Not Found'); 
    }
});

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

mongoose.connection.on('error', err => {
    console.error('MongoDB connection error after initial connect:', err);
});