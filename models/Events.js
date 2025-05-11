const mongoose = require("mongoose");
const { formatISO } = require('date-fns');

const Schema = mongoose.Schema;
const eventSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  category: {
    type: String,
  },
  venue: {
    type: String,
  },
  date: {
    type: Date,
    required: true,
    default: formatISO(Date.now(), { representation: 'date' }), //sets dates in mongodb to YYYY-MM-DDT00:00:00.000+00:00
    //formatISO allows easy search and date indexing without need for a range
  },
  time: {
    type: String,
  },
  seatCapacity: {
    type: Number,
    required: true,
  },
  bookedSeats: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: true,
  }
});

module.exports = mongoose.model("Event", eventSchema);
