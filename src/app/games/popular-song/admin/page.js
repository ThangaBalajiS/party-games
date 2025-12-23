'use client';

import { useState, useRef } from 'react';
import { useParty } from '@/context/PartyContext';
import Link from 'next/link';

export default function PopularSongAdminPage() {
    const { albums, addAlbum, updateAlbum, deleteAlbum, isLoaded } = useParty();

    const [albumName, setAlbumName] = useState('');
    const [coverArt, setCoverArt] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);
    const [songs, setSongs] = useState([{ title: '', streams: '' }]);
    const [editingAlbum, setEditingAlbum] = useState(null);
    const fileInputRef = useRef(null);

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverArt(reader.result);
                setCoverPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const addSongRow = () => {
        setSongs([...songs, { title: '', streams: '' }]);
    };

    const updateSongRow = (index, field, value) => {
        const newSongs = [...songs];
        newSongs[index][field] = value;
        setSongs(newSongs);
    };

    const removeSongRow = (index) => {
        if (songs.length > 1) {
            setSongs(songs.filter((_, i) => i !== index));
        }
    };

    const resetForm = () => {
        setAlbumName('');
        setCoverArt(null);
        setCoverPreview(null);
        setSongs([{ title: '', streams: '' }]);
        setEditingAlbum(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!albumName.trim()) return;

        const validSongs = songs
            .filter(s => s.title.trim() && s.streams)
            .map((s, i) => ({
                id: `song-${Date.now()}-${i}`,
                title: s.title.trim(),
                streams: parseInt(s.streams) || 0,
            }));

        if (validSongs.length < 3) {
            alert('Please add at least 3 songs with stream counts');
            return;
        }

        if (editingAlbum) {
            updateAlbum(editingAlbum.id, {
                name: albumName.trim(),
                coverArt,
                songs: validSongs,
            });
        } else {
            addAlbum({
                name: albumName.trim(),
                coverArt,
                songs: validSongs,
            });
        }

        resetForm();
    };

    const handleEdit = (album) => {
        setEditingAlbum(album);
        setAlbumName(album.name);
        setCoverArt(album.coverArt);
        setCoverPreview(album.coverArt);
        setSongs(album.songs.map(s => ({ title: s.title, streams: s.streams.toString() })));
    };

    const handleDelete = (id) => {
        if (confirm('Delete this album?')) {
            deleteAlbum(id);
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
        <div className="min-h-screen p-8" style={{ backgroundColor: '#030712', color: '#f9fafb' }}>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Link href="/games/popular-song" className="text-gray-400 hover:text-white mb-2 inline-block">
                            ← Back to Game
                        </Link>
                        <h1 className="text-3xl font-bold text-pink-400">
                            🎵 Admin: The Popular Song
                        </h1>
                        <p className="text-gray-400 mt-1">Add albums and songs with stream counts</p>
                    </div>
                </div>

                {/* Add/Edit Album Form */}
                <form onSubmit={handleSubmit} className="bg-gray-900 rounded-2xl p-6 mb-8 border border-gray-800">
                    <h2 className="text-xl font-bold mb-4">
                        {editingAlbum ? 'Edit Album' : 'Add New Album'}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Cover Art */}
                        <div>
                            <label className="block text-gray-400 mb-2 text-sm">Album Cover</label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full aspect-square rounded-xl bg-gray-800 border-2 border-dashed border-gray-600 
                           flex items-center justify-center cursor-pointer hover:border-pink-500 
                           transition-colors overflow-hidden"
                            >
                                {coverPreview ? (
                                    <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center">
                                        <div className="text-4xl mb-2">🖼️</div>
                                        <div className="text-sm text-gray-400">Upload Cover</div>
                                    </div>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleCoverChange}
                                className="hidden"
                            />
                        </div>

                        {/* Album Details */}
                        <div className="md:col-span-2 space-y-4">
                            {/* Album Name */}
                            <div>
                                <label className="block text-gray-400 mb-2 text-sm">Movie / Album Name</label>
                                <input
                                    type="text"
                                    value={albumName}
                                    onChange={(e) => setAlbumName(e.target.value)}
                                    placeholder="Enter album or movie name..."
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl 
                             focus:outline-none focus:ring-2 focus:ring-pink-500 text-white"
                                />
                            </div>

                            {/* Songs List */}
                            <div>
                                <label className="block text-gray-400 mb-2 text-sm">Songs (with stream counts)</label>
                                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                                    {songs.map((song, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={song.title}
                                                onChange={(e) => updateSongRow(index, 'title', e.target.value)}
                                                placeholder="Song title..."
                                                className="flex-grow px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                                   focus:outline-none focus:ring-2 focus:ring-pink-500 text-white text-sm"
                                            />
                                            <input
                                                type="number"
                                                value={song.streams}
                                                onChange={(e) => updateSongRow(index, 'streams', e.target.value)}
                                                placeholder="Streams"
                                                className="w-28 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                                   focus:outline-none focus:ring-2 focus:ring-pink-500 text-white text-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeSongRow(index)}
                                                className="px-3 py-2 bg-red-600/30 text-red-400 rounded-lg hover:bg-red-600/50"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={addSongRow}
                                    className="mt-2 text-pink-400 hover:text-pink-300 text-sm"
                                >
                                    + Add another song
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-4 mt-6 pt-4 border-t border-gray-800">
                        {editingAlbum && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-6 py-3 bg-gray-700 rounded-xl font-medium hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="submit"
                            className="px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl 
                         font-bold hover:from-pink-500 hover:to-purple-500"
                        >
                            {editingAlbum ? 'Update Album' : 'Add Album'}
                        </button>
                    </div>
                </form>

                {/* Albums List */}
                <div>
                    <h2 className="text-xl font-bold mb-4">Saved Albums ({albums.length})</h2>

                    {albums.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <div className="text-5xl mb-4">📀</div>
                            <div>No albums added yet</div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {albums.map((album) => {
                                const sortedSongs = [...album.songs].sort((a, b) => b.streams - a.streams);
                                return (
                                    <div
                                        key={album.id}
                                        className={`bg-gray-900 rounded-xl p-4 border ${album.played ? 'border-gray-700 opacity-60' : 'border-gray-800'
                                            }`}
                                    >
                                        <div className="flex gap-4">
                                            {/* Cover */}
                                            <div className="w-20 h-20 rounded-lg bg-gray-800 overflow-hidden flex-shrink-0">
                                                {album.coverArt ? (
                                                    <img src={album.coverArt} alt={album.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-2xl">🎵</div>
                                                )}
                                            </div>

                                            {/* Details */}
                                            <div className="flex-grow min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="font-bold text-lg">{album.name}</h3>
                                                        {album.played && (
                                                            <span className="text-xs bg-gray-700 px-2 py-0.5 rounded-full text-gray-400">
                                                                Played
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleEdit(album)}
                                                            className="px-3 py-1 text-sm bg-gray-700 rounded-lg hover:bg-gray-600"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(album.id)}
                                                            className="px-3 py-1 text-sm bg-red-600/30 text-red-400 rounded-lg hover:bg-red-600/50"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Top 3 Songs Preview */}
                                                <div className="mt-2 text-sm text-gray-400">
                                                    <span className="text-gray-500">Top 3:</span>{' '}
                                                    {sortedSongs.slice(0, 3).map((s, i) => (
                                                        <span key={s.id}>
                                                            <span className={i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : 'text-orange-400'}>
                                                                {i + 1}. {s.title}
                                                            </span>
                                                            {i < 2 && ', '}
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {album.songs.length} songs total
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
