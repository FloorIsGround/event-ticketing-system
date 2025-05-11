const express = require('express');
const router = express.Router();

const { auth, userCheck } = require('../../middleware/auth');
const { getAllBookings, getBookingById, createBooking } = require('../../controllers/bookingController');

router.route('/')
.get(auth, getAllBookings) // GET /api/bookings?user=:user?event=:event - users can only search their own bookings, admin can query both by event and user id's
.post(auth, userCheck, createBooking);// POST /api/bookings - users can create a booking - user only

router.route('/:id')
.get(auth, userCheck, getBookingById);// GET /api/bookings/:id - returns a specific booking's detail - user only

module.exports = router;
