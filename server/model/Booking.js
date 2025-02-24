import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        tour: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tour',
            required: true
        },
        fullName: {
            type: String,
            required: true,
        },
        guestSize:{
            type: Number,
            required: true,
        },
        phone:{
            type: Number,
            required: true,
        },
        bookAt:{
            type: Date,
            required: true,
        },
        totalAmount: { // Add totalAmount field
            type: Number,
            required: true
        },
        status: { // Add status field
            type: String,
            enum: ['Active', 'Canceled'], // Possible values: 'booked' or 'canceled'
            default: 'Active' // Default value is 'booked'
        },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        tour: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour', required: true },
    // Add the reviews field to store an array of review IDs
        reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
    },
    { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
