'use client';

import { useState } from 'react';
import { useParty } from '@/context/PartyContext';
import { formatPriceWithSymbol } from '@/lib/formatPrice';
import Link from 'next/link';

const THROWS_PER_PLAYER = 5;

// Calculate score for a player
const calculatePlayerScore = (correctThrows) => {
    if (correctThrows === 5) return 30;
    return correctThrows * 5;
};

export default function BeerPongPage() {
    const { teams, updateTeam, getTeamPlayers, isLoaded } = useParty();

    // Game state
    const [selectedTeamId, setSelectedTeamId] = useState('');
    const [selectedPlayerId, setSelectedPlayerId] = useState('');
    const [correctThrows, setCorrectThrows] = useState(null);
    const [lastSubmission, setLastSubmission] = useState(null);

    const selectedTeam = teams.find(t => t.id === selectedTeamId);
    const teamPlayers = selectedTeamId ? getTeamPlayers(selectedTeamId) : [];
    const selectedPlayer = teamPlayers.find(p => p.id === selectedPlayerId);

    // Get played player IDs from team data
    const playedPlayerIds = selectedTeam?.beerPongPlayedPlayerIds || [];
    
    // Calculate completed and remaining players
    const playersPlayed = playedPlayerIds.length;
    const totalPlayers = teamPlayers.length;
    const playersRemaining = totalPlayers - playersPlayed;

    const handleSelectTeam = (teamId) => {
        setSelectedTeamId(teamId);
        setSelectedPlayerId('');
        setCorrectThrows(null);
        setLastSubmission(null);
    };

    const handleSelectPlayer = (playerId) => {
        setSelectedPlayerId(playerId);
        setCorrectThrows(null);
    };

    const handleSubmitScore = async () => {
        if (!selectedTeam || correctThrows === null || !selectedPlayerId) return;

        const score = calculatePlayerScore(correctThrows);

        // Update team score and add player ID to played list
        // Using beerPongAddPlayerId triggers $push in the API
        await updateTeam(selectedTeamId, {
            score: selectedTeam.score + score,
            beerPongPlayersPlayed: (selectedTeam.beerPongPlayersPlayed || 0) + 1,
            beerPongAddPlayerId: selectedPlayerId,
            beerPongTotalScore: (selectedTeam.beerPongTotalScore || 0) + score
        });

        setLastSubmission({
            playerName: selectedPlayer?.name,
            correctThrows,
            score
        });

        // Reset for next player
        setSelectedPlayerId('');
        setCorrectThrows(null);
    };

    const handleBackToTeams = () => {
        setSelectedTeamId('');
        setSelectedPlayerId('');
        setCorrectThrows(null);
        setLastSubmission(null);
    };

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-2xl text-gray-400">Loading...</div>
            </div>
        );
    }

    if (teams.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="text-6xl mb-4">🍺</div>
                    <h1 className="text-3xl font-bold mb-4">No Teams Yet</h1>
                    <p className="text-gray-400 mb-8">Create teams first to play Beer Pong.</p>
                    <Link
                        href="/teams"
                        className="px-6 py-3 bg-red-600 rounded-xl font-bold hover:bg-red-500"
                    >
                        Go to Teams Setup
                    </Link>
                </div>
            </div>
        );
    }

    // Team Selection Screen
    if (!selectedTeamId) {
        return (
            <div className="min-h-screen p-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <Link href="/games" className="text-gray-400 hover:text-white mb-2 inline-block">
                            ← Back to Games
                        </Link>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-rose-500 bg-clip-text text-transparent">
                            🍺 Beer Pong
                        </h1>
                        <p className="text-gray-400 mt-2">Select a team to play</p>
                    </div>

                    {/* Scoring Explanation */}
                    <div className="mb-8 bg-gray-900 rounded-xl p-4 border border-gray-800">
                        <h3 className="font-bold mb-3 text-red-400">📋 Scoring System</h3>
                        <div className="text-sm space-y-2 text-gray-300">
                            <p>• Each player gets <strong>5 throws</strong></p>
                            <p>• Each successful throw = <span className="text-green-400 font-bold">5 points</span></p>
                            <p>• All 5 throws successful = <span className="text-green-400 font-bold">30 points</span> (bonus!)</p>
                        </div>
                    </div>

                    {/* Team Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {teams.map((team) => {
                            const teamMembers = getTeamPlayers(team.id);
                            const played = team.beerPongPlayedPlayerIds?.length || 0;
                            const total = teamMembers.length;
                            const remaining = total - played;
                            const isComplete = played >= total && total > 0;

                            return (
                                <button
                                    key={team.id}
                                    onClick={() => handleSelectTeam(team.id)}
                                    className="bg-gray-900 rounded-2xl p-6 border-2 text-left
                                        hover:scale-[1.02] transition-all"
                                    style={{ borderColor: team.color }}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xl font-bold" style={{ color: team.color }}>
                                            {team.name}
                                        </h3>
                                        <div className="text-2xl font-bold text-green-400">
                                            {team.beerPongTotalScore || 0} pts
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {played > 0 ? (
                                            isComplete ? (
                                                <span className="text-green-400">✓ {played} players completed</span>
                                            ) : (
                                                <span className="text-rose-400">
                                                    {played % total}/{total} done • {remaining} left
                                                </span>
                                            )
                                        ) : (
                                            <span>{total} players</span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    // Player Selection & Scoring Screen
    return (
        <div className="min-h-screen p-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={handleBackToTeams}
                        className="text-gray-400 hover:text-white mb-2 inline-block"
                    >
                        ← Back to Team Selection
                    </button>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-rose-500 bg-clip-text text-transparent">
                        🍺 Beer Pong
                    </h1>
                </div>

                {/* Team Header with Progress */}
                <div
                    className="bg-gray-900 rounded-xl p-4 mb-6 border-2"
                    style={{ borderColor: selectedTeam?.color }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold" style={{ color: selectedTeam?.color }}>
                                {selectedTeam?.name}
                            </h2>
                            <p className="text-sm text-gray-400">
                                {playersPlayed}/{totalPlayers} players done
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-green-400">{selectedTeam?.beerPongTotalScore || 0} pts</div>
                        </div>
                    </div>
                </div>

                {/* Last Submission Toast */}
                {lastSubmission && (
                    <div className="mb-6 p-4 rounded-xl border bg-green-900/30 border-green-700">
                        <div className="text-center text-green-400">
                            ✓ {lastSubmission.playerName}: +{lastSubmission.score} pts ({lastSubmission.correctThrows}/5)
                        </div>
                    </div>
                )}

                {/* Player Selection */}
                {!selectedPlayerId ? (
                    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                        <h3 className="font-bold mb-4 text-gray-300">Select a player:</h3>
                        {teamPlayers.length === 0 ? (
                            <div className="text-center py-4">
                                <p className="text-gray-400">No players in this team.</p>
                                <Link href="/players" className="text-red-400 hover:text-red-300 mt-2 inline-block">
                                    Add players →
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                {teamPlayers.map((player) => {
                                    const hasPlayed = playedPlayerIds.includes(player.id);
                                    return (
                                        <button
                                            key={player.id}
                                            onClick={() => !hasPlayed && handleSelectPlayer(player.id)}
                                            disabled={hasPlayed}
                                            className={`p-4 rounded-xl border transition-all text-left ${
                                                hasPlayed
                                                    ? 'bg-gray-800/50 border-green-700 opacity-60 cursor-not-allowed'
                                                    : 'bg-gray-800 border-gray-700 hover:border-red-500'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className={hasPlayed ? 'text-gray-500' : ''}>
                                                    <span className="font-bold">{player.name}</span>
                                                    {player.soldPrice && (
                                                        <span className="text-gray-400 text-sm ml-1">({formatPriceWithSymbol(player.soldPrice)})</span>
                                                    )}
                                                </div>
                                                {hasPlayed && (
                                                    <span className="text-green-500 text-sm">✓ Done</span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ) : (
                    /* Score Entry */
                    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold">
                                {selectedPlayer?.name}
                                {selectedPlayer?.soldPrice && (
                                    <span className="text-gray-400 text-lg ml-2">({formatPriceWithSymbol(selectedPlayer.soldPrice)})</span>
                                )}
                            </h3>
                            <p className="text-gray-400">How many successful throws?</p>
                        </div>

                        {/* Throw Selection */}
                        <div className="flex justify-center gap-3 mb-6">
                            {[0, 1, 2, 3, 4, 5].map((num) => (
                                <button
                                    key={num}
                                    onClick={() => setCorrectThrows(num)}
                                    className={`w-14 h-14 rounded-xl font-bold text-xl transition-all ${
                                        correctThrows === num
                                            ? 'bg-red-600 text-white scale-110'
                                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                    }`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>

                        {/* Score Preview */}
                        {correctThrows !== null && (
                            <div className="bg-gray-800 rounded-xl p-4 mb-6 text-center">
                                <div className="text-gray-400 text-sm mb-1">Score</div>
                                <div className="text-4xl font-bold text-green-400">
                                    {calculatePlayerScore(correctThrows)} pts
                                    {correctThrows === 5 && <span className="ml-2">🎯</span>}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <button
                                onClick={() => setSelectedPlayerId('')}
                                className="flex-1 px-6 py-3 bg-gray-700 rounded-xl font-medium
                                    hover:bg-gray-600 transition-colors"
                            >
                                ← Back
                            </button>
                            <button
                                onClick={handleSubmitScore}
                                disabled={correctThrows === null}
                                className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all ${
                                    correctThrows !== null
                                        ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500'
                                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                ✓ Submit Score
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
