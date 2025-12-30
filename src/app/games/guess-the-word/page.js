'use client';

import { useState, useEffect } from 'react';
import { useParty } from '@/context/PartyContext';
import Link from 'next/link';

// Format seconds to MM:SS
const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Calculate score based on correct answers
const calculateScore = (correctCount) => {
    if (correctCount === 5) return 30;
    return correctCount * 5;
};

export default function GuessTheWordPage() {
    const { teams, updateTeam, isLoaded } = useParty();

    // Game state
    const [selectedTeamId, setSelectedTeamId] = useState('');
    const [gameState, setGameState] = useState('select'); // select, ready, playing, stopped
    const [elapsedTime, setElapsedTime] = useState(0);
    const [correctAnswers, setCorrectAnswers] = useState(5);
    const [lastRoundScore, setLastRoundScore] = useState(null);

    const ROUNDS_PER_TEAM = 3;
    const WORDS_PER_ROUND = 5;

    // Timer effect
    useEffect(() => {
        let interval = null;
        if (gameState === 'playing') {
            interval = setInterval(() => {
                setElapsedTime((prev) => prev + 1);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [gameState]);

    const handleSelectTeam = (teamId) => {
        setSelectedTeamId(teamId);
        setGameState('ready');
        setElapsedTime(0);
        setLastRoundScore(null);
        setCorrectAnswers(5);
    };

    const handleStart = () => {
        setGameState('playing');
        setElapsedTime(0);
    };

    const handleStop = () => {
        setGameState('stopped');
    };

    const handleRestart = () => {
        setElapsedTime(0);
        setGameState('playing');
    };

    const handleConfirmScore = () => {
        const score = calculateScore(correctAnswers);
        const team = teams.find((t) => t.id === selectedTeamId);
        
        if (team) {
            // Update score AND increment guessTheWordRounds in database
            updateTeam(selectedTeamId, { 
                score: team.score + score,
                guessTheWordRounds: (team.guessTheWordRounds || 0) + 1
            });
        }

        setLastRoundScore({
            score,
            correctAnswers,
            time: elapsedTime,
        });

        // Reset for next round
        setGameState('ready');
        setElapsedTime(0);
        setCorrectAnswers(5);
    };

    const handleBackToTeams = () => {
        setSelectedTeamId('');
        setGameState('select');
        setLastRoundScore(null);
    };

    const selectedTeam = teams.find((t) => t.id === selectedTeamId);
    // Use guessTheWordRounds from the team data (persisted in DB)
    const teamRoundsPlayed = selectedTeam?.guessTheWordRounds || 0;
    const canPlayMore = teamRoundsPlayed < ROUNDS_PER_TEAM;

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
                    <div className="text-6xl mb-4">💬</div>
                    <h1 className="text-3xl font-bold mb-4">No Teams Yet</h1>
                    <p className="text-gray-400 mb-8">Create teams first to play Guess the Word.</p>
                    <Link
                        href="/teams"
                        className="px-6 py-3 bg-yellow-600 rounded-xl font-bold hover:bg-yellow-500"
                    >
                        Go to Teams Setup
                    </Link>
                </div>
            </div>
        );
    }

    // Team Selection Screen
    if (gameState === 'select') {
        return (
            <div className="min-h-screen p-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <Link href="/games" className="text-gray-400 hover:text-white mb-2 inline-block">
                            ← Back to Games
                        </Link>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
                            💬 Guess the Word
                        </h1>
                        <p className="text-gray-400 mt-2">Select a team to play</p>
                    </div>

                    {/* Team Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {teams.map((team) => {
                            const teamRounds = team.guessTheWordRounds || 0;
                            const remainingRounds = ROUNDS_PER_TEAM - teamRounds;

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
                                        <div className="text-2xl font-bold text-gray-400">
                                            {team.score} pts
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {remainingRounds > 0 ? (
                                            <span className="text-green-400">{remainingRounds} rounds remaining</span>
                                        ) : (
                                            <span className="text-gray-500">All rounds completed</span>
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

    // Game Screen (Ready, Playing, Stopped states)
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
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
                        💬 Guess the Word
                    </h1>
                </div>

                {/* Team Info */}
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
                                Round {teamRoundsPlayed + 1} of {ROUNDS_PER_TEAM}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold">{selectedTeam?.score} pts</div>
                        </div>
                    </div>
                </div>

                {/* Last Round Result */}
                {lastRoundScore && (
                    <div className="mb-6 p-4 rounded-xl border bg-green-900/30 border-green-700">
                        <div className="text-center">
                            <p className="text-green-400">
                                +{lastRoundScore.score} points! ({lastRoundScore.correctAnswers}/{WORDS_PER_ROUND} words in {formatTime(lastRoundScore.time)})
                            </p>
                        </div>
                    </div>
                )}

                {/* Main Game Card */}
                <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                    {/* Scoring Rules - Show in ready state */}
                    {gameState === 'ready' && (
                        <div className="mb-6 bg-gray-800/50 rounded-xl p-4">
                            <h3 className="font-bold mb-3 text-yellow-400">📋 Scoring System</h3>
                            <div className="text-sm space-y-2 text-gray-300">
                                <p>• Call up <strong>two players</strong> from the team</p>
                                <p>• One gives clues, the other guesses <strong>{WORDS_PER_ROUND} words</strong></p>
                                <p>• All {WORDS_PER_ROUND} correct = <span className="text-green-400 font-bold">30 points</span></p>
                                <p>• Less than {WORDS_PER_ROUND} = <span className="text-yellow-400 font-bold">5 points each</span></p>
                            </div>
                        </div>
                    )}

                    {/* Timer Display */}
                    <div className="text-center mb-6">
                        <div className={`text-8xl font-mono font-bold mb-2 ${
                            gameState === 'playing' ? 'text-yellow-400' : 'text-white'
                        }`}>
                            {formatTime(elapsedTime)}
                        </div>
                        <div className="text-gray-500 text-sm">
                            {gameState === 'ready' && 'Ready to start'}
                            {gameState === 'playing' && 'Timer running...'}
                            {gameState === 'stopped' && 'Timer stopped - enter results'}
                        </div>
                    </div>

                    {/* Control Buttons */}
                    <div className="flex justify-center gap-4 mb-6">
                        {gameState === 'ready' && (
                            <>
                                {canPlayMore ? (
                                    <button
                                        onClick={handleStart}
                                        className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 rounded-xl
                                            font-bold text-xl hover:from-green-500 hover:to-green-400 transition-all"
                                    >
                                        ▶ Start Timer
                                    </button>
                                ) : (
                                    <div className="text-center">
                                        <p className="text-gray-400 mb-4">This team has completed all {ROUNDS_PER_TEAM} rounds!</p>
                                        <button
                                            onClick={handleBackToTeams}
                                            className="px-6 py-3 bg-gray-700 rounded-xl font-medium hover:bg-gray-600"
                                        >
                                            Select Another Team
                                        </button>
                                    </div>
                                )}
                            </>
                        )}

                        {gameState === 'playing' && (
                            <>
                                <button
                                    onClick={handleStop}
                                    className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-500 rounded-xl
                                        font-bold text-xl hover:from-red-500 hover:to-red-400 transition-all
                                        animate-pulse"
                                >
                                    ⏹ Stop
                                </button>
                                <button
                                    onClick={handleRestart}
                                    className="px-8 py-4 bg-gray-700 rounded-xl
                                        font-bold text-xl hover:bg-gray-600 transition-all"
                                >
                                    🔄 Restart
                                </button>
                            </>
                        )}
                    </div>

                    {/* Score Entry - Show when stopped */}
                    {gameState === 'stopped' && (
                        <div className="border-t border-gray-800 pt-6">
                            <h3 className="text-center text-gray-400 mb-4">How many words were guessed correctly?</h3>
                            
                            {/* Answer Selection */}
                            <div className="flex justify-center gap-3 mb-6">
                                {[0, 1, 2, 3, 4, 5].map((num) => (
                                    <button
                                        key={num}
                                        onClick={() => setCorrectAnswers(num)}
                                        className={`w-14 h-14 rounded-xl font-bold text-xl transition-all ${
                                            correctAnswers === num
                                                ? 'bg-yellow-600 text-white scale-110'
                                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                        }`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>

                            {/* Score Preview */}
                            <div className="bg-gray-800 rounded-xl p-4 mb-6 text-center">
                                <div className="text-gray-400 text-sm mb-1">Score for this round</div>
                                <div className="text-4xl font-bold text-green-400">
                                    {calculateScore(correctAnswers)} pts
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                    {correctAnswers === 5 ? (
                                        <span className="text-green-400">🎉 All {WORDS_PER_ROUND} words correct!</span>
                                    ) : (
                                        <span>{correctAnswers} × 5 = {correctAnswers * 5} pts</span>
                                    )}
                                </div>
                            </div>

                            {/* Confirm Buttons */}
                            <div className="flex gap-4">
                                <button
                                    onClick={handleRestart}
                                    className="flex-1 px-6 py-3 bg-gray-700 rounded-xl font-medium
                                        hover:bg-gray-600 transition-colors"
                                >
                                    🔄 Try Again
                                </button>
                                <button
                                    onClick={handleConfirmScore}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-600 to-amber-600
                                        rounded-xl font-bold hover:from-yellow-500 hover:to-amber-500 transition-all"
                                >
                                    ✓ Confirm Score
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Round Progress */}
                <div className="mt-6 flex justify-center gap-2">
                    {Array.from({ length: ROUNDS_PER_TEAM }).map((_, i) => (
                        <div
                            key={i}
                            className={`w-4 h-4 rounded-full ${
                                i < teamRoundsPlayed
                                    ? 'bg-yellow-500'
                                    : i === teamRoundsPlayed
                                    ? 'bg-yellow-500/50 ring-2 ring-yellow-500'
                                    : 'bg-gray-700'
                            }`}
                        />
                    ))}
                </div>
                <p className="text-center text-gray-500 text-sm mt-2">
                    {teamRoundsPlayed}/{ROUNDS_PER_TEAM} rounds completed
                </p>
            </div>
        </div>
    );
}
