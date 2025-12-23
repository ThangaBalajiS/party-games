'use client';

import { createContext, useContext, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const PartyContext = createContext(null);

const STORAGE_KEYS = {
    players: 'partyApp_players',
    teams: 'partyApp_teams',
    settings: 'partyApp_settings',
    albums: 'partyApp_albums',
};

const DEFAULT_SETTINGS = {
    basePrice: 100,
    bidIncrement: 10,
    auctionStatus: 'pending', // pending, in-progress, completed
    currentPlayerIndex: 0,
};

export function PartyProvider({ children }) {
    const [players, setPlayers, playersLoaded] = useLocalStorage(STORAGE_KEYS.players, []);
    const [teams, setTeams, teamsLoaded] = useLocalStorage(STORAGE_KEYS.teams, []);
    const [settings, setSettings, settingsLoaded] = useLocalStorage(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
    const [albums, setAlbums, albumsLoaded] = useLocalStorage(STORAGE_KEYS.albums, []);

    const isLoaded = playersLoaded && teamsLoaded && settingsLoaded && albumsLoaded;

    // Player functions
    const addPlayer = useCallback((player) => {
        const newPlayer = {
            id: Date.now().toString(),
            name: player.name,
            photo: player.photo || null,
            teamId: null,
            soldPrice: null,
            isCaptain: false,
            createdAt: new Date().toISOString(),
        };
        setPlayers((prev) => [...prev, newPlayer]);
        return newPlayer;
    }, [setPlayers]);

    const updatePlayer = useCallback((id, updates) => {
        setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    }, [setPlayers]);

    const deletePlayer = useCallback((id) => {
        setPlayers((prev) => prev.filter((p) => p.id !== id));
        // Also remove as captain if assigned
        setTeams((prev) => prev.map((t) => (t.captainId === id ? { ...t, captainId: null } : t)));
    }, [setPlayers, setTeams]);

    // Team functions
    const addTeam = useCallback((team) => {
        const newTeam = {
            id: Date.now().toString(),
            name: team.name,
            color: team.color || '#3B82F6',
            captainId: null,
            budget: team.budget || 1000,
            score: 0,
            createdAt: new Date().toISOString(),
        };
        setTeams((prev) => [...prev, newTeam]);
        return newTeam;
    }, [setTeams]);

    const updateTeam = useCallback((id, updates) => {
        setTeams((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    }, [setTeams]);

    const deleteTeam = useCallback((id) => {
        // Remove team and unassign players
        setTeams((prev) => prev.filter((t) => t.id !== id));
        setPlayers((prev) => prev.map((p) => (p.teamId === id ? { ...p, teamId: null, soldPrice: null } : p)));
    }, [setTeams, setPlayers]);

    const assignCaptain = useCallback((teamId, playerId) => {
        // Remove captain status from previous captain of any team
        setPlayers((prev) => prev.map((p) => {
            if (p.id === playerId) {
                return { ...p, isCaptain: true, teamId };
            }
            // If this player was captain of this team, remove captain status
            const team = teams.find((t) => t.id === teamId);
            if (team && team.captainId === p.id) {
                return { ...p, isCaptain: false };
            }
            return p;
        }));
        setTeams((prev) => prev.map((t) => (t.id === teamId ? { ...t, captainId: playerId } : t)));
    }, [setPlayers, setTeams, teams]);

    // Auction functions
    const sellPlayer = useCallback((playerId, teamId, price) => {
        setPlayers((prev) => prev.map((p) =>
            p.id === playerId ? { ...p, teamId, soldPrice: price } : p
        ));
        setTeams((prev) => prev.map((t) =>
            t.id === teamId ? { ...t, budget: t.budget - price } : t
        ));
    }, [setPlayers, setTeams]);

    const updateSettings = useCallback((updates) => {
        setSettings((prev) => ({ ...prev, ...updates }));
    }, [setSettings]);

    // Album functions for Popular Song game
    const addAlbum = useCallback((album) => {
        const newAlbum = {
            id: Date.now().toString(),
            name: album.name,
            coverArt: album.coverArt || null,
            songs: album.songs || [], // { id, title, streams }
            played: false,
            createdAt: new Date().toISOString(),
        };
        setAlbums((prev) => [...prev, newAlbum]);
        return newAlbum;
    }, [setAlbums]);

    const updateAlbum = useCallback((id, updates) => {
        setAlbums((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
    }, [setAlbums]);

    const deleteAlbum = useCallback((id) => {
        setAlbums((prev) => prev.filter((a) => a.id !== id));
    }, [setAlbums]);

    const markAlbumPlayed = useCallback((id) => {
        setAlbums((prev) => prev.map((a) => (a.id === id ? { ...a, played: true } : a)));
    }, [setAlbums]);

    // Get songs sorted by streams (most streamed first)
    const getSortedSongs = useCallback((albumId) => {
        const album = albums.find((a) => a.id === albumId);
        if (!album) return [];
        return [...album.songs].sort((a, b) => b.streams - a.streams);
    }, [albums]);

    // Calculate score for Popular Song game
    // 1 correct = 10 points, 2 correct = 25 points, 3 correct = 50 points
    const calculateSongScore = useCallback((albumId, teamAnswers) => {
        const sortedSongs = getSortedSongs(albumId);
        if (sortedSongs.length < 3) return 0;

        const correctRanking = sortedSongs.slice(0, 3).map(s => s.id);
        let correctCount = 0;

        teamAnswers.forEach((answerId, index) => {
            if (answerId === correctRanking[index]) {
                correctCount++;
            }
        });

        if (correctCount === 3) return 50;
        if (correctCount === 2) return 25;
        if (correctCount === 1) return 10;
        return 0;
    }, [getSortedSongs]);

    // Reset functions
    const resetAuction = useCallback(() => {
        setPlayers((prev) => prev.map((p) =>
            p.isCaptain ? p : { ...p, teamId: null, soldPrice: null }
        ));
        setTeams((prev) => prev.map((t) => ({ ...t, budget: 1000 })));
        setSettings(DEFAULT_SETTINGS);
    }, [setPlayers, setTeams, setSettings]);

    const resetAll = useCallback(() => {
        setPlayers([]);
        setTeams([]);
        setSettings(DEFAULT_SETTINGS);
        setAlbums([]);
    }, [setPlayers, setTeams, setSettings, setAlbums]);

    // Computed values
    const getTeamPlayers = useCallback((teamId) => {
        return players.filter((p) => p.teamId === teamId);
    }, [players]);

    const getUnsoldPlayers = useCallback(() => {
        return players.filter((p) => !p.teamId && !p.isCaptain);
    }, [players]);

    const getAvailableCaptains = useCallback(() => {
        const captainIds = teams.map((t) => t.captainId).filter(Boolean);
        return players.filter((p) => !captainIds.includes(p.id));
    }, [players, teams]);

    const getUnplayedAlbums = useCallback(() => {
        return albums.filter((a) => !a.played);
    }, [albums]);

    const value = {
        // State
        players,
        teams,
        settings,
        albums,
        isLoaded,

        // Player actions
        addPlayer,
        updatePlayer,
        deletePlayer,

        // Team actions
        addTeam,
        updateTeam,
        deleteTeam,
        assignCaptain,

        // Auction actions
        sellPlayer,
        updateSettings,
        resetAuction,

        // Album actions
        addAlbum,
        updateAlbum,
        deleteAlbum,
        markAlbumPlayed,
        getSortedSongs,
        calculateSongScore,
        getUnplayedAlbums,

        // Reset
        resetAll,

        // Computed
        getTeamPlayers,
        getUnsoldPlayers,
        getAvailableCaptains,
    };

    return (
        <PartyContext.Provider value={value}>
            {children}
        </PartyContext.Provider>
    );
}

export function useParty() {
    const context = useContext(PartyContext);
    if (!context) {
        throw new Error('useParty must be used within a PartyProvider');
    }
    return context;
}

