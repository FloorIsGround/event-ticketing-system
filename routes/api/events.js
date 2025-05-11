const express = require('express');
const router = express.Router();

const { auth, adminCheck } = require('../../middleware/auth');
const { getAllEvents, createEvent, getEventById, updateEvent, deleteEvent } = require('../../controllers/eventController');

router.route('/')
.get(getAllEvents) //GET /api/events?category=:category?date=:date
.post(auth, adminCheck, createEvent); // POST /api/events - requires admin

router.route('/:id')
.get(getEventById) //GET /api/events/:id
.put(auth, adminCheck, updateEvent) //PUT /api/events/:id - requires admin
.delete(auth, adminCheck, deleteEvent); //DELETE /api/events/:id - requires admin

module.exports = router;