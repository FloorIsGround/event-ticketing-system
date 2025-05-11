const mongoose = require("mongoose");
const { formatISO } = require('date-fns');

const Schema = mongoose.Schema;
const bookingSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    event: {
        type: Schema.Types.ObjectId,
        ref: "Event",
    },
    quantity: {
        type: Number,
        required: true,
    },
    bookDate: {
        type: Date,
        default: formatISO(Date.now(), { representation: 'date' }),
    },
    // optional feature
    // qrCode: {
    //     type: String,
    // }
});

module.exports = mongoose.model("Booking", bookingSchema);
