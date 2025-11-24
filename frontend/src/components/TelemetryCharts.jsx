import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const TelemetryCharts = ({ data }) => {
    // data is array of history points

    if (!data || data.length === 0) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center text-space-400">
                <div className="animate-pulse text-xs uppercase tracking-widest">Awaiting Telemetry...</div>
            </div>
        );
    }

    // We only show last N points to keep it readable
    const displayData = data.slice(-50);

    return (
        <div className="grid grid-cols-1 gap-4 h-full">
            {/* Speed Chart */}
            <div className="flex flex-col h-40">
                <h3 className="text-space-400 text-[10px] uppercase tracking-widest mb-1">Velocity Profile</h3>
                <div className="flex-1 border border-space-700 bg-space-900/50 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={displayData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#232942" vertical={false} />
                            <YAxis domain={[0, 220]} stroke="#5c677d" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#15192b', borderColor: '#232942', color: '#d0d6e0', fontSize: '12px' }}
                                itemStyle={{ color: '#d0d6e0' }}
                                labelStyle={{ display: 'none' }}
                            />
                            <Line type="monotone" dataKey="speed" stroke="#00f0ff" strokeWidth={2} dot={false} isAnimationActive={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Pedals Chart */}
            <div className="flex flex-col h-40">
                <h3 className="text-space-400 text-[10px] uppercase tracking-widest mb-1">Input Telemetry</h3>
                <div className="flex-1 border border-space-700 bg-space-900/50 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={displayData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#232942" vertical={false} />
                            <YAxis domain={[0, 100]} stroke="#5c677d" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#15192b', borderColor: '#232942', color: '#d0d6e0', fontSize: '12px' }}
                                labelStyle={{ display: 'none' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }} />
                            <Line type="monotone" dataKey="ath" name="Throttle" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
                            <Line type="monotone" dataKey="pbrake_f" name="Brake" stroke="#ff2a2a" strokeWidth={2} dot={false} isAnimationActive={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default TelemetryCharts;
