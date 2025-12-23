'use client';

import { useState } from 'react';
import { useParty } from '@/context/PartyContext';
import Link from 'next/link';

export default function PopularSongPage() {
    const {
        albums, teams, updateTeam, markAlbumPlayed,
        getSortedSongs, calculateSongScore, getUnplayedAlbums, isLoaded
    } = useParty();

    const [selectedAlbumId, setSelectedAlbumId] = useState(null);
    const [teamAnswers, setTeamAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [roundScores, setRoundScores] = useState({});

    const unplayedAlbums = getUnplayedAlbums();
    const selectedAlbum = albums.find(a => a.id === selectedAlbumId);

    const handleSelectAlbum = (albumId) => {
        setSelectedAlbumId(albumId);
        setShowResults(false);
        setRoundScores({});
        // Initialize empty answers for each team
        const initialAnswers = {};
        teams.forEach(team => {
            initialAnswers[team.id] = ['', '', ''];
        });
        setTeamAnswers(initialAnswers);
    };

    const handleAnswerChange = (teamId, position, songId) => {
        setTeamAnswers(prev => ({
            ...prev,
            [teamId]: prev[teamId].map((ans, i) => i === position ? songId : ans)
        }));
    };

    const handleSubmit = () => {
        if (!selectedAlbum) return;

        const scores = {};
        const sortedSongs = getSortedSongs(selectedAlbumId);
        const correctTop3 = sortedSongs.slice(0, 3);

        teams.forEach(team => {
            const answers = teamAnswers[team.id] || ['', '', ''];
            const score = calculateSongScore(selectedAlbumId, answers);
            scores[team.id] = {
                score,
                answers: answers.map(id => selectedAlbum.songs.find(s => s.id === id)),
                correct: correctTop3,
            };

            // Update team's total score
            updateTeam(team.id, { score: team.score + score });
        });

        setRoundScores(scores);
        setShowResults(true);
        markAlbumPlayed(selectedAlbumId);
    };

    const handleNextRound = () => {
        setSelectedAlbumId(null);
        setShowResults(false);
        setRoundScores({});
        setTeamAnswers({});
    };

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-2xl text-gray-400">Loading...</div>
            </div>
        );
    }

    // No albums added yet
    if (albums.length === 0) {
        return (
            <div className="min-h-screen p-8">
                <div className="max-w-2xl mx-auto text-center py-16">
                    <div className="text-8xl mb-6">🎵</div>
                    <h1 className="text-3xl font-bold mb-4">The Popular Song</h1>
                    <p className="text-gray-400 mb-8">No albums have been added yet. Add albums in the admin area first.</p>
                    <Link
                        href="/games/popular-song/admin"
                        className="px-6 py-3 bg-pink-600 rounded-xl font-bold hover:bg-pink-500"
                    >
                        Go to Admin →
                    </Link>
                </div>
            </div>
        );
    }

    // Album selection screen
    if (!selectedAlbumId) {
        return (
            <div className="min-h-screen p-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <Link href="/games" className="text-gray-400 hover:text-white mb-2 inline-block">
                                ← Back to Games
                            </Link>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
                                🎵 The Popular Song
                            </h1>
                            <p className="text-gray-400 mt-2">Guess the top 3 most streamed songs</p>
                        </div>
                        <Link
                            href="/games/popular-song/admin"
                            className="px-4 py-2 bg-gray-800 rounded-lg text-gray-300 hover:bg-gray-700"
                        >
                            ⚙️ Admin
                        </Link>
                    </div>

                    {/* Album Selection */}
                    <h2 className="text-xl font-bold mb-4">Select an Album to Play</h2>

                    {unplayedAlbums.length === 0 ? (
                        <div className="text-center py-12 bg-gray-900 rounded-2xl border border-gray-800">
                            <div className="text-5xl mb-4">✅</div>
                            <div className="text-xl mb-2">All albums have been played!</div>
                            <p className="text-gray-400 mb-4">Add more albums in the admin area or replay existing ones.</p>
                            <Link
                                href="/games/popular-song/admin"
                                className="text-pink-400 hover:text-pink-300"
                            >
                                Add more albums →
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {unplayedAlbums.map((album) => (
                                <button
                                    key={album.id}
                                    onClick={() => handleSelectAlbum(album.id)}
                                    className="bg-gray-900 rounded-xl p-4 border border-gray-800 hover:border-pink-500 
                             transition-all hover:scale-105 text-left"
                                >
                                    <div className="aspect-square rounded-lg bg-gray-800 overflow-hidden mb-3">
                                        {album.coverArt ? (
                                            <img src={album.coverArt} alt={album.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-4xl">🎵</div>
                                        )}
                                    </div>
                                    <div className="font-medium truncate">{album.name}</div>
                                    <div className="text-xs text-gray-500">{album.songs.length} songs</div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Already Played */}
                    {albums.filter(a => a.played).length > 0 && (
                        <div className="mt-8">
                            <h3 className="text-lg font-bold mb-3 text-gray-500">Already Played</h3>
                            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                {albums.filter(a => a.played).map((album) => (
                                    <button
                                        key={album.id}
                                        onClick={() => handleSelectAlbum(album.id)}
                                        className="bg-gray-900/50 rounded-lg p-2 border border-gray-800 opacity-60 
                               hover:opacity-100 transition-all text-left"
                                    >
                                        <div className="aspect-square rounded-md bg-gray-800 overflow-hidden mb-2">
                                            {album.coverArt ? (
                                                <img src={album.coverArt} alt={album.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-2xl">🎵</div>
                                            )}
                                        </div>
                                        <div className="text-sm font-medium truncate">{album.name}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Play screen
    const sortedSongs = getSortedSongs(selectedAlbumId);

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={handleNextRound}
                        className="text-gray-400 hover:text-white"
                    >
                        ← Back to Selection
                    </button>
                    <Link
                        href="/games/popular-song/admin"
                        className="px-4 py-2 bg-gray-800 rounded-lg text-gray-300 hover:bg-gray-700"
                    >
                        ⚙️ Admin
                    </Link>
                </div>

                {/* Album Display */}
                <div className="text-center mb-8">
                    <div className="inline-block">
                        <div className="w-48 h-48 md:w-64 md:h-64 rounded-2xl bg-gray-800 overflow-hidden mx-auto shadow-2xl">
                            {selectedAlbum.coverArt ? (
                                <img src={selectedAlbum.coverArt} alt={selectedAlbum.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-6xl">🎵</div>
                            )}
                        </div>
                        <h2 className="text-3xl font-bold mt-4">{selectedAlbum.name}</h2>
                        <p className="text-gray-400 mt-1">Rank the top 3 most streamed songs!</p>
                    </div>
                </div>

                {/* Song List for Reference */}
                {!showResults && (
                    <div className="bg-gray-900 rounded-xl p-4 mb-8 border border-gray-800">
                        <h3 className="font-bold mb-3 text-gray-400">Available Songs:</h3>
                        <div className="flex flex-wrap gap-2">
                            {selectedAlbum.songs.map((song) => (
                                <span key={song.id} className="px-3 py-1 bg-gray-800 rounded-full text-sm">
                                    {song.title}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Team Answer Inputs */}
                {!showResults ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {teams.map((team) => (
                                <div
                                    key={team.id}
                                    className="bg-gray-900 rounded-2xl p-6 border-2"
                                    style={{ borderColor: team.color }}
                                >
                                    <h3 className="text-xl font-bold mb-4" style={{ color: team.color }}>
                                        {team.name}
                                    </h3>

                                    <div className="space-y-4">
                                        {[0, 1, 2].map((position) => (
                                            <div key={position}>
                                                <label className="block text-sm text-gray-400 mb-1">
                                                    {position === 0 ? '🥇 1st Place' : position === 1 ? '🥈 2nd Place' : '🥉 3rd Place'}
                                                </label>
                                                <select
                                                    value={teamAnswers[team.id]?.[position] || ''}
                                                    onChange={(e) => handleAnswerChange(team.id, position, e.target.value)}
                                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl 
                                     focus:outline-none focus:ring-2 text-white appearance-none cursor-pointer"
                                                    style={{ '--tw-ring-color': team.color }}
                                                >
                                                    <option value="">Select a song...</option>
                                                    {selectedAlbum.songs.map((song) => (
                                                        <option key={song.id} value={song.id}>
                                                            {song.title}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="text-center">
                            <button
                                onClick={handleSubmit}
                                className="px-12 py-4 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl 
                           font-bold text-xl hover:from-pink-500 hover:to-purple-500
                           transform hover:scale-105 transition-all"
                            >
                                🎯 Check Answers
                            </button>
                        </div>
                    </>
                ) : (
                    /* Results Screen */
                    <>
                        {/* Correct Answers */}
                        <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-2xl p-6 mb-8 border border-yellow-700/50">
                            <h3 className="text-xl font-bold mb-4 text-yellow-400">🏆 Correct Ranking</h3>
                            <div className="grid grid-cols-3 gap-4">
                                {sortedSongs.slice(0, 3).map((song, i) => (
                                    <div key={song.id} className="text-center">
                                        <div className="text-4xl mb-2">
                                            {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                                        </div>
                                        <div className="font-bold">{song.title}</div>
                                        <div className="text-sm text-gray-400">{song.streams.toLocaleString()} streams</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Team Results */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {teams.map((team) => {
                                const result = roundScores[team.id];
                                if (!result) return null;

                                return (
                                    <div
                                        key={team.id}
                                        className="bg-gray-900 rounded-2xl p-6 border-2"
                                        style={{ borderColor: team.color }}
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-xl font-bold" style={{ color: team.color }}>
                                                {team.name}
                                            </h3>
                                            <div className="text-3xl font-bold text-green-400">
                                                +{result.score} pts
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            {result.answers.map((answer, i) => {
                                                const isCorrect = answer?.id === result.correct[i]?.id;
                                                return (
                                                    <div
                                                        key={i}
                                                        className={`flex items-center gap-3 p-3 rounded-lg ${isCorrect ? 'bg-green-900/30' : 'bg-red-900/30'
                                                            }`}
                                                    >
                                                        <span className="text-xl">
                                                            {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                                                        </span>
                                                        <span className="flex-grow">
                                                            {answer?.title || '(not selected)'}
                                                        </span>
                                                        <span className="text-xl">
                                                            {isCorrect ? '✅' : '❌'}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Scoring Guide */}
                        <div className="text-center text-gray-400 mb-8">
                            <div className="text-sm">Scoring: 1 correct = 10 pts | 2 correct = 25 pts | 3 correct = 50 pts</div>
                        </div>

                        <div className="text-center">
                            <button
                                onClick={handleNextRound}
                                className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl 
                           font-bold text-xl hover:from-green-500 hover:to-emerald-500"
                            >
                                Next Round →
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
