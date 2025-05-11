// will be trying out JSDoc format for all controller functions
const Booking = require('../models/Booking');
const mongoose = require('mongoose');
const Event = require('../models/Events');
/** 
 * @desc    Get all bookings.
 *          - If the user is an admin, they can retrieve all bookings and optionally filter by user ID and/or event ID.
 *          - If the user is not an admin, they can only retrieve their own bookings, optionally filtered by event ID.
 * @route   GET /api/bookings
 * @route   GET /api/bookings?user=:userId&event=:eventId (Admin only for 'user' filter)
 * @access  Private (Requires authentication)
 */
const getAllBookings = async (req, res) => {
    try {
        const { user: queryUser, event: queryEvent} = req.query;
        let query = {};

        // checks for valid ObjectId's for given queries if they exist
        if (queryUser && !mongoose.Types.ObjectId.isValid(queryUser)) {
            return res.status(400).json({message: `Invalid user ID format: ${queryUser}`});
        }
        if (queryEvent && !mongoose.Types.ObjectId.isValid(queryEvent)) {
            return res.status(400).json({message: `Invalid event ID format: ${queryEvent}`});
        }

        if(req.user.role === 'admin'){// only admins can filter by users and events
            if (queryUser) { // if the query exists
                query.user = queryUser; // set query
            }
            if (queryEvent) {
                query.event = queryEvent;
            }
        } else {
            query.user = req.user.id;
            // Non-admin users can still filter their own bookings by event
            if (queryEvent) {
                query.event = queryEvent;
            }
        }
        
        const booking = await Booking.find(query); // try to find the query

        if (!booking.length && Object.keys(query).length > 0) { // if the list is empty, send a 404 message
            return res.status(404).json({ message: 'No bookings found matching your criteria.' });
        }
        if (!booking.length) { // if we searched a general query, and the list is empty, no bookings were found
            return res.status(404).json({ message: 'No booking found.' });
        }

        res.json(booking);
    } catch (err) {
        console.error('Error fetching bookings:', err.message);
        res.status(500).json({ message: 'Server error while fetching bookings.' });
    }
}

/**
 * @desc    Get a single booking by its ID.
 *          Intended for the user who owns the booking or an admin.
 * @route   GET /api/bookings/:id
 * @access  Private (Requires authentication)
 */
const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if(!booking) {
            return res.status(404).json({ message: 'Booking not found.' });
        }
        res.json(booking);
    } catch (err) {
        console.error(`Error fetching booking with ID ${req.params.id}:`, err.message);
        if (err.kind === 'ObjectId') { // Handle invalid MongoDB ObjectId format
            return res.status(400).json({ message: 'Invalid booking ID format.' });
        }
        res.status(500).json({ message: 'Server error while fetching event.' });
    }
}

/**
 * @desc    Create a new booking for an event.
 *          Validates input, checks for event seat availability,
 *          updates the event's booked seat count, and saves the new booking.
 * @route   POST /api/bookings
 * @access  Private (Requires authentication; intended for regular users)
 * @body    {string} user - The ID of the user making the booking.
 * @body    {string} event - The ID of the event being booked.
 * @body    {number} quantity - The number of seats to book.
 */
const createBooking = async (req, res) => {
    const { user, event, quantity } = req.body;
    //checks for valid ObjectId references
    if (!mongoose.Types.ObjectId.isValid(user)) {
        return res.status(400).json({message: `Invalid user ID format: ${user}`});
    }
    if (!mongoose.Types.ObjectId.isValid(event)) {
        return res.status(400).json({message: `Invalid event ID format: ${event}`});
    }

    if(!user || !event || !quantity){
        return res.status(400).json({ message: 'User, event, and quantity are required.' });
    }
    try {
        const newBooking = new Booking({
            user,
            event,
            quantity,
        });
        
        // update booked seats on specific event
        const eventUpdate = await Event.findById(event);
        let curBookedSeats = eventUpdate.bookedSeats;
        eventUpdate.bookedSeats += quantity;
        if(eventUpdate.bookedSeats > eventUpdate.seatCapacity){ // if we try to book more than the available seats, we notify the user
            return res.status(400).json({
                message: `Not enough seats left to book. Available seats: ${eventUpdate.seatCapacity - curBookedSeats}`
            });
        }
        // if we pass, save and confirm
        await eventUpdate.save();
        const savedBooking = await newBooking.save();
        res.status(201).json({ message: 'Booking created successfully', event: savedBooking });
    } catch (err) {
        console.error('Error creating event:', err.message);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation error', errors: err.errors });
        }
        res.status(500).json({ message: 'Server error while creating booking.' });
    }
}

module.exports = {
    getAllBookings,
    getBookingById,
    createBooking,
};