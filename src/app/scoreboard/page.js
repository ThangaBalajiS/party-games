'use client';

import { useState } from 'react';
import { useParty } from '@/context/PartyContext';
import { formatPriceWithSymbol } from '@/lib/formatPrice';
import Link from 'next/link';

export default function ScoreboardPage() {
    const { teams, players, updateTeam, getTeamPlayers, isLoaded } = useParty();
    const [scoreInputs, setScoreInputs] = useState({});

    const handleScoreChange = (teamId, delta) => {
        const team = teams.find(t => t.id === teamId);
        if (!team) return;

        const newScore = Math.max(0, team.score + delta);
        updateTeam(teamId, { score: newScore });
    };

    const handleCustomScore = (teamId) => {
        const input = scoreInputs[teamId];
        if (input !== undefined && input !== '') {
            const score = parseInt(input) || 0;
            updateTeam(teamId, { score: Math.max(0, score) });
            setScoreInputs(prev => ({ ...prev, [teamId]: '' }));
        }
    };

    const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

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
                    <div className="text-6xl mb-4">📊</div>
                    <h1 className="text-3xl font-bold mb-4">No Teams Yet</h1>
                    <p className="text-gray-400 mb-8">Create teams first to use the scoreboard.</p>
                    <Link
                        href="/teams"
                        className="px-6 py-3 bg-blue-600 rounded-xl font-bold hover:bg-blue-500"
                    >
                        Go to Teams Setup
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Link href="/" className="text-gray-400 hover:text-white mb-2 inline-block">
                            ← Back to Home
                        </Link>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-cyan-500 bg-clip-text text-transparent">
                            Scoreboard
                        </h1>
                    </div>
                </div>

                {/* Leaderboard */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Main Scores */}
                    <div className="space-y-6">
                        {sortedTeams.map((team, index) => {
                            const teamPlayers = getTeamPlayers(team.id);
                            const captain = players.find(p => p.id === team.captainId);
                            const isLeader = index === 0 && team.score > 0;

                            return (
                                <div
                                    key={team.id}
                                    className={`bg-gray-900 rounded-3xl p-6 border-2 relative overflow-hidden
                             ${isLeader ? 'ring-4 ring-yellow-400/50' : ''}`}
                                    style={{ borderColor: team.color }}
                                >
                                    {/* Leader badge */}
                                    {isLeader && (
                                        <div className="absolute top-4 right-4 text-4xl">👑</div>
                                    )}

                                    {/* Rank */}
                                    <div className="absolute top-4 left-4 text-6xl font-bold text-gray-700">
                                        #{index + 1}
                                    </div>

                                    <div className="pt-12">
                                        {/* Team Name & Score */}
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-3xl font-bold" style={{ color: team.color }}>
                                                {team.name}
                                            </h2>
                                            <div className="text-5xl font-bold">{team.score}</div>
                                        </div>

                                        {/* Score Controls */}
                                        <div className="flex items-center gap-3 mb-6">
                                            <button
                                                onClick={() => handleScoreChange(team.id, -10)}
                                                className="w-14 h-14 bg-red-600 rounded-xl text-2xl font-bold
                                   hover:bg-red-500 transition-colors"
                                            >
                                                -10
                                            </button>
                                            <button
                                                onClick={() => handleScoreChange(team.id, -1)}
                                                className="w-14 h-14 bg-red-700 rounded-xl text-2xl font-bold
                                   hover:bg-red-600 transition-colors"
                                            >
                                                -1
                                            </button>

                                            <div className="flex-grow flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    value={scoreInputs[team.id] || ''}
                                                    onChange={(e) => setScoreInputs(prev => ({ ...prev, [team.id]: e.target.value }))}
                                                    placeholder="Set score"
                                                    className="flex-grow px-4 py-3 bg-gray-800 rounded-xl text-center
                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                                <button
                                                    onClick={() => handleCustomScore(team.id)}
                                                    className="px-4 py-3 bg-blue-600 rounded-xl font-bold
                                     hover:bg-blue-500 transition-colors"
                                                >
                                                    Set
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => handleScoreChange(team.id, 1)}
                                                className="w-14 h-14 bg-green-700 rounded-xl text-2xl font-bold
                                   hover:bg-green-600 transition-colors"
                                            >
                                                +1
                                            </button>
                                            <button
                                                onClick={() => handleScoreChange(team.id, 10)}
                                                className="w-14 h-14 bg-green-600 rounded-xl text-2xl font-bold
                                   hover:bg-green-500 transition-colors"
                                            >
                                                +10
                                            </button>
                                        </div>

                                        {/* Team Members */}
                                        <div className="flex flex-wrap gap-2">
                                            {captain && (
                                                <div className="flex items-center gap-2 px-3 py-1 bg-yellow-900/30 rounded-full">
                                                    <div className="w-6 h-6 rounded-full bg-gray-700 overflow-hidden">
                                                        {captain.photo ? (
                                                            <img src={captain.photo} alt={captain.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-xs">👤</span>
                                                        )}
                                                    </div>
                                                    <span className="text-sm font-medium">{captain.name}</span>
                                                    <span className="text-yellow-400 text-xs">👑</span>
                                                </div>
                                            )}
                                            {teamPlayers.filter(p => !p.isCaptain).map((player) => (
                                                <div
                                                    key={player.id}
                                                    className="flex items-center gap-2 px-3 py-1 bg-gray-800 rounded-full"
                                                >
                                                    <div className="w-6 h-6 rounded-full bg-gray-700 overflow-hidden">
                                                        {player.photo ? (
                                                            <img src={player.photo} alt={player.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-xs">👤</span>
                                                        )}
                                                    </div>
                                                    <span className="text-sm">{player.name}</span>
                                                    {player.soldPrice && (
                                                        <span className="text-gray-400 text-xs">({formatPriceWithSymbol(player.soldPrice)})</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Big Score Display - for presenting */}
                    <div className="hidden lg:block">
                        <div className="sticky top-8 bg-gray-900 rounded-3xl p-8 border border-gray-700">
                            <h3 className="text-2xl font-bold text-center mb-8 text-gray-400">Live Standings</h3>
                            <div className="space-y-6">
                                {sortedTeams.map((team, index) => (
                                    <div key={team.id} className="flex items-center gap-4">
                                        <div className="text-3xl font-bold text-gray-600 w-12">
                                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                                        </div>
                                        <div
                                            className="flex-grow h-16 rounded-xl flex items-center px-6 font-bold text-xl"
                                            style={{ backgroundColor: team.color }}
                                        >
                                            {team.name}
                                        </div>
                                        <div className="text-5xl font-bold w-24 text-right">{team.score}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
