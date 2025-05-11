const Event = require('../models/Events');
const mongoose = require('mongoose');

/**
 * @desc    Get all events, with optional filtering by category or date
 * @route   GET /api/events
 * @route   GET /api/events?category=:category
 * @route   GET /api/events?date=:date
 * @access  Public
 */
const getAllEvents = async (req, res) => {
    try {
        const { category, date } = req.query;
        let query = {};

        if (category) {
            query.category = category;
        }

        if (date) {
            // Basic date validation, through testing of digits in the expected format
            if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                return res.status(400).json({ message: 'Invalid date format. Please use YYYY-MM-DD.' });
            }
            query.date = new Date(date); // we query by date object, since that is what MongoDB converts to anyway
            //this matches the format: YYYY-MM-DDT00:00:00.000+00:00
            //which ensures exact date searching
        }

        const events = await Event.find(query);

        if (!events.length && Object.keys(query).length > 0) {
            return res.status(404).json({ message: 'No events found matching your criteria.' });
        }
        if (!events.length) {
            return res.status(404).json({ message: 'No events found.' });
        }

        res.json(events);
    } catch (err) {
        console.error('Error fetching events:', err.message);
        res.status(500).json({ message: 'Server error while fetching events.' });
    }
};

/**
 * @desc    Get a single event by ID
 * @route   GET /api/events/:id
 * @access  Public
 */
const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found.' });
        }
        res.json(event);
    } catch (err) {
        console.error(`Error fetching event with ID ${req.params.id}:`, err.message);
        if (err.kind === 'ObjectId') { // Handle invalid MongoDB ObjectId format
            return res.status(400).json({ message: 'Invalid event ID format.' });
        }
        res.status(500).json({ message: 'Server error while fetching event.' });
    }
};

/**
 * @desc    Create a new event
 * @route   POST /api/events
 * @access  Private (Admin only)
 */
const createEvent = async (req, res) => {
    const { title, description, category, venue, date, time, seatCapacity, price } = req.body;

    // Basic validation
    if (!title || !date || !seatCapacity || price === undefined) {
        return res.status(400).json({ message: 'Title, date, seat capacity, and price are required.' });
    }

    try {
        const newEvent = new Event({
            title,
            description,
            category,
            venue,
            date,
            time,
            seatCapacity,
            price,
            // bookedSeats will default to 0
        });
        //save and confirm
        const savedEvent = await newEvent.save();
        res.status(201).json({ message: 'Event created successfully', event: savedEvent });
    } catch (err) {
        console.error('Error creating event:', err.message);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation error', errors: err.errors });
        }
        res.status(500).json({ message: 'Server error while creating event.' });
    }
};

/**
 * @desc    Update an event
 * @route   PUT /api/events/:id
 * @access  Private (Admin only)
 */
const updateEvent = async (req, res) => {
    const { id } = req.params; // Get ID from URL parameters
    const updates = req.body; // Get all potential updates from the body

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({message: `Invalid event ID format: ${id}`});
    }

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: 'No update data provided.' });
    }

    try {
        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({ message: `No event matches ID ${id}` });
        }

        // Apply updates selectively with validation
        if (updates.title !== undefined) event.title = updates.title;
        if (updates.description !== undefined) event.description = updates.description;
        if (updates.category !== undefined) event.category = updates.category;
        if (updates.venue !== undefined) event.venue = updates.venue;
        if (updates.date !== undefined) event.date = updates.date;
        if (updates.time !== undefined) event.time = updates.time;
        if (updates.price !== undefined) event.price = updates.price;

        // Handle seatCapacity update
        if (updates.seatCapacity !== undefined) {
            const newSeatCapacity = Number(updates.seatCapacity);
            //  Ensure newSeatCapacity is a number and greater than 0
            if (isNaN(newSeatCapacity) || newSeatCapacity < 0) {
                return res.status(400).json({ message: 'Invalid seat capacity value.' });
            }
            // Ensure newSeatCapacity is not less than the number of currently bookedSeats.
            if (newSeatCapacity < event.bookedSeats) {
                return res.status(400).json({
                    message: `New seat capacity (${newSeatCapacity}) cannot be less than currently booked seats (${event.bookedSeats}).`
                });
            }
            event.seatCapacity = newSeatCapacity;
        }
        // Handle bookedSeats
        if (updates.bookedSeats !== undefined) {

            const newBookedSeats = Number(updates.bookedSeats);
            // Ensure newBookSeats is negative or not a number
            if (isNaN(newBookedSeats) || newBookedSeats < 0) { 
                return res.status(400).json({ message: 'Invalid booked seats value.' });
            }
            // Ensure newBookedSeats does not exceed the event's (potentially updated) seatCapacity
            if (newBookedSeats > event.seatCapacity) {
                return res.status(400).json({
                    message: `Booked seats (${newBookedSeats}) cannot exceed seat capacity (${event.seatCapacity}).`
                });
            }
            event.bookedSeats = newBookedSeats;
        }
        //save and confirm
        const updatedEvent = await event.save();
        res.json({ message: 'Event updated successfully', event: updatedEvent });

    } catch (err) {
        console.error(`Error updating event ${id}:`, err.message);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation error', errors: err.errors });
        }
        res.status(500).json({ message: 'Server error while updating event.' });
    }
};

/**
 * @desc    Delete an event
 * @route   DELETE /api/events/:id
 * @access  Private (Admin only)
 */
const deleteEvent = async (req, res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({message: `Invalid Event ID format: ${id}`});
    }
    try {
        const event = await Event.findById(id).exec();
        if(!event){
            return res.status(404).json({ message: `No event matches ID ${id}` });
        }
        if(event.bookedSeats > 0){ // account for events that have booked seats.
            return res.status(400).json({ message: 'Cannot delete an event with existing bookings.'});
        }
        const result = await event.deleteOne({ _id: id });
        res.json({ message: 'Event deleted', result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
};