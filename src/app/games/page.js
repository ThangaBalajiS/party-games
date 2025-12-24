'use client';

import Link from 'next/link';

const GAMES = [
    {
        id: 'popular-song',
        name: 'The Popular Song',
        description: 'Guess the top 3 most streamed songs from an album',
        icon: '🎵',
        color: 'from-pink-600 to-purple-600',
        href: '/games/popular-song',
    },
    {
        id: 'dumb-charades',
        name: 'Dumb Charades',
        description: 'Act out movies without speaking - guess before time runs out!',
        icon: '🎭',
        color: 'from-orange-600 to-red-600',
        href: '/games/dumb-charades',
    },
    {
        id: 'pictionary',
        name: 'Pictionary',
        description: 'Draw and guess - faster guesses earn more points!',
        icon: '🎨',
        color: 'from-blue-600 to-cyan-600',
        href: '/games/pictionary',
    },
];

export default function GamesPage() {
    return (
        <div className="min-h-screen p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
                        Party Games
                    </h1>
                    <p className="text-gray-400 mt-2">Choose a game to play with your teams</p>
                </div>

                {/* Games Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {GAMES.map((game) => (
                        <Link
                            key={game.id}
                            href={game.href}
                            className={`group bg-gradient-to-br ${game.color} rounded-3xl p-8 
                         transition-all hover:scale-[1.02] active:scale-[0.98]
                         shadow-lg hover:shadow-2xl`}
                        >
                            <div className="text-6xl mb-4">{game.icon}</div>
                            <h2 className="text-2xl font-bold mb-2">{game.name}</h2>
                            <p className="text-white/80">{game.description}</p>
                            <div className="mt-4 text-white/60 text-sm group-hover:text-white transition-colors">
                                Click to play →
                            </div>
                        </Link>
                    ))}

                    {/* Coming Soon Placeholder */}
                    <div className="bg-gray-800/50 rounded-3xl p-8 border-2 border-dashed border-gray-700">
                        <div className="text-6xl mb-4 opacity-50">🎲</div>
                        <h2 className="text-2xl font-bold mb-2 text-gray-500">More Coming Soon</h2>
                        <p className="text-gray-600">New games will be added here</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
