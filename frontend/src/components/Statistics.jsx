import React, { useEffect, useState } from 'react';

const Statistics = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetch('http://localhost:8000/api/stats')
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error("Error fetching stats:", err));
    }, []);

    if (!stats) return null;

    // Sort top speeds
    const topSpeeds = Object.entries(stats.top_speeds || {})
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    return (
        <div className="h-full flex flex-col">
            <h3 className="text-accent-cyan text-xs uppercase tracking-widest mb-4 border-b border-space-700 pb-2">
                Leaderboard // Max Velocity
            </h3>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <ul className="space-y-1">
                    {topSpeeds.map(([driver, speed], index) => (
                        <li key={driver} className="flex justify-between items-center p-2 bg-space-900/50 border border-space-700/50 hover:border-accent-cyan/50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-mono text-space-400 w-4">{(index + 1).toString().padStart(2, '0')}</span>
                                <span className="text-sm font-medium text-space-100 group-hover:text-white">{driver}</span>
                            </div>
                            <span className="font-mono text-accent-cyan font-bold">{speed.toFixed(1)} <span className="text-[10px] text-space-400 font-normal">KM/H</span></span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="mt-4 pt-4 border-t border-space-700">
                <h3 className="text-accent-cyan text-xs uppercase tracking-widest mb-2">Strategy Alerts</h3>
                <div className="bg-space-900/50 border border-accent-red/30 p-2 rounded flex items-center gap-2 animate-pulse">
                    <div className="w-2 h-2 bg-accent-red rounded-full"></div>
                    <span className="text-xs font-bold text-white">PIT WINDOW OPEN</span>
                </div>
                <div className="mt-2 text-[10px] text-space-400">
                    Recommended Stop: Lap 12-15
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-space-700 flex justify-between items-end">
                <span className="text-[10px] text-space-400 uppercase tracking-widest">Active Units</span>
                <span className="text-3xl font-mono font-bold text-white leading-none">{stats.total_drivers}</span>
            </div>
        </div>
    );
};

export default Statistics;
