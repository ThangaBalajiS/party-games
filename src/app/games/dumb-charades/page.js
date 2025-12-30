'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParty } from '@/context/PartyContext';
import Link from 'next/link';

const TOTAL_TIME = 120; // 2 minutes in seconds

// Calculate time penalty based on elapsed time
const calculateTimePenalty = (elapsedSeconds) => {
    if (elapsedSeconds <= 30) return 0;
    // -5 points for each 20 seconds after 30s
    const penaltyIntervals = Math.floor((elapsedSeconds - 30) / 20);
    return Math.min(penaltyIntervals + 1, 5) * 5; // Max penalty is 25 (at 110-120s band)
};

// Format seconds to MM:SS
const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function DumbCharadesPage() {
    const { teams, updateTeam, isLoaded } = useParty();

    // Game state
    const [selectedTeamId, setSelectedTeamId] = useState('');
    const [gameState, setGameState] = useState('idle'); // idle, playing, stopped
    const [timeRemaining, setTimeRemaining] = useState(TOTAL_TIME);
    const [method, setMethod] = useState('action'); // action or letter
    const [lastRoundScore, setLastRoundScore] = useState(null);

    // Timer effect
    useEffect(() => {
        let interval = null;
        if (gameState === 'playing' && timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining((prev) => {
                    if (prev <= 1) {
                        setGameState('stopped');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [gameState, timeRemaining]);

    // Calculate score based on current state
    const calculateScore = useCallback(() => {
        if (timeRemaining === 0) return { base: 0, penalty: 0, total: 0 };

        const elapsedTime = TOTAL_TIME - timeRemaining;
        const basePoints = method === 'action' ? 50 : 25;
        const penalty = calculateTimePenalty(elapsedTime);
        const total = Math.max(0, basePoints - penalty);

        return { base: basePoints, penalty, total, elapsedTime };
    }, [timeRemaining, method]);

    const handleStart = () => {
        if (!selectedTeamId) return;
        setGameState('playing');
        setTimeRemaining(TOTAL_TIME);
        setLastRoundScore(null);
    };

    const handleStop = () => {
        setGameState('stopped');
    };

    const handleConfirmScore = () => {
        const score = calculateScore();
        const team = teams.find((t) => t.id === selectedTeamId);
        if (team) {
            // Update score AND increment dumbCharadesRounds in database
            updateTeam(selectedTeamId, { 
                score: team.score + score.total,
                dumbCharadesRounds: (team.dumbCharadesRounds || 0) + 1
            });
        }
        setLastRoundScore(score);
        resetForNextRound();
    };

    const handleSkip = () => {
        setLastRoundScore({ base: 0, penalty: 0, total: 0, skipped: true });
        resetForNextRound();
    };

    const resetForNextRound = () => {
        setGameState('idle');
        setTimeRemaining(TOTAL_TIME);
        setMethod('action');
    };

    const currentScore = calculateScore();
    const selectedTeam = teams.find((t) => t.id === selectedTeamId);

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
                    <div className="text-6xl mb-4">🎭</div>
                    <h1 className="text-3xl font-bold mb-4">No Teams Yet</h1>
                    <p className="text-gray-400 mb-8">Create teams first to play Dumb Charades.</p>
                    <Link
                        href="/teams"
                        className="px-6 py-3 bg-orange-600 rounded-xl font-bold hover:bg-orange-500"
                    >
                        Go to Teams Setup
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8" style={{ backgroundColor: '#030712', color: '#f9fafb' }}>
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/games" className="text-gray-400 hover:text-white mb-2 inline-block">
                        ← Back to Games
                    </Link>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                        🎭 Dumb Charades
                    </h1>
                    <p className="text-gray-400 mt-1">Act out movies - no speaking allowed!</p>
                </div>

                {/* Last Round Result */}
                {lastRoundScore && (
                    <div className={`mb-6 p-4 rounded-xl border ${lastRoundScore.skipped || lastRoundScore.total === 0
                        ? 'bg-gray-800/50 border-gray-700'
                        : 'bg-green-900/30 border-green-700'
                        }`}>
                        <div className="text-center">
                            {lastRoundScore.skipped ? (
                                <p className="text-gray-400">Round skipped - no points awarded</p>
                            ) : lastRoundScore.total === 0 ? (
                                <p className="text-gray-400">Time's up - no points awarded</p>
                            ) : (
                                <p className="text-green-400">
                                    +{lastRoundScore.total} points added to {selectedTeam?.name}!
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Game Controls Card */}
                <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                    {/* Team Selector */}
                    <div className="mb-6">
                        <label className="block text-gray-400 mb-2 text-sm">Playing Team</label>
                        <select
                            value={selectedTeamId}
                            onChange={(e) => setSelectedTeamId(e.target.value)}
                            disabled={gameState === 'playing'}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl
                                focus:outline-none focus:ring-2 focus:ring-orange-500 text-white
                                disabled:opacity-50"
                        >
                            <option value="">Select a team...</option>
                            {teams.map((team) => (
                                <option key={team.id} value={team.id}>
                                    {team.name} (Score: {team.score})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Timer Display */}
                    <div className="text-center mb-6">
                        <div
                            className={`text-8xl font-mono font-bold mb-2 ${timeRemaining <= 30 ? 'text-red-500' :
                                timeRemaining <= 60 ? 'text-yellow-500' :
                                    'text-white'
                                }`}
                        >
                            {formatTime(timeRemaining)}
                        </div>
                        <div className="text-gray-500 text-sm">
                            {gameState === 'idle' && 'Ready to start'}
                            {gameState === 'playing' && 'Timer running...'}
                            {gameState === 'stopped' && timeRemaining > 0 && 'Timer stopped!'}
                            {gameState === 'stopped' && timeRemaining === 0 && "Time's up!"}
                        </div>
                    </div>

                    {/* Start/Stop Button */}
                    <div className="flex justify-center gap-4 mb-6">
                        {gameState === 'idle' && (
                            <button
                                onClick={handleStart}
                                disabled={!selectedTeamId}
                                className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 rounded-xl
                                    font-bold text-xl hover:from-green-500 hover:to-green-400
                                    disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                ▶ Start Timer
                            </button>
                        )}
                        {gameState === 'playing' && (
                            <button
                                onClick={handleStop}
                                className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-500 rounded-xl
                                    font-bold text-xl hover:from-red-500 hover:to-red-400 transition-all
                                    animate-pulse"
                            >
                                ⏹ Stop Clock
                            </button>
                        )}
                    </div>

                    {/* Method Selection & Score (show when stopped with time remaining) */}
                    {gameState === 'stopped' && timeRemaining > 0 && (
                        <div className="border-t border-gray-800 pt-6">
                            {/* Method Selection */}
                            <div className="mb-6">
                                <label className="block text-gray-400 mb-3 text-sm">How did they guess?</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setMethod('action')}
                                        className={`p-4 rounded-xl border-2 transition-all ${method === 'action'
                                            ? 'border-orange-500 bg-orange-900/30'
                                            : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                                            }`}
                                    >
                                        <div className="text-3xl mb-2">🎬</div>
                                        <div className="font-bold">Action Only</div>
                                        <div className="text-2xl text-orange-400 font-bold">50 pts</div>
                                    </button>
                                    <button
                                        onClick={() => setMethod('letter')}
                                        className={`p-4 rounded-xl border-2 transition-all ${method === 'letter'
                                            ? 'border-orange-500 bg-orange-900/30'
                                            : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                                            }`}
                                    >
                                        <div className="text-3xl mb-2">🔤</div>
                                        <div className="font-bold">Letter-by-Letter</div>
                                        <div className="text-2xl text-orange-400 font-bold">25 pts</div>
                                    </button>
                                </div>
                            </div>

                            {/* Score Breakdown */}
                            <div className="bg-gray-800 rounded-xl p-4 mb-6">
                                <div className="text-center mb-4">
                                    <div className="text-gray-400 text-sm">Final Score</div>
                                    <div className="text-5xl font-bold text-green-400">{currentScore.total}</div>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                                    <div>
                                        <div className="text-gray-500">Base</div>
                                        <div className="font-bold">{currentScore.base}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500">Time</div>
                                        <div className="font-bold">{currentScore.elapsedTime}s</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500">Penalty</div>
                                        <div className="font-bold text-red-400">-{currentScore.penalty}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Confirm/Skip Buttons */}
                            <div className="flex gap-4">
                                <button
                                    onClick={handleSkip}
                                    className="flex-1 px-6 py-3 bg-gray-700 rounded-xl font-medium
                                        hover:bg-gray-600 transition-colors"
                                >
                                    Skip Round
                                </button>
                                <button
                                    onClick={handleConfirmScore}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600
                                        rounded-xl font-bold hover:from-orange-500 hover:to-red-500 transition-all"
                                >
                                    ✓ Confirm Score
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Time's Up - No Points */}
                    {gameState === 'stopped' && timeRemaining === 0 && (
                        <div className="border-t border-gray-800 pt-6 text-center">
                            <div className="text-6xl mb-4">⏰</div>
                            <h3 className="text-2xl font-bold text-red-400 mb-2">Time's Up!</h3>
                            <p className="text-gray-400 mb-6">No points awarded this round</p>
                            <button
                                onClick={resetForNextRound}
                                className="px-8 py-3 bg-gray-700 rounded-xl font-medium hover:bg-gray-600"
                            >
                                Next Round
                            </button>
                        </div>
                    )}
                </div>

                {/* Scoring Rules Reference */}
                <div className="mt-8 bg-gray-900/50 rounded-xl p-4 border border-gray-800">
                    <h3 className="font-bold mb-3 text-gray-300">📋 Scoring Rules</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <div className="text-gray-500 mb-1">Base Points</div>
                            <div>🎬 Action Only: <span className="text-orange-400 font-bold">50 pts</span></div>
                            <div>🔤 Letter-by-Letter: <span className="text-orange-400 font-bold">25 pts</span></div>
                        </div>
                        <div>
                            <div className="text-gray-500 mb-1">Time Penalty</div>
                            <div>0-30s: <span className="text-green-400">Full score</span></div>
                            <div>+20s each: <span className="text-red-400">-5 pts</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
