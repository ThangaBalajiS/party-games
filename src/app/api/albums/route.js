import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Album from '@/models/Album';

// GET all albums
export async function GET() {
    try {
        await connectDB();
        const albums = await Album.find({}).sort({ createdAt: 1 });

        const formattedAlbums = albums.map(album => ({
            id: album._id.toString(),
            name: album.name,
            coverArt: album.coverArt,
            songs: album.songs.map(song => ({
                id: song._id.toString(),
                title: song.title,
                streams: song.streams,
            })),
            played: album.played,
            createdAt: album.createdAt?.toISOString() || new Date().toISOString(),
        }));

        return NextResponse.json(formattedAlbums);
    } catch (error) {
        console.error('Error fetching albums:', error);
        return NextResponse.json({ error: 'Failed to fetch albums' }, { status: 500 });
    }
}

// POST create a new album
export async function POST(request) {
    try {
        await connectDB();
        const body = await request.json();

        const album = await Album.create({
            name: body.name,
            coverArt: body.coverArt || null,
            songs: body.songs || [],
            played: false,
        });

        const newAlbum = {
            id: album._id.toString(),
            name: album.name,
            coverArt: album.coverArt,
            songs: album.songs.map(song => ({
                id: song._id.toString(),
                title: song.title,
                streams: song.streams,
            })),
            played: album.played,
            createdAt: album.createdAt?.toISOString() || new Date().toISOString(),
        };

        return NextResponse.json(newAlbum, { status: 201 });
    } catch (error) {
        console.error('Error creating album:', error);
        return NextResponse.json({ error: 'Failed to create album' }, { status: 500 });
    }
}

// DELETE all albums (for reset)
export async function DELETE() {
    try {
        await connectDB();
        await Album.deleteMany({});
        return NextResponse.json({ message: 'All albums deleted' });
    } catch (error) {
        console.error('Error deleting albums:', error);
        return NextResponse.json({ error: 'Failed to delete albums' }, { status: 500 });
    }
}
