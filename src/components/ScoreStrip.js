'use client';

import { useParty } from '@/context/PartyContext';

export default function ScoreStrip() {
    const { teams, isLoaded } = useParty();

    if (!isLoaded || teams.length === 0) {
        return null;
    }

    // Sort teams by score descending
    const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
            <div className="flex items-center justify-center gap-6 px-4 py-2">
                {sortedTeams.map((team, index) => (
                    <div 
                        key={team.id}
                        className="flex items-center gap-2"
                    >
                        <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: team.color }}
                        />
                        <span className="font-medium text-sm" style={{ color: team.color }}>
                            {team.name}
                        </span>
                        <span className={`font-bold text-sm ${index === 0 ? 'text-green-400' : 'text-gray-400'}`}>
                            {team.score}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
