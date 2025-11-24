import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StrategyTerminal = ({ telemetryHistory = [] }) => {
    const [activeTab, setActiveTab] = useState('telemetry');

    // Prepare data for charts
    const safeHistory = Array.isArray(telemetryHistory) ? telemetryHistory : [];
    const chartData = safeHistory.slice(-50).map((t, i) => {
        if (!t) return { index: i, throttle: 0, brake: 0, speed: 0 };
        return {
            index: i,
            throttle: (t.aps || 0) * 100,
            brake: (t.pbrake_f || 0) * 100,
            speed: t.speed || 0
        };
    });

    // Dynamic Event Log (Mocked for now but looks alive)
    const [events, setEvents] = useState([
        { time: '14:30:00', msg: 'SYSTEM INITIALIZED', type: 'info' }
    ]);

    useEffect(() => {
        const possibleEvents = [
            { msg: 'SECTOR 1 YELLOW', type: 'warn' },
            { msg: 'SECTOR 2 CLEAR', type: 'success' },
            { msg: 'PIT WINDOW OPEN', type: 'info' },
            { msg: 'TIRE TEMPS OPTIMAL', type: 'success' },
            { msg: 'TRAFFIC AHEAD +2.5s', type: 'warn' },
            { msg: 'FUEL MIX 2 SUGGESTED', type: 'info' },
            { msg: 'BOX NOW - UNDERCUT', type: 'warn' }
        ];

        const interval = setInterval(() => {
            if (Math.random() > 0.7) {
                const newEvent = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
                setEvents(prev => [{
                    time: new Date().toLocaleTimeString([], { hour12: false }),
                    msg: newEvent.msg,
                    type: newEvent.type
                }, ...prev].slice(0, 5));
            }
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Gap Analysis State
    const [currentGap, setCurrentGap] = useState(2.5);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentGap(Math.random() * 5 + 2);
        }, 1000); // Update every 1s
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-full flex flex-col gap-2">
            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-800 pb-1">
                <button
                    onClick={() => setActiveTab('telemetry')}
                    className={`text-[10px] font-bold uppercase ${activeTab === 'telemetry' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-500 hover:text-white'}`}
                >
                    Live Telemetry
                </button>
                <button
                    onClick={() => setActiveTab('gap')}
                    className={`text-[10px] font-bold uppercase ${activeTab === 'gap' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-500 hover:text-white'}`}
                >
                    Gap Analysis
                </button>
            </div>

            <div className="flex-1 flex gap-2">
                {activeTab === 'telemetry' ? (
                    <>
                        {/* Telemetry Charts */}
                        <div className="flex-1 bg-black/20 border border-gray-800 relative p-2">
                            <div className="text-[10px] text-gray-500 mb-1">THROTTLE / BRAKE TRACE</div>
                            <ResponsiveContainer width="100%" height="90%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#232942" vertical={false} />
                                    <XAxis dataKey="index" stroke="#5c677d" fontSize={10} hide />
                                    <YAxis domain={[0, 100]} stroke="#5c677d" fontSize={10} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#15192b', borderColor: '#232942', color: '#d0d6e0', fontSize: '10px' }}
                                        itemStyle={{ color: '#d0d6e0' }}
                                    />
                                    <Line type="monotone" dataKey="throttle" stroke="#22c55e" strokeWidth={2} dot={false} name="Throttle %" isAnimationActive={false} />
                                    <Line type="monotone" dataKey="brake" stroke="#ef4444" strokeWidth={2} dot={false} name="Brake %" isAnimationActive={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 bg-black/20 border border-gray-800 relative p-2">
                        <div className="text-[10px] text-gray-500 mb-1">GAP TO LEADER</div>
                        <div className="h-full flex flex-col">
                            <div className="flex justify-between items-center mb-2">
                                <div className="text-xs text-cyan-400">GAP TO LEADER</div>
                                <div className="text-[10px] text-gray-500">LAST 20 LAPS</div>
                            </div>
                            <div className="flex-1 w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                                        <XAxis dataKey="index" hide />
                                        <YAxis
                                            domain={['auto', 'auto']}
                                            orientation="right"
                                            tick={{ fill: '#6b7280', fontSize: 10 }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', fontSize: '12px' }}
                                            itemStyle={{ color: '#fff' }}
                                            labelStyle={{ display: 'none' }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="speed"
                                            stroke="#ec4899"
                                            strokeWidth={2}
                                            dot={false}
                                            name="Gap Delta"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                                <div className="absolute top-2 left-2 text-xs text-pink-500 font-bold">
                                    CURRENT GAP: +{currentGap.toFixed(3)}s
                                </div>
                            </div>
                            <div className="mt-2 text-[10px] text-gray-400 text-center">
                                Gap trend indicates potential undercut opportunity in Lap 14.
                            </div>
                        </div>
                    </div>
                )}

                {/* Event Log */}
                <div className="w-1/3 bg-black/20 border border-gray-800 p-1 font-mono text-[10px] overflow-hidden flex flex-col gap-1">
                    {events.map((e, i) => {
                        let colorClass = 'text-cyan-400';
                        if (e.type === 'warn') colorClass = 'text-yellow-500';
                        if (e.type === 'success') colorClass = 'text-green-400';

                        return (
                            <div key={i} className={colorClass}>
                                <span className="text-gray-600">[{e.time}]</span> {'>'} {e.msg}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default StrategyTerminal;
