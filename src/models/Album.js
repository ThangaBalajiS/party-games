import mongoose from 'mongoose';

const SongSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    streams: {
        type: Number,
        default: 0,
    },
});

const AlbumSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    coverArt: {
        type: String,
        default: null,
    },
    songs: [SongSchema],
    played: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Use existing model if it exists (for hot reloading in dev)
export default mongoose.models.Album || mongoose.model('Album', AlbumSchema);
