import mongoose from 'mongoose';

const PlayerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    photo: {
        type: String,
        default: null,
    },
    teamId: {
        type: String,
        default: null,
    },
    soldPrice: {
        type: Number,
        default: null,
    },
    isCaptain: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Use existing model if it exists (for hot reloading in dev)
export default mongoose.models.Player || mongoose.model('Player', PlayerSchema);
