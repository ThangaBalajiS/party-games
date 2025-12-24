import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
    basePrice: {
        type: Number,
        default: 100,
    },
    bidIncrement: {
        type: Number,
        default: 10,
    },
    auctionStatus: {
        type: String,
        enum: ['pending', 'in-progress', 'completed'],
        default: 'pending',
    },
    currentPlayerIndex: {
        type: Number,
        default: 0,
    },
});

// Use existing model if it exists (for hot reloading in dev)
export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
