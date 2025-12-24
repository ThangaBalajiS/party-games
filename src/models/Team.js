import mongoose from 'mongoose';

const TeamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    color: {
        type: String,
        default: '#3B82F6',
    },
    captainId: {
        type: String,
        default: null,
    },
    budget: {
        type: Number,
        default: 1000,
    },
    score: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Use existing model if it exists (for hot reloading in dev)
export default mongoose.models.Team || mongoose.model('Team', TeamSchema);
