'use client';

import { useParty } from '@/context/PartyContext';
import Link from 'next/link';

export default function HomePage() {
  const { players, teams, settings, resetAll, resetAuction, getUnsoldPlayers, isLoaded } = useParty();

  const unsoldPlayers = getUnsoldPlayers();
  const captains = players.filter(p => p.isCaptain);

  const handleResetAll = () => {
    if (confirm('⚠️ This will delete ALL data (players, teams, auction results). Are you sure?')) {
      resetAll();
    }
  };

  const handleResetAuction = () => {
    if (confirm('This will reset the auction (keep players and teams, but unsell all players). Continue?')) {
      resetAuction();
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-12 pt-8">
          <h1 className="text-5xl md:text-7xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400 bg-clip-text text-transparent">
              Buffaloes New Year Party
            </span>
          </h1>
          <p className="text-xl text-gray-400">
            Team Auction & Scoreboard
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-gray-900 rounded-2xl p-6 text-center border border-gray-800">
            <div className="text-4xl font-bold text-purple-400">{players.length}</div>
            <div className="text-gray-400 mt-1">Players</div>
          </div>
          <div className="bg-gray-900 rounded-2xl p-6 text-center border border-gray-800">
            <div className="text-4xl font-bold text-blue-400">{teams.length}</div>
            <div className="text-gray-400 mt-1">Teams</div>
          </div>
          <div className="bg-gray-900 rounded-2xl p-6 text-center border border-gray-800">
            <div className="text-4xl font-bold text-yellow-400">{captains.length}</div>
            <div className="text-gray-400 mt-1">Captains</div>
          </div>
          <div className="bg-gray-900 rounded-2xl p-6 text-center border border-gray-800">
            <div className="text-4xl font-bold text-orange-400">{unsoldPlayers.length}</div>
            <div className="text-gray-400 mt-1">Unsold</div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Add Players */}
          <Link
            href="/players"
            className="group bg-gradient-to-br from-purple-900 to-purple-950 rounded-3xl p-8 
                       border border-purple-700 hover:border-purple-500 transition-all
                       hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="text-5xl mb-4">👥</div>
            <h2 className="text-2xl font-bold mb-2">Add Players</h2>
            <p className="text-gray-400">Upload photos and add party guests</p>
            {players.length > 0 && (
              <div className="mt-4 text-purple-400 text-sm">
                {players.length} players added
              </div>
            )}
          </Link>

          {/* Create Teams */}
          <Link
            href="/teams"
            className="group bg-gradient-to-br from-blue-900 to-blue-950 rounded-3xl p-8 
                       border border-blue-700 hover:border-blue-500 transition-all
                       hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="text-5xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold mb-2">Create Teams</h2>
            <p className="text-gray-400">Set up teams and assign captains</p>
            {teams.length > 0 && (
              <div className="mt-4 text-blue-400 text-sm">
                {teams.length} teams • {captains.length} captains
              </div>
            )}
          </Link>

          {/* Auction */}
          <Link
            href="/auction"
            className={`group bg-gradient-to-br from-orange-900 to-red-950 rounded-3xl p-8 
                       border transition-all hover:scale-[1.02] active:scale-[0.98]
                       ${teams.length >= 2 && captains.length >= 2
                ? 'border-orange-700 hover:border-orange-500'
                : 'border-gray-700 opacity-60'}`}
          >
            <div className="text-5xl mb-4">🔨</div>
            <h2 className="text-2xl font-bold mb-2">Player Auction</h2>
            <p className="text-gray-400">
              {teams.length >= 2 && captains.length >= 2
                ? 'Bid on players for your team!'
                : 'Need 2+ teams with captains first'}
            </p>
            {settings.auctionStatus === 'completed' && (
              <div className="mt-4 text-green-400 text-sm">
                ✓ Auction completed
              </div>
            )}
            {settings.auctionStatus !== 'completed' && unsoldPlayers.length > 0 && (
              <div className="mt-4 text-orange-400 text-sm">
                {unsoldPlayers.length} players to auction
              </div>
            )}
          </Link>

          {/* Scoreboard */}
          <Link
            href="/scoreboard"
            className={`group bg-gradient-to-br from-green-900 to-emerald-950 rounded-3xl p-8 
                       border transition-all hover:scale-[1.02] active:scale-[0.98]
                       ${teams.length >= 1
                ? 'border-green-700 hover:border-green-500'
                : 'border-gray-700 opacity-60'}`}
          >
            <div className="text-5xl mb-4">📊</div>
            <h2 className="text-2xl font-bold mb-2">Scoreboard</h2>
            <p className="text-gray-400">Track scores during games</p>
            {teams.length > 0 && (
              <div className="mt-4 text-green-400 text-sm">
                {teams.map(t => `${t.name}: ${t.score}`).join(' • ')}
              </div>
            )}
          </Link>
        </div>

        {/* Quick Status */}
        {teams.length > 0 && (
          <div className="bg-gray-900 rounded-3xl p-6 border border-gray-800 mb-8">
            <h3 className="text-xl font-bold mb-4">Teams Overview</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map((team) => {
                const captain = players.find(p => p.id === team.captainId);
                const teamPlayerCount = players.filter(p => p.teamId === team.id).length;

                return (
                  <div
                    key={team.id}
                    className="p-4 rounded-xl bg-gray-800 border-l-4"
                    style={{ borderLeftColor: team.color }}
                  >
                    <div className="font-bold" style={{ color: team.color }}>{team.name}</div>
                    <div className="text-sm text-gray-400 mt-1">
                      {captain ? `👑 ${captain.name}` : 'No captain'}
                    </div>
                    <div className="flex items-center justify-between mt-2 text-sm">
                      <span className="text-gray-400">{teamPlayerCount} members</span>
                      <span className="text-green-400">₹{team.budget}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reset Options */}
        <div className="flex flex-wrap gap-4 justify-center pt-8 border-t border-gray-800">
          {settings.auctionStatus !== 'pending' && (
            <button
              onClick={handleResetAuction}
              className="px-6 py-3 bg-yellow-900/30 border border-yellow-700 rounded-xl
                         text-yellow-400 hover:bg-yellow-900/50 transition-colors"
            >
              🔄 Reset Auction
            </button>
          )}
          <button
            onClick={handleResetAll}
            className="px-6 py-3 bg-red-900/30 border border-red-700 rounded-xl
                       text-red-400 hover:bg-red-900/50 transition-colors"
          >
            🗑️ Reset All Data
          </button>
        </div>
      </div>
    </div>
  );
}
