import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const HistoryAnalysis = ({ driverId }) => {
    const [history, setHistory] = useState(null);

    useEffect(() => {
        if (!driverId) return;

        fetch(`http://localhost:8000/api/history/${driverId}`)
            .then(res => res.json())
            .then(data => setHistory(data))
            .catch(err => console.error("Error fetching history:", err));
    }, [driverId]);

    if (!history || !history.lap_times) {
        return <div className="text-space-400 text-xs animate-pulse">Analyzing Mission Data...</div>;
    }

    const lapData = Object.entries(history.lap_times).map(([lap, time]) => ({
        lap: parseInt(lap),
        time: time
    })).sort((a, b) => a.lap - b.lap);

    const bestLap = history.best_lap;
    const avgLap = lapData.reduce((acc, curr) => acc + curr.time, 0) / lapData.length;

    return (
        <div className="h-full flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-space-900/50 border border-space-700 p-3 rounded relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-accent-cyan"></div>
                    <span className="text-[10px] text-space-400 uppercase tracking-widest">Best Lap</span>
                    <div className="text-2xl font-mono font-bold text-white mt-1">{bestLap.toFixed(3)}<span className="text-xs text-space-400 ml-1">s</span></div>
                </div>
                <div className="bg-space-900/50 border border-space-700 p-3 rounded relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                    <span className="text-[10px] text-space-400 uppercase tracking-widest">Consistency</span>
                    <div className="text-2xl font-mono font-bold text-white mt-1">±{history.consistency.toFixed(3)}<span className="text-xs text-space-400 ml-1">s</span></div>
                </div>
            </div>

            <div className="flex-1 bg-space-900/50 border border-space-700 p-2 relative">
                <h3 className="text-space-400 text-[10px] uppercase tracking-widest mb-2">Lap Time Distribution</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={lapData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#232942" vertical={false} />
                        <XAxis dataKey="lap" stroke="#5c677d" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis domain={['auto', 'auto']} stroke="#5c677d" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip
                            cursor={{ fill: '#232942', opacity: 0.5 }}
                            contentStyle={{ backgroundColor: '#15192b', borderColor: '#232942', color: '#d0d6e0', fontSize: '12px' }}
                            itemStyle={{ color: '#d0d6e0' }}
                        />
                        <Bar dataKey="time" fill="#00f0ff" radius={[2, 2, 0, 0]}>
                            {lapData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.time === bestLap ? '#00f0ff' : '#232942'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default HistoryAnalysis;
