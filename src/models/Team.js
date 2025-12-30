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
    // Game progress tracking
    guessTheWordRounds: {
        type: Number,
        default: 0,
    },
    dumbCharadesRounds: {
        type: Number,
        default: 0,
    },
    pictionaryRounds: {
        type: Number,
        default: 0,
    },
    penFightRounds: {
        type: Number,
        default: 0,
    },
    beerPongRounds: {
        type: Number,
        default: 0,
    },
    beerPongPlayersPlayed: {
        type: Number,
        default: 0,
    },
    beerPongPlayedPlayerIds: {
        type: [String],
        default: [],
    },
    beerPongTotalScore: {
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
