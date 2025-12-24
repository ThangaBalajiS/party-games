import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Player from '@/models/Player';

// PATCH update a player
export async function PATCH(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        const body = await request.json();

        const player = await Player.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true }
        );

        if (!player) {
            return NextResponse.json({ error: 'Player not found' }, { status: 404 });
        }

        const updatedPlayer = {
            id: player._id.toString(),
            name: player.name,
            photo: player.photo,
            teamId: player.teamId,
            soldPrice: player.soldPrice,
            isCaptain: player.isCaptain,
            createdAt: player.createdAt?.toISOString() || new Date().toISOString(),
        };

        return NextResponse.json(updatedPlayer);
    } catch (error) {
        console.error('Error updating player:', error);
        return NextResponse.json({ error: 'Failed to update player' }, { status: 500 });
    }
}

// DELETE a player
export async function DELETE(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;

        const player = await Player.findByIdAndDelete(id);

        if (!player) {
            return NextResponse.json({ error: 'Player not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Player deleted', id });
    } catch (error) {
        console.error('Error deleting player:', error);
        return NextResponse.json({ error: 'Failed to delete player' }, { status: 500 });
    }
}
