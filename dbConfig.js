const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URI)
        console.log('MongoDB connected.')
    } catch (err) {
        console.log(`MongoDB Connection Error: ${err.message}`);
    }
}

module.exports = connectDB;