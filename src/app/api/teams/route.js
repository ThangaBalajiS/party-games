import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Team from '@/models/Team';

// GET all teams
export async function GET() {
    try {
        await connectDB();
        const teams = await Team.find({}).sort({ createdAt: 1 });

        const formattedTeams = teams.map(team => ({
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
        }));

        return NextResponse.json(formattedTeams);
    } catch (error) {
        console.error('Error fetching teams:', error);
        return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
    }
}

// POST create a new team
export async function POST(request) {
    try {
        await connectDB();
        const body = await request.json();

        const team = await Team.create({
            name: body.name,
            color: body.color || '#3B82F6',
            captainId: null,
            budget: body.budget || 1000,
            score: 0,
        });

        const newTeam = {
            id: team._id.toString(),
            name: team.name,
            color: team.color,
            captainId: team.captainId,
            budget: team.budget,
            score: team.score,
            createdAt: team.createdAt?.toISOString() || new Date().toISOString(),
        };

        return NextResponse.json(newTeam, { status: 201 });
    } catch (error) {
        console.error('Error creating team:', error);
        return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
    }
}

// DELETE all teams (for reset)
export async function DELETE() {
    try {
        await connectDB();
        await Team.deleteMany({});
        return NextResponse.json({ message: 'All teams deleted' });
    } catch (error) {
        console.error('Error deleting teams:', error);
        return NextResponse.json({ error: 'Failed to delete teams' }, { status: 500 });
    }
}
