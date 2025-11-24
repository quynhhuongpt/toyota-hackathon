import React, { useState, useEffect } from 'react';

const Leaderboard = ({ selectedDriver }) => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [activeTab, setActiveTab] = useState('gap');

    useEffect(() => {
        const fetchLeaderboard = () => {
            fetch('http://localhost:8000/api/leaderboard')
                .then(res => res.json())
                .then(data => setLeaderboard(data))
                .catch(err => console.error("Error fetching leaderboard:", err));
        };

        fetchLeaderboard();
        const interval = setInterval(fetchLeaderboard, 5000); // Update every 5s
        return () => clearInterval(interval);
    }, []);

    const [jitter, setJitter] = useState({});

    useEffect(() => {
        if (!leaderboard.length) return;
        const interval = setInterval(() => {
            const newJitter = {};
            leaderboard.forEach(entry => {
                // Small random fluctuation +/- 0.05s
                newJitter[entry.driver] = (Math.random() * 0.1 - 0.05);
            });
            setJitter(newJitter);
        }, 200); // Update every 200ms
        return () => clearInterval(interval);
    }, [leaderboard]);

    if (!leaderboard.length) return <div className="text-space-400 text-xs animate-pulse">Loading...</div>;

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = (seconds % 60).toFixed(3);
        return `${m}:${s.padStart(6, '0')}`;
    };

    return (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-4 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-2">
                <h2 className="text-cyan-500 font-rajdhani font-bold text-lg tracking-wider">LEADERBOARD</h2>
                <div className="flex gap-1">
                    <button
                        className={`px-2 py-0.5 text-[10px] rounded ${activeTab === 'gap' ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                        onClick={() => setActiveTab('gap')}
                    >
                        GAP
                    </button>
                    <button
                        className={`px-2 py-0.5 text-[10px] rounded ${activeTab === 'lap' ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                        onClick={() => setActiveTab('lap')}
                    >
                        LAP
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {leaderboard.map((entry, index) => {
                    const driverNum = entry.driver.split('-')[1] || entry.driver;
                    const isMe = entry.driver === selectedDriver;

                    // Apply jitter to gap
                    let displayTime;
                    const jitterVal = jitter[entry.driver] || 0;

                    if (activeTab === 'gap') {
                        if (index === 0) {
                            // Apply jitter to leader's best lap too for "live" feel
                            const time = Math.max(0, entry.best_lap + jitterVal);
                            displayTime = formatTime(time);
                        } else {
                            const gap = Math.max(0, entry.gap + jitterVal);
                            displayTime = `+${gap.toFixed(3)}s`;
                        }
                    } else {
                        displayTime = formatTime(entry.last_lap);
                    }

                    return (
                        <div key={index} className={`flex justify-between items-center p-2 rounded ${isMe ? 'bg-cyan-900/30 border-l-2 border-cyan-500' : 'hover:bg-gray-800/50'}`}>
                            <div className="flex items-center gap-3">
                                <span className={`text-xs font-bold w-4 ${index < 3 ? 'text-yellow-400' : 'text-gray-500'}`}>{index + 1}.</span>
                                <span className={`font-rajdhani font-semibold ${isMe ? 'text-white' : 'text-gray-400'}`}>#{driverNum}</span>
                            </div>
                            <span className={`font-mono text-xs ${index === 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {displayTime}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Leaderboard;
