import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Player from '@/models/Player';

// GET all players
export async function GET() {
    try {
        await connectDB();
        const players = await Player.find({}).sort({ createdAt: 1 });

        // Convert MongoDB documents to plain objects with id field
        const formattedPlayers = players.map(player => ({
            id: player._id.toString(),
            name: player.name,
            photo: player.photo,
            teamId: player.teamId,
            soldPrice: player.soldPrice,
            isCaptain: player.isCaptain,
            createdAt: player.createdAt?.toISOString() || new Date().toISOString(),
        }));

        return NextResponse.json(formattedPlayers);
    } catch (error) {
        console.error('Error fetching players:', error);
        return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 });
    }
}

// POST create a new player
export async function POST(request) {
    try {
        await connectDB();
        const body = await request.json();

        const player = await Player.create({
            name: body.name,
            photo: body.photo || null,
            teamId: null,
            soldPrice: null,
            isCaptain: false,
        });

        const newPlayer = {
            id: player._id.toString(),
            name: player.name,
            photo: player.photo,
            teamId: player.teamId,
            soldPrice: player.soldPrice,
            isCaptain: player.isCaptain,
            createdAt: player.createdAt?.toISOString() || new Date().toISOString(),
        };

        return NextResponse.json(newPlayer, { status: 201 });
    } catch (error) {
        console.error('Error creating player:', error);
        return NextResponse.json({ error: 'Failed to create player' }, { status: 500 });
    }
}

// DELETE all players (for reset)
export async function DELETE() {
    try {
        await connectDB();
        await Player.deleteMany({});
        return NextResponse.json({ message: 'All players deleted' });
    } catch (error) {
        console.error('Error deleting players:', error);
        return NextResponse.json({ error: 'Failed to delete players' }, { status: 500 });
    }
}
