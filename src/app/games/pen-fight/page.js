'use client';

import { useState, useMemo } from 'react';
import { useParty } from '@/context/PartyContext';
import Link from 'next/link';

// Outcome options for each player
const OUTCOMES = {
    playing: { label: 'Still Playing', points: 0, icon: '🎮' },
    knocked_out: { label: 'Knocked Out', points: 20, icon: '💥' }, // +20 to opponent team
    ring_out: { label: 'Ring Out (Self)', points: -10, icon: '🚫' }, // -10 to own team
    friendly_fire: { label: 'Kicked by Teammate', points: -10, icon: '💀' }, // -10 to own team
    winner: { label: 'Winner!', points: 20, icon: '🏆' }, // +20 to own team
};

export default function PenFightPage() {
    const { teams, players, updateTeam, getTeamPlayers, isLoaded } = useParty();

    // Game state - 3 players per team with their outcomes
    const [team1Players, setTeam1Players] = useState(['', '', '']);
    const [team2Players, setTeam2Players] = useState(['', '', '']);
    const [team1Outcomes, setTeam1Outcomes] = useState(['playing', 'playing', 'playing']);
    const [team2Outcomes, setTeam2Outcomes] = useState(['playing', 'playing', 'playing']);
    const [selectedTeam1Id, setSelectedTeam1Id] = useState('');
    const [selectedTeam2Id, setSelectedTeam2Id] = useState('');
    const [gameSubmitted, setGameSubmitted] = useState(false);

    // Get available players for each team
    const team1AvailablePlayers = useMemo(() => {
        if (!selectedTeam1Id) return [];
        return getTeamPlayers(selectedTeam1Id);
    }, [selectedTeam1Id, getTeamPlayers]);

    const team2AvailablePlayers = useMemo(() => {
        if (!selectedTeam2Id) return [];
        return getTeamPlayers(selectedTeam2Id);
    }, [selectedTeam2Id, getTeamPlayers]);

    // Calculate scores
    const calculateScores = () => {
        let team1Score = 0;
        let team2Score = 0;

        // Process Team 1 outcomes
        team1Outcomes.forEach((outcome) => {
            if (outcome === 'knocked_out') {
                // Team 1 player knocked out = Team 2 gets points
                team2Score += OUTCOMES.knocked_out.points;
            } else if (outcome === 'ring_out' || outcome === 'friendly_fire') {
                // Team 1 loses points
                team1Score += OUTCOMES[outcome].points;
            } else if (outcome === 'winner') {
                // Team 1 wins
                team1Score += OUTCOMES.winner.points;
            }
        });

        // Process Team 2 outcomes
        team2Outcomes.forEach((outcome) => {
            if (outcome === 'knocked_out') {
                // Team 2 player knocked out = Team 1 gets points
                team1Score += OUTCOMES.knocked_out.points;
            } else if (outcome === 'ring_out' || outcome === 'friendly_fire') {
                // Team 2 loses points
                team2Score += OUTCOMES[outcome].points;
            } else if (outcome === 'winner') {
                // Team 2 wins
                team2Score += OUTCOMES.winner.points;
            }
        });

        return { team1Score, team2Score };
    };

    const handleSubmitGame = () => {
        const { team1Score, team2Score } = calculateScores();

        const team1 = teams.find(t => t.id === selectedTeam1Id);
        const team2 = teams.find(t => t.id === selectedTeam2Id);

        if (team1) {
            updateTeam(selectedTeam1Id, { score: team1.score + team1Score });
        }
        if (team2) {
            updateTeam(selectedTeam2Id, { score: team2.score + team2Score });
        }

        setGameSubmitted(true);
    };

    const handleResetGame = () => {
        setTeam1Players(['', '', '']);
        setTeam2Players(['', '', '']);
        setTeam1Outcomes(['playing', 'playing', 'playing']);
        setTeam2Outcomes(['playing', 'playing', 'playing']);
        setGameSubmitted(false);
    };

    const updateTeam1Player = (index, playerId) => {
        const newPlayers = [...team1Players];
        newPlayers[index] = playerId;
        setTeam1Players(newPlayers);
    };

    const updateTeam2Player = (index, playerId) => {
        const newPlayers = [...team2Players];
        newPlayers[index] = playerId;
        setTeam2Players(newPlayers);
    };

    const updateTeam1Outcome = (index, outcome) => {
        const newOutcomes = [...team1Outcomes];
        newOutcomes[index] = outcome;
        setTeam1Outcomes(newOutcomes);
    };

    const updateTeam2Outcome = (index, outcome) => {
        const newOutcomes = [...team2Outcomes];
        newOutcomes[index] = outcome;
        setTeam2Outcomes(newOutcomes);
    };

    const { team1Score, team2Score } = calculateScores();
    const team1 = teams.find(t => t.id === selectedTeam1Id);
    const team2 = teams.find(t => t.id === selectedTeam2Id);

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-2xl text-gray-400">Loading...</div>
            </div>
        );
    }

    if (teams.length < 2) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="text-6xl mb-4">🖊️</div>
                    <h1 className="text-3xl font-bold mb-4">Need More Teams</h1>
                    <p className="text-gray-400 mb-8">Create at least 2 teams to play Pen Fight.</p>
                    <Link
                        href="/teams"
                        className="px-6 py-3 bg-green-600 rounded-xl font-bold hover:bg-green-500"
                    >
                        Go to Teams Setup
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8" style={{ backgroundColor: '#030712', color: '#f9fafb' }}>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/games" className="text-gray-400 hover:text-white mb-2 inline-block">
                        ← Back to Games
                    </Link>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                        🖊️ Pen Fight
                    </h1>
                    <p className="text-gray-400 mt-1">Track knockouts and calculate scores!</p>
                </div>

                {/* Team Selection */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm">Team 1</label>
                        <select
                            value={selectedTeam1Id}
                            onChange={(e) => {
                                setSelectedTeam1Id(e.target.value);
                                setTeam1Players(['', '', '']);
                                setTeam1Outcomes(['playing', 'playing', 'playing']);
                            }}
                            disabled={gameSubmitted}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl
                                focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
                        >
                            <option value="">Select Team 1...</option>
                            {teams.filter(t => t.id !== selectedTeam2Id).map((team) => (
                                <option key={team.id} value={team.id}>
                                    {team.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm">Team 2</label>
                        <select
                            value={selectedTeam2Id}
                            onChange={(e) => {
                                setSelectedTeam2Id(e.target.value);
                                setTeam2Players(['', '', '']);
                                setTeam2Outcomes(['playing', 'playing', 'playing']);
                            }}
                            disabled={gameSubmitted}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl
                                focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
                        >
                            <option value="">Select Team 2...</option>
                            {teams.filter(t => t.id !== selectedTeam1Id).map((team) => (
                                <option key={team.id} value={team.id}>
                                    {team.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Game Board */}
                {selectedTeam1Id && selectedTeam2Id && (
                    <div className="grid grid-cols-2 gap-6 mb-8">
                        {/* Team 1 Board */}
                        <div
                            className="bg-gray-900 rounded-2xl p-6 border-2"
                            style={{ borderColor: team1?.color || '#22c55e' }}
                        >
                            <h3 className="text-xl font-bold mb-4" style={{ color: team1?.color || '#22c55e' }}>
                                {team1?.name || 'Team 1'}
                            </h3>
                            <div className="space-y-4">
                                {[0, 1, 2].map((index) => (
                                    <div key={index} className="bg-gray-800 rounded-xl p-4">
                                        <div className="text-sm text-gray-500 mb-2">Player {index + 1}</div>
                                        <select
                                            value={team1Players[index]}
                                            onChange={(e) => updateTeam1Player(index, e.target.value)}
                                            disabled={gameSubmitted}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg
                                                focus:outline-none focus:ring-2 focus:ring-green-500 text-white mb-2"
                                        >
                                            <option value="">Select player...</option>
                                            {team1AvailablePlayers
                                                .filter(p => !team1Players.includes(p.id) || team1Players[index] === p.id)
                                                .map((player) => (
                                                    <option key={player.id} value={player.id}>
                                                        {player.name}
                                                    </option>
                                                ))}
                                        </select>
                                        {team1Players[index] && (
                                            <select
                                                value={team1Outcomes[index]}
                                                onChange={(e) => updateTeam1Outcome(index, e.target.value)}
                                                disabled={gameSubmitted}
                                                className={`w-full px-3 py-2 border rounded-lg
                                                    focus:outline-none focus:ring-2 focus:ring-green-500 text-white
                                                    ${team1Outcomes[index] === 'winner' ? 'bg-green-900 border-green-600' :
                                                        team1Outcomes[index] === 'knocked_out' ? 'bg-red-900 border-red-600' :
                                                            team1Outcomes[index] === 'ring_out' || team1Outcomes[index] === 'friendly_fire'
                                                                ? 'bg-orange-900 border-orange-600' : 'bg-gray-700 border-gray-600'}`}
                                            >
                                                {Object.entries(OUTCOMES).map(([key, value]) => (
                                                    <option key={key} value={key}>
                                                        {value.icon} {value.label}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-700 text-center">
                                <div className="text-gray-400 text-sm">Round Score</div>
                                <div className={`text-3xl font-bold ${team1Score >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {team1Score >= 0 ? '+' : ''}{team1Score}
                                </div>
                            </div>
                        </div>

                        {/* Team 2 Board */}
                        <div
                            className="bg-gray-900 rounded-2xl p-6 border-2"
                            style={{ borderColor: team2?.color || '#3b82f6' }}
                        >
                            <h3 className="text-xl font-bold mb-4" style={{ color: team2?.color || '#3b82f6' }}>
                                {team2?.name || 'Team 2'}
                            </h3>
                            <div className="space-y-4">
                                {[0, 1, 2].map((index) => (
                                    <div key={index} className="bg-gray-800 rounded-xl p-4">
                                        <div className="text-sm text-gray-500 mb-2">Player {index + 1}</div>
                                        <select
                                            value={team2Players[index]}
                                            onChange={(e) => updateTeam2Player(index, e.target.value)}
                                            disabled={gameSubmitted}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg
                                                focus:outline-none focus:ring-2 focus:ring-green-500 text-white mb-2"
                                        >
                                            <option value="">Select player...</option>
                                            {team2AvailablePlayers
                                                .filter(p => !team2Players.includes(p.id) || team2Players[index] === p.id)
                                                .map((player) => (
                                                    <option key={player.id} value={player.id}>
                                                        {player.name}
                                                    </option>
                                                ))}
                                        </select>
                                        {team2Players[index] && (
                                            <select
                                                value={team2Outcomes[index]}
                                                onChange={(e) => updateTeam2Outcome(index, e.target.value)}
                                                disabled={gameSubmitted}
                                                className={`w-full px-3 py-2 border rounded-lg
                                                    focus:outline-none focus:ring-2 focus:ring-green-500 text-white
                                                    ${team2Outcomes[index] === 'winner' ? 'bg-green-900 border-green-600' :
                                                        team2Outcomes[index] === 'knocked_out' ? 'bg-red-900 border-red-600' :
                                                            team2Outcomes[index] === 'ring_out' || team2Outcomes[index] === 'friendly_fire'
                                                                ? 'bg-orange-900 border-orange-600' : 'bg-gray-700 border-gray-600'}`}
                                            >
                                                {Object.entries(OUTCOMES).map(([key, value]) => (
                                                    <option key={key} value={key}>
                                                        {value.icon} {value.label}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-700 text-center">
                                <div className="text-gray-400 text-sm">Round Score</div>
                                <div className={`text-3xl font-bold ${team2Score >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {team2Score >= 0 ? '+' : ''}{team2Score}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Submit/Reset Buttons */}
                {selectedTeam1Id && selectedTeam2Id && (
                    <div className="flex justify-center gap-4">
                        {!gameSubmitted ? (
                            <button
                                onClick={handleSubmitGame}
                                className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl
                                    font-bold text-xl hover:from-green-500 hover:to-emerald-500 transition-all"
                            >
                                ✓ Submit Scores
                            </button>
                        ) : (
                            <div className="text-center">
                                <div className="text-green-400 text-xl font-bold mb-4">
                                    ✅ Scores submitted!
                                </div>
                                <button
                                    onClick={handleResetGame}
                                    className="px-8 py-3 bg-gray-700 rounded-xl font-medium hover:bg-gray-600"
                                >
                                    New Round
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Scoring Rules */}
                <div className="mt-8 bg-gray-900/50 rounded-xl p-4 border border-gray-800">
                    <h3 className="font-bold mb-3 text-gray-300">📋 Scoring Rules</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="text-center p-2 bg-gray-800 rounded-lg">
                            <div className="text-2xl mb-1">💥</div>
                            <div className="text-gray-400">Knock Out Opponent</div>
                            <div className="font-bold text-green-400">+20 pts</div>
                        </div>
                        <div className="text-center p-2 bg-gray-800 rounded-lg">
                            <div className="text-2xl mb-1">🏆</div>
                            <div className="text-gray-400">Winner</div>
                            <div className="font-bold text-green-400">+20 pts</div>
                        </div>
                        <div className="text-center p-2 bg-gray-800 rounded-lg">
                            <div className="text-2xl mb-1">🚫</div>
                            <div className="text-gray-400">Ring Out (Self)</div>
                            <div className="font-bold text-red-400">-10 pts</div>
                        </div>
                        <div className="text-center p-2 bg-gray-800 rounded-lg">
                            <div className="text-2xl mb-1">💀</div>
                            <div className="text-gray-400">Kicked Teammate</div>
                            <div className="font-bold text-red-400">-10 pts</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
