'use client';

import { useState } from 'react';
import { useParty } from '@/context/PartyContext';
import { formatPriceWithSymbol } from '@/lib/formatPrice';
import Link from 'next/link';

const TEAM_COLORS = [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Green', value: '#22C55E' },
    { name: 'Purple', value: '#A855F7' },
    { name: 'Orange', value: '#F97316' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Cyan', value: '#06B6D4' },
    { name: 'Yellow', value: '#EAB308' },
];

export default function TeamsPage() {
    const {
        players, teams, addTeam, updateTeam, deleteTeam, assignCaptain,
        getAvailableCaptains, isLoaded, settings, updateSettings
    } = useParty();

    const [teamName, setTeamName] = useState('');
    const [teamColor, setTeamColor] = useState(TEAM_COLORS[0].value);
    const [teamBudget, setTeamBudget] = useState(1000);
    const [selectingCaptainFor, setSelectingCaptainFor] = useState(null);

    const handleAddTeam = (e) => {
        e.preventDefault();
        if (!teamName.trim()) return;

        addTeam({ name: teamName.trim(), color: teamColor, budget: teamBudget });
        setTeamName('');
        // Cycle to next color
        const currentIndex = TEAM_COLORS.findIndex(c => c.value === teamColor);
        setTeamColor(TEAM_COLORS[(currentIndex + 1) % TEAM_COLORS.length].value);
    };

    const handleDeleteTeam = (id) => {
        if (confirm('Are you sure you want to delete this team?')) {
            deleteTeam(id);
        }
    };

    const availableCaptains = getAvailableCaptains();

    const getCaptain = (captainId) => {
        return players.find(p => p.id === captainId);
    };

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-2xl text-gray-400">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Link href="/" className="text-gray-400 hover:text-white mb-2 inline-block">
                            ← Back to Home
                        </Link>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
                            Create Teams
                        </h1>
                        <p className="text-gray-400 mt-2">Set up teams and assign captains</p>
                    </div>
                    <div className="text-right">
                        <div className="text-5xl font-bold text-blue-400">{teams.length}</div>
                        <div className="text-gray-400">Teams Created</div>
                    </div>
                </div>

                {/* Settings */}
                <div className="bg-gray-900 rounded-2xl p-6 mb-8 border border-gray-800">
                    <h2 className="text-xl font-bold mb-4">Auction Settings</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-400 mb-2">Base Price per Player</label>
                            <input
                                type="number"
                                value={settings.basePrice}
                                onChange={(e) => updateSettings({ basePrice: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl 
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2">Bid Increment</label>
                            <input
                                type="number"
                                value={settings.bidIncrement}
                                onChange={(e) => updateSettings({ bidIncrement: parseInt(e.target.value) || 10 })}
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl 
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Add Team Form */}
                <form onSubmit={handleAddTeam} className="bg-gray-900 rounded-2xl p-6 mb-8 border border-gray-800">
                    <h2 className="text-xl font-bold mb-4">Add New Team</h2>
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Color Selector */}
                        <div>
                            <label className="block text-gray-400 mb-2 text-sm">Color</label>
                            <div className="flex gap-2">
                                {TEAM_COLORS.map((color) => (
                                    <button
                                        key={color.value}
                                        type="button"
                                        onClick={() => setTeamColor(color.value)}
                                        className={`w-10 h-10 rounded-full transition-transform ${teamColor === color.value ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'
                                            }`}
                                        style={{ backgroundColor: color.value }}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Team Name */}
                        <div className="flex-grow">
                            <label className="block text-gray-400 mb-2 text-sm">Team Name</label>
                            <input
                                type="text"
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                                placeholder="Enter team name..."
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl 
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Budget */}
                        <div>
                            <label className="block text-gray-400 mb-2 text-sm">Budget</label>
                            <input
                                type="number"
                                value={teamBudget}
                                onChange={(e) => setTeamBudget(parseInt(e.target.value) || 0)}
                                className="w-32 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl 
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Submit */}
                        <div className="flex items-end">
                            <button
                                type="submit"
                                disabled={!teamName.trim()}
                                className="px-6 py-3 bg-blue-600 rounded-xl font-bold
                           hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed
                           transition-all transform hover:scale-105"
                            >
                                Add Team
                            </button>
                        </div>
                    </div>
                </form>

                {/* Teams List */}
                {teams.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                        <div className="text-6xl mb-4">🏆</div>
                        <div className="text-xl">No teams created yet</div>
                        <div className="text-sm mt-2">Add teams using the form above</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {teams.map((team) => {
                            const captain = getCaptain(team.captainId);
                            return (
                                <div
                                    key={team.id}
                                    className="bg-gray-900 rounded-2xl p-6 border-2 relative group"
                                    style={{ borderColor: team.color }}
                                >
                                    {/* Delete Button */}
                                    <button
                                        onClick={() => handleDeleteTeam(team.id)}
                                        className="absolute -top-3 -right-3 w-8 h-8 bg-red-600 rounded-full 
                               opacity-0 group-hover:opacity-100 transition-opacity
                               flex items-center justify-center text-white font-bold
                               hover:bg-red-500"
                                    >
                                        ×
                                    </button>

                                    {/* Team Color Bar */}
                                    <div
                                        className="absolute top-0 left-0 right-0 h-2 rounded-t-xl"
                                        style={{ backgroundColor: team.color }}
                                    />

                                    {/* Team Name */}
                                    <h3 className="text-2xl font-bold mt-2" style={{ color: team.color }}>
                                        {team.name}
                                    </h3>

                                    {/* Budget */}
                                    <div className="mt-2 text-gray-400">
                                        Budget: <span className="text-white font-bold">₹{team.budget}</span>
                                    </div>

                                    {/* Captain Section */}
                                    <div className="mt-4 pt-4 border-t border-gray-700">
                                        <div className="text-sm text-gray-400 mb-2">Captain</div>
                                        {captain ? (
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden">
                                                    {captain.photo ? (
                                                        <img src={captain.photo} alt={captain.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-xl">👤</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold">{captain.name}</div>
                                                    <div className="text-xs text-yellow-400">
                                                        👑 Team Captain 
                                                        {captain.soldPrice && <span className="text-green-400 ml-1">({formatPriceWithSymbol(captain.soldPrice)})</span>}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setSelectingCaptainFor(team.id)}
                                                    className="ml-auto text-gray-400 hover:text-white text-sm"
                                                >
                                                    Change
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setSelectingCaptainFor(team.id)}
                                                className="w-full py-3 bg-gray-800 rounded-xl text-gray-400 
                                   hover:bg-gray-700 hover:text-white transition-colors"
                                            >
                                                + Assign Captain
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Captain Selection Modal */}
                {selectingCaptainFor && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold">Select Captain</h2>
                                <button
                                    onClick={() => setSelectingCaptainFor(null)}
                                    className="text-gray-400 hover:text-white text-2xl"
                                >
                                    ×
                                </button>
                            </div>

                            {availableCaptains.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <div className="text-4xl mb-2">😢</div>
                                    <div>No available players</div>
                                    <div className="text-sm mt-2">
                                        <Link href="/players" className="text-blue-400 hover:underline">
                                            Add more players first
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {availableCaptains.map((player) => (
                                        <button
                                            key={player.id}
                                            onClick={() => {
                                                assignCaptain(selectingCaptainFor, player.id);
                                                setSelectingCaptainFor(null);
                                            }}
                                            className="p-4 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors"
                                        >
                                            <div className="w-16 h-16 rounded-full bg-gray-700 mx-auto mb-2 overflow-hidden">
                                                {player.photo ? (
                                                    <img src={player.photo} alt={player.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>
                                                )}
                                            </div>
                                            <div className="text-center font-medium truncate">
                                                {player.name}
                                                {player.soldPrice && (
                                                    <div className="text-xs text-green-400">({formatPriceWithSymbol(player.soldPrice)})</div>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Next Step CTA */}
                {teams.length >= 2 && teams.every(t => t.captainId) && (
                    <div className="fixed bottom-8 right-8">
                        <Link
                            href="/auction"
                            className="px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl
                         font-bold text-xl hover:from-orange-500 hover:to-red-500
                         transition-all transform hover:scale-105 shadow-2xl flex items-center gap-2"
                        >
                            Start Auction 🔨
                        </Link>
                    </div>
                )}

                {/* Warning if not ready */}
                {teams.length > 0 && teams.length < 2 && (
                    <div className="mt-8 p-4 bg-yellow-900/30 border border-yellow-700 rounded-xl text-yellow-300">
                        ⚠️ You need at least 2 teams to start the auction
                    </div>
                )}

                {teams.length >= 2 && !teams.every(t => t.captainId) && (
                    <div className="mt-8 p-4 bg-yellow-900/30 border border-yellow-700 rounded-xl text-yellow-300">
                        ⚠️ All teams need a captain before starting the auction
                    </div>
                )}
            </div>
        </div>
    );
}
