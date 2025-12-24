import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Album from '@/models/Album';

// PATCH update an album
export async function PATCH(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        const body = await request.json();

        const album = await Album.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true }
        );

        if (!album) {
            return NextResponse.json({ error: 'Album not found' }, { status: 404 });
        }

        const updatedAlbum = {
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

        return NextResponse.json(updatedAlbum);
    } catch (error) {
        console.error('Error updating album:', error);
        return NextResponse.json({ error: 'Failed to update album' }, { status: 500 });
    }
}

// DELETE an album
export async function DELETE(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;

        const album = await Album.findByIdAndDelete(id);

        if (!album) {
            return NextResponse.json({ error: 'Album not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Album deleted', id });
    } catch (error) {
        console.error('Error deleting album:', error);
        return NextResponse.json({ error: 'Failed to delete album' }, { status: 500 });
    }
}
