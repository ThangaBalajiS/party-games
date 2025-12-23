'use client';

import { useState, useEffect } from 'react';
import { useParty } from '@/context/PartyContext';
import Link from 'next/link';

export default function AuctionPage() {
    const {
        players, teams, settings,
        sellPlayer, updateSettings, getUnsoldPlayers, getTeamPlayers,
        isLoaded
    } = useParty();

    const [currentBid, setCurrentBid] = useState(0);
    const [highestBidder, setHighestBidder] = useState(null);
    const [showSoldAnimation, setShowSoldAnimation] = useState(false);
    const [soldToTeam, setSoldToTeam] = useState(null);

    const unsoldPlayers = getUnsoldPlayers();
    const currentPlayer = unsoldPlayers[settings.currentPlayerIndex] || unsoldPlayers[0];

    // Initialize bid when player changes
    useEffect(() => {
        setCurrentBid(settings.basePrice);
        setHighestBidder(null);
    }, [currentPlayer?.id, settings.basePrice]);

    const handleBid = (teamId) => {
        const team = teams.find(t => t.id === teamId);
        if (!team) return;

        const newBid = highestBidder ? currentBid + settings.bidIncrement : settings.basePrice;

        // Check if team has enough budget
        if (newBid > team.budget) {
            alert(`${team.name} doesn't have enough budget! (₹${team.budget} remaining)`);
            return;
        }

        setCurrentBid(newBid);
        setHighestBidder(teamId);
    };

    const handleSold = () => {
        if (!highestBidder || !currentPlayer) return;

        const winningTeam = teams.find(t => t.id === highestBidder);
        setSoldToTeam(winningTeam);
        setShowSoldAnimation(true);

        // Sell the player
        sellPlayer(currentPlayer.id, highestBidder, currentBid);

        // Move to next player after animation
        setTimeout(() => {
            setShowSoldAnimation(false);
            setSoldToTeam(null);
            setCurrentBid(settings.basePrice);
            setHighestBidder(null);
        }, 2000);
    };

    const handleSkip = () => {
        // Move current player to end of unsold list by updating index
        updateSettings({
            currentPlayerIndex: (settings.currentPlayerIndex + 1) % Math.max(1, unsoldPlayers.length)
        });
        setCurrentBid(settings.basePrice);
        setHighestBidder(null);
    };

    const handleFinishAuction = () => {
        updateSettings({ auctionStatus: 'completed' });
    };

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-2xl text-gray-400">Loading...</div>
            </div>
        );
    }

    // Check if ready for auction
    if (teams.length < 2) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h1 className="text-3xl font-bold mb-4">Not Ready for Auction</h1>
                    <p className="text-gray-400 mb-8">You need at least 2 teams with captains to start the auction.</p>
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

    // Auction completed
    if (unsoldPlayers.length === 0 || settings.auctionStatus === 'completed') {
        return (
            <div className="min-h-screen p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="text-8xl mb-4">🎉</div>
                        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                            Auction Complete!
                        </h1>
                        <p className="text-gray-400">All players have been assigned to teams</p>
                    </div>

                    {/* Final Teams */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {teams.map((team) => {
                            const teamPlayers = getTeamPlayers(team.id);
                            const captain = players.find(p => p.id === team.captainId);

                            return (
                                <div
                                    key={team.id}
                                    className="bg-gray-900 rounded-2xl p-6 border-2"
                                    style={{ borderColor: team.color }}
                                >
                                    <div
                                        className="text-2xl font-bold mb-4"
                                        style={{ color: team.color }}
                                    >
                                        {team.name}
                                    </div>

                                    <div className="text-gray-400 mb-4">
                                        Remaining Budget: <span className="text-white font-bold">₹{team.budget}</span>
                                    </div>

                                    <div className="space-y-2">
                                        {/* Captain */}
                                        {captain && (
                                            <div className="flex items-center gap-3 p-2 bg-yellow-900/30 rounded-lg">
                                                <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
                                                    {captain.photo ? (
                                                        <img src={captain.photo} alt={captain.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">👤</div>
                                                    )}
                                                </div>
                                                <div className="flex-grow">
                                                    <div className="font-medium">{captain.name}</div>
                                                    <div className="text-xs text-yellow-400">👑 Captain</div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Team Players */}
                                        {teamPlayers.filter(p => !p.isCaptain).map((player) => (
                                            <div key={player.id} className="flex items-center gap-3 p-2 bg-gray-800 rounded-lg">
                                                <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
                                                    {player.photo ? (
                                                        <img src={player.photo} alt={player.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">👤</div>
                                                    )}
                                                </div>
                                                <div className="flex-grow">
                                                    <div className="font-medium">{player.name}</div>
                                                </div>
                                                <div className="text-green-400 font-bold">₹{player.soldPrice}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex justify-center gap-4 mt-8">
                        <Link
                            href="/scoreboard"
                            className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl
                         font-bold text-xl hover:from-green-500 hover:to-emerald-500"
                        >
                            Go to Scoreboard →
                        </Link>
                        <Link
                            href="/"
                            className="px-8 py-4 bg-gray-700 rounded-xl font-bold text-xl hover:bg-gray-600"
                        >
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-8 relative overflow-hidden">
            {/* Sold Animation Overlay */}
            {showSoldAnimation && soldToTeam && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
                    <div className="text-center animate-bounce">
                        <div className="text-8xl mb-4">🔨</div>
                        <div className="text-6xl font-bold text-white mb-2">SOLD!</div>
                        <div className="text-3xl" style={{ color: soldToTeam.color }}>
                            to {soldToTeam.name}
                        </div>
                        <div className="text-4xl font-bold text-green-400 mt-4">
                            ₹{currentBid}
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <Link href="/" className="text-gray-400 hover:text-white mb-2 inline-block">
                            ← Back to Home
                        </Link>
                        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                            Player Auction
                        </h1>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-orange-400">{unsoldPlayers.length}</div>
                        <div className="text-gray-400 text-sm">Players Left</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Current Player - Main Focus */}
                    <div className="lg:col-span-2">
                        <div className="bg-gray-900 rounded-3xl p-8 border border-gray-700 relative">
                            {currentPlayer && (
                                <>
                                    {/* Player Photo */}
                                    <div className="flex justify-center mb-6">
                                        <div className="w-48 h-48 md:w-64 md:h-64 rounded-3xl bg-gray-800 overflow-hidden shadow-2xl">
                                            {currentPlayer.photo ? (
                                                <img
                                                    src={currentPlayer.photo}
                                                    alt={currentPlayer.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-8xl">
                                                    👤
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Player Name */}
                                    <div className="text-center mb-6">
                                        <h2 className="text-4xl md:text-5xl font-bold">{currentPlayer.name}</h2>
                                    </div>

                                    {/* Current Bid Display */}
                                    <div className="text-center mb-8">
                                        <div className="text-gray-400 mb-2">Current Bid</div>
                                        <div className="text-6xl md:text-7xl font-bold text-green-400">
                                            ₹{currentBid}
                                        </div>
                                        {highestBidder && (
                                            <div className="mt-2 text-xl" style={{ color: teams.find(t => t.id === highestBidder)?.color }}>
                                                by {teams.find(t => t.id === highestBidder)?.name}
                                            </div>
                                        )}
                                    </div>

                                    {/* Team Bid Buttons */}
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        {teams.map((team) => {
                                            const isHighestBidder = highestBidder === team.id;
                                            const nextBid = highestBidder ? currentBid + settings.bidIncrement : settings.basePrice;
                                            const canAfford = team.budget >= nextBid;

                                            return (
                                                <button
                                                    key={team.id}
                                                    onClick={() => handleBid(team.id)}
                                                    disabled={!canAfford || isHighestBidder}
                                                    className={`p-6 rounded-2xl font-bold text-xl transition-all transform 
                                     ${isHighestBidder
                                                            ? 'ring-4 ring-white scale-105'
                                                            : 'hover:scale-105 active:scale-95'}
                                     ${!canAfford
                                                            ? 'opacity-50 cursor-not-allowed'
                                                            : ''}
                                     `}
                                                    style={{
                                                        backgroundColor: team.color,
                                                        opacity: !canAfford ? 0.5 : 1
                                                    }}
                                                >
                                                    <div>{team.name}</div>
                                                    <div className="text-sm opacity-80 mt-1">
                                                        Budget: ₹{team.budget}
                                                    </div>
                                                    {!isHighestBidder && canAfford && (
                                                        <div className="text-sm mt-2 bg-black/30 rounded-lg py-1">
                                                            Bid ₹{nextBid}
                                                        </div>
                                                    )}
                                                    {isHighestBidder && (
                                                        <div className="text-sm mt-2">
                                                            ✓ Highest Bidder
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-4">
                                        <button
                                            onClick={handleSkip}
                                            className="flex-1 py-4 bg-gray-700 rounded-xl font-bold text-lg
                                 hover:bg-gray-600 transition-colors"
                                        >
                                            Skip Player
                                        </button>
                                        <button
                                            onClick={handleSold}
                                            disabled={!highestBidder}
                                            className="flex-1 py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl 
                                 font-bold text-lg hover:from-green-500 hover:to-emerald-500
                                 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            🔨 SOLD!
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Sidebar - Queue & Teams */}
                    <div className="space-y-6">
                        {/* Upcoming Players */}
                        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-700">
                            <h3 className="font-bold text-lg mb-4 text-gray-300">Up Next</h3>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {unsoldPlayers.slice(1, 6).map((player, index) => (
                                    <div key={player.id} className="flex items-center gap-3 p-2 bg-gray-800 rounded-lg">
                                        <div className="text-gray-500 w-6">{index + 2}</div>
                                        <div className="w-10 h-10 rounded-lg bg-gray-700 overflow-hidden">
                                            {player.photo ? (
                                                <img src={player.photo} alt={player.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">👤</div>
                                            )}
                                        </div>
                                        <div className="font-medium truncate">{player.name}</div>
                                    </div>
                                ))}
                                {unsoldPlayers.length <= 1 && (
                                    <div className="text-gray-500 text-center py-4">No more players</div>
                                )}
                            </div>
                        </div>

                        {/* Team Status */}
                        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-700">
                            <h3 className="font-bold text-lg mb-4 text-gray-300">Team Status</h3>
                            <div className="space-y-3">
                                {teams.map((team) => {
                                    const teamPlayers = getTeamPlayers(team.id);
                                    return (
                                        <div key={team.id} className="p-3 bg-gray-800 rounded-xl">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="font-bold" style={{ color: team.color }}>{team.name}</div>
                                                <div className="text-green-400 font-bold">₹{team.budget}</div>
                                            </div>
                                            <div className="text-sm text-gray-400">
                                                {teamPlayers.length} players
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Finish Auction */}
                        {unsoldPlayers.length <= 3 && (
                            <button
                                onClick={handleFinishAuction}
                                className="w-full py-4 bg-gray-700 rounded-xl font-bold hover:bg-gray-600"
                            >
                                End Auction Early
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
