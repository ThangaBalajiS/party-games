'use client';

import { useState, useRef } from 'react';
import { useParty } from '@/context/PartyContext';
import Link from 'next/link';

export default function PlayersPage() {
    const { players, addPlayer, deletePlayer, isLoaded } = useParty();
    const [name, setName] = useState('');
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const fileInputRef = useRef(null);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhoto(reader.result);
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        addPlayer({ name: name.trim(), photo });
        setName('');
        setPhoto(null);
        setPhotoPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to remove this player?')) {
            deletePlayer(id);
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
        <div className="min-h-screen p-8">
            {/* Header */}
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Link href="/" className="text-gray-400 hover:text-white mb-2 inline-block">
                            ← Back to Home
                        </Link>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                            Add Players
                        </h1>
                        <p className="text-gray-400 mt-2">Add everyone who&apos;s at the party</p>
                    </div>
                    <div className="text-right">
                        <div className="text-5xl font-bold text-purple-400">{players.length}</div>
                        <div className="text-gray-400">Players Added</div>
                    </div>
                </div>

                {/* Add Player Form */}
                <form onSubmit={handleSubmit} className="bg-gray-900 rounded-2xl p-6 mb-8 border border-gray-800">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Photo Upload */}
                        <div className="flex-shrink-0">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="w-32 h-32 rounded-2xl bg-gray-800 border-2 border-dashed border-gray-600 
                           flex items-center justify-center cursor-pointer hover:border-purple-500 
                           transition-colors overflow-hidden"
                            >
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center">
                                        <div className="text-3xl mb-1">📷</div>
                                        <div className="text-xs text-gray-400">Add Photo</div>
                                    </div>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                className="hidden"
                            />
                        </div>

                        {/* Name Input */}
                        <div className="flex-grow flex flex-col justify-center">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter player name..."
                                className="w-full px-6 py-4 text-2xl bg-gray-800 border border-gray-700 rounded-xl 
                           focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                           placeholder-gray-500"
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="flex items-center">
                            <button
                                type="submit"
                                disabled={!name.trim()}
                                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl
                           font-bold text-xl hover:from-purple-500 hover:to-pink-500
                           disabled:opacity-50 disabled:cursor-not-allowed transition-all
                           transform hover:scale-105 active:scale-95"
                            >
                                Add Player
                            </button>
                        </div>
                    </div>
                </form>

                {/* Players Grid */}
                {players.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                        <div className="text-6xl mb-4">👥</div>
                        <div className="text-xl">No players added yet</div>
                        <div className="text-sm mt-2">Add players using the form above</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {players.map((player) => (
                            <div
                                key={player.id}
                                className="bg-gray-900 rounded-2xl p-4 border border-gray-800 hover:border-gray-700 
                           transition-all group relative"
                            >
                                {/* Delete Button */}
                                <button
                                    onClick={() => handleDelete(player.id)}
                                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 rounded-full 
                             opacity-0 group-hover:opacity-100 transition-opacity
                             flex items-center justify-center text-white font-bold
                             hover:bg-red-500 transform hover:scale-110"
                                >
                                    ×
                                </button>

                                {/* Player Photo */}
                                <div className="w-full aspect-square rounded-xl bg-gray-800 overflow-hidden mb-3">
                                    {player.photo ? (
                                        <img src={player.photo} alt={player.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl">
                                            👤
                                        </div>
                                    )}
                                </div>

                                {/* Player Name */}
                                <div className="text-center font-medium truncate" title={player.name}>
                                    {player.name}
                                </div>

                                {/* Captain Badge */}
                                {player.isCaptain && (
                                    <div className="text-center mt-1">
                                        <span className="text-xs bg-yellow-600 text-yellow-100 px-2 py-0.5 rounded-full">
                                            👑 Captain
                                        </span>
                                    </div>
                                )}

                                {/* Team Badge */}
                                {player.teamId && !player.isCaptain && (
                                    <div className="text-center mt-1">
                                        <span className="text-xs bg-purple-600 text-purple-100 px-2 py-0.5 rounded-full">
                                            In Team
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Next Step CTA */}
                {players.length >= 4 && (
                    <div className="fixed bottom-8 right-8">
                        <Link
                            href="/teams"
                            className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl
                         font-bold text-xl hover:from-green-500 hover:to-emerald-500
                         transition-all transform hover:scale-105 shadow-2xl flex items-center gap-2"
                        >
                            Create Teams →
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
