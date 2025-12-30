import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Team from '@/models/Team';

// PATCH update a team
export async function PATCH(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        const body = await request.json();

        // Separate array push operation from regular updates
        const { beerPongAddPlayerId, ...regularUpdates } = body;
        
        let updateQuery = {};
        
        // Handle regular field updates
        if (Object.keys(regularUpdates).length > 0) {
            updateQuery.$set = regularUpdates;
        }
        
        // Handle adding player ID to array using $push
        if (beerPongAddPlayerId) {
            updateQuery.$push = { beerPongPlayedPlayerIds: beerPongAddPlayerId };
        }

        const team = await Team.findByIdAndUpdate(
            id,
            updateQuery,
            { new: true }
        );

        if (!team) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        }

        const updatedTeam = {
            id: team._id.toString(),
            name: team.name,
            color: team.color,
            captainId: team.captainId,
            budget: team.budget,
            score: team.score,
            guessTheWordRounds: team.guessTheWordRounds || 0,
            dumbCharadesRounds: team.dumbCharadesRounds || 0,
            pictionaryRounds: team.pictionaryRounds || 0,
            penFightRounds: team.penFightRounds || 0,
            beerPongRounds: team.beerPongRounds || 0,
            beerPongPlayersPlayed: team.beerPongPlayersPlayed || 0,
            beerPongPlayedPlayerIds: team.beerPongPlayedPlayerIds || [],
            beerPongTotalScore: team.beerPongTotalScore || 0,
            createdAt: team.createdAt?.toISOString() || new Date().toISOString(),
        };

        return NextResponse.json(updatedTeam);
    } catch (error) {
        console.error('Error updating team:', error);
        return NextResponse.json({ error: 'Failed to update team' }, { status: 500 });
    }
}

// DELETE a team
export async function DELETE(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;

        const team = await Team.findByIdAndDelete(id);

        if (!team) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Team deleted', id });
    } catch (error) {
        console.error('Error deleting team:', error);
        return NextResponse.json({ error: 'Failed to delete team' }, { status: 500 });
    }
}
