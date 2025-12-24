'use client';

import { createContext, useContext, useCallback, useState, useEffect } from 'react';

const PartyContext = createContext(null);

const DEFAULT_SETTINGS = {
    basePrice: 100,
    bidIncrement: 10,
    auctionStatus: 'pending', // pending, in-progress, completed
    currentPlayerIndex: 0,
};

export function PartyProvider({ children }) {
    const [players, setPlayers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [albums, setAlbums] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load initial data from API
    useEffect(() => {
        async function loadData() {
            try {
                const [playersRes, teamsRes, settingsRes, albumsRes] = await Promise.all([
                    fetch('/api/players'),
                    fetch('/api/teams'),
                    fetch('/api/settings'),
                    fetch('/api/albums'),
                ]);

                if (playersRes.ok) setPlayers(await playersRes.json());
                if (teamsRes.ok) setTeams(await teamsRes.json());
                if (settingsRes.ok) setSettings(await settingsRes.json());
                if (albumsRes.ok) setAlbums(await albumsRes.json());
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setIsLoaded(true);
            }
        }
        loadData();
    }, []);

    // Player functions
    const addPlayer = useCallback(async (player) => {
        try {
            const res = await fetch('/api/players', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(player),
            });
            if (res.ok) {
                const newPlayer = await res.json();
                setPlayers((prev) => [...prev, newPlayer]);
                return newPlayer;
            }
        } catch (error) {
            console.error('Error adding player:', error);
        }
        return null;
    }, []);

    const updatePlayer = useCallback(async (id, updates) => {
        try {
            const res = await fetch(`/api/players/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
            if (res.ok) {
                const updatedPlayer = await res.json();
                setPlayers((prev) => prev.map((p) => (p.id === id ? updatedPlayer : p)));
            }
        } catch (error) {
            console.error('Error updating player:', error);
        }
    }, []);

    // Trade players between teams - atomic swap
    const tradePlayers = useCallback(async (player1Id, player2Id) => {
        const player1 = players.find(p => p.id === player1Id);
        const player2 = players.find(p => p.id === player2Id);
        if (!player1 || !player2) return;

        const team1Id = player1.teamId;
        const team2Id = player2.teamId;

        try {
            await Promise.all([
                fetch(`/api/players/${player1Id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ teamId: team2Id }),
                }),
                fetch(`/api/players/${player2Id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ teamId: team1Id }),
                }),
            ]);

            setPlayers((prev) => prev.map((p) => {
                if (p.id === player1Id) return { ...p, teamId: team2Id };
                if (p.id === player2Id) return { ...p, teamId: team1Id };
                return p;
            }));
        } catch (error) {
            console.error('Error trading players:', error);
        }
    }, [players]);

    const deletePlayer = useCallback(async (id) => {
        try {
            const res = await fetch(`/api/players/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setPlayers((prev) => prev.filter((p) => p.id !== id));
                // Also remove as captain if assigned
                const team = teams.find((t) => t.captainId === id);
                if (team) {
                    await fetch(`/api/teams/${team.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ captainId: null }),
                    });
                    setTeams((prev) => prev.map((t) => (t.captainId === id ? { ...t, captainId: null } : t)));
                }
            }
        } catch (error) {
            console.error('Error deleting player:', error);
        }
    }, [teams]);

    // Team functions
    const addTeam = useCallback(async (team) => {
        try {
            const res = await fetch('/api/teams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(team),
            });
            if (res.ok) {
                const newTeam = await res.json();
                setTeams((prev) => [...prev, newTeam]);
                return newTeam;
            }
        } catch (error) {
            console.error('Error adding team:', error);
        }
        return null;
    }, []);

    const updateTeam = useCallback(async (id, updates) => {
        try {
            const res = await fetch(`/api/teams/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
            if (res.ok) {
                const updatedTeam = await res.json();
                setTeams((prev) => prev.map((t) => (t.id === id ? updatedTeam : t)));
            }
        } catch (error) {
            console.error('Error updating team:', error);
        }
    }, []);

    const deleteTeam = useCallback(async (id) => {
        try {
            const res = await fetch(`/api/teams/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setTeams((prev) => prev.filter((t) => t.id !== id));
                // Unassign players from this team
                const teamPlayers = players.filter((p) => p.teamId === id);
                await Promise.all(
                    teamPlayers.map((p) =>
                        fetch(`/api/players/${p.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ teamId: null, soldPrice: null }),
                        })
                    )
                );
                setPlayers((prev) => prev.map((p) => (p.teamId === id ? { ...p, teamId: null, soldPrice: null } : p)));
            }
        } catch (error) {
            console.error('Error deleting team:', error);
        }
    }, [players]);

    const assignCaptain = useCallback(async (teamId, playerId) => {
        try {
            // Update the player to be captain and assign to team
            await fetch(`/api/players/${playerId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isCaptain: true, teamId }),
            });

            // Update the team's captainId
            await fetch(`/api/teams/${teamId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ captainId: playerId }),
            });

            // Remove captain status from previous captain of this team
            const team = teams.find((t) => t.id === teamId);
            if (team && team.captainId && team.captainId !== playerId) {
                await fetch(`/api/players/${team.captainId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isCaptain: false }),
                });
            }

            setPlayers((prev) => prev.map((p) => {
                if (p.id === playerId) {
                    return { ...p, isCaptain: true, teamId };
                }
                if (team && team.captainId === p.id) {
                    return { ...p, isCaptain: false };
                }
                return p;
            }));
            setTeams((prev) => prev.map((t) => (t.id === teamId ? { ...t, captainId: playerId } : t)));
        } catch (error) {
            console.error('Error assigning captain:', error);
        }
    }, [teams]);

    // Auction functions
    const sellPlayer = useCallback(async (playerId, teamId, price) => {
        try {
            const team = teams.find((t) => t.id === teamId);
            if (!team) return;

            await Promise.all([
                fetch(`/api/players/${playerId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ teamId, soldPrice: price }),
                }),
                fetch(`/api/teams/${teamId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ budget: team.budget - price }),
                }),
            ]);

            setPlayers((prev) => prev.map((p) =>
                p.id === playerId ? { ...p, teamId, soldPrice: price } : p
            ));
            setTeams((prev) => prev.map((t) =>
                t.id === teamId ? { ...t, budget: t.budget - price } : t
            ));
        } catch (error) {
            console.error('Error selling player:', error);
        }
    }, [teams]);

    const updateSettings = useCallback(async (updates) => {
        try {
            const res = await fetch('/api/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
            if (res.ok) {
                const updatedSettings = await res.json();
                setSettings(updatedSettings);
            }
        } catch (error) {
            console.error('Error updating settings:', error);
        }
    }, []);

    // Album functions for Popular Song game
    const addAlbum = useCallback(async (album) => {
        try {
            const res = await fetch('/api/albums', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(album),
            });
            if (res.ok) {
                const newAlbum = await res.json();
                setAlbums((prev) => [...prev, newAlbum]);
                return newAlbum;
            }
        } catch (error) {
            console.error('Error adding album:', error);
        }
        return null;
    }, []);

    const updateAlbum = useCallback(async (id, updates) => {
        try {
            const res = await fetch(`/api/albums/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
            if (res.ok) {
                const updatedAlbum = await res.json();
                setAlbums((prev) => prev.map((a) => (a.id === id ? updatedAlbum : a)));
            }
        } catch (error) {
            console.error('Error updating album:', error);
        }
    }, []);

    const deleteAlbum = useCallback(async (id) => {
        try {
            const res = await fetch(`/api/albums/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setAlbums((prev) => prev.filter((a) => a.id !== id));
            }
        } catch (error) {
            console.error('Error deleting album:', error);
        }
    }, []);

    const markAlbumPlayed = useCallback(async (id) => {
        try {
            const res = await fetch(`/api/albums/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ played: true }),
            });
            if (res.ok) {
                setAlbums((prev) => prev.map((a) => (a.id === id ? { ...a, played: true } : a)));
            }
        } catch (error) {
            console.error('Error marking album as played:', error);
        }
    }, []);

    // Get songs sorted by streams (most streamed first)
    const getSortedSongs = useCallback((albumId) => {
        const album = albums.find((a) => a.id === albumId);
        if (!album) return [];
        return [...album.songs].sort((a, b) => b.streams - a.streams);
    }, [albums]);

    // Calculate score for Popular Song game with smart partial credit
    // - Song in top 3: +5 pts each (any order)
    // - Exact position match: +5 pts each
    // - Got #1 right anywhere: +5 pts bonus
    // - Perfect round (3/3 exact): +15 pts bonus
    const calculateSongScore = useCallback((albumId, teamAnswers) => {
        const sortedSongs = getSortedSongs(albumId);
        if (sortedSongs.length < 3) return { total: 0, breakdown: {} };

        const correctTop3 = sortedSongs.slice(0, 3);
        const correctTop3Ids = correctTop3.map(s => s.id);
        const mostPopularId = correctTop3Ids[0];

        // Calculate each component
        let songsInTop3 = 0;
        let exactMatches = 0;
        let hasNumber1 = false;

        teamAnswers.forEach((answerId, index) => {
            if (correctTop3Ids.includes(answerId)) {
                songsInTop3++;
                if (answerId === correctTop3Ids[index]) {
                    exactMatches++;
                }
            }
            if (answerId === mostPopularId) {
                hasNumber1 = true;
            }
        });

        const isPerfect = exactMatches === 3;

        // Point calculations
        const inTop3Points = songsInTop3 * 5;
        const exactMatchPoints = exactMatches * 5;
        const number1Bonus = hasNumber1 ? 5 : 0;
        const perfectBonus = isPerfect ? 15 : 0;

        const total = inTop3Points + exactMatchPoints + number1Bonus + perfectBonus;

        return {
            total,
            breakdown: {
                songsInTop3,
                exactMatches,
                hasNumber1,
                isPerfect,
                inTop3Points,
                exactMatchPoints,
                number1Bonus,
                perfectBonus
            }
        };
    }, [getSortedSongs]);

    // Reset functions
    const resetAuction = useCallback(async () => {
        try {
            // Reset players (keep captains assigned)
            const nonCaptainPlayers = players.filter(p => !p.isCaptain);
            await Promise.all(
                nonCaptainPlayers.map((p) =>
                    fetch(`/api/players/${p.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ teamId: null, soldPrice: null }),
                    })
                )
            );

            // Reset team budgets
            await Promise.all(
                teams.map((t) =>
                    fetch(`/api/teams/${t.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ budget: 1000 }),
                    })
                )
            );

            // Reset settings
            await fetch('/api/settings', { method: 'DELETE' });

            setPlayers((prev) => prev.map((p) =>
                p.isCaptain ? p : { ...p, teamId: null, soldPrice: null }
            ));
            setTeams((prev) => prev.map((t) => ({ ...t, budget: 1000 })));
            setSettings(DEFAULT_SETTINGS);
        } catch (error) {
            console.error('Error resetting auction:', error);
        }
    }, [players, teams]);

    const resetAll = useCallback(async () => {
        try {
            await Promise.all([
                fetch('/api/players', { method: 'DELETE' }),
                fetch('/api/teams', { method: 'DELETE' }),
                fetch('/api/settings', { method: 'DELETE' }),
                fetch('/api/albums', { method: 'DELETE' }),
            ]);
            setPlayers([]);
            setTeams([]);
            setSettings(DEFAULT_SETTINGS);
            setAlbums([]);
        } catch (error) {
            console.error('Error resetting all data:', error);
        }
    }, []);

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
        tradePlayers,

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
