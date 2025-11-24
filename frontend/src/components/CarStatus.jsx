import React, { useState, useEffect } from 'react';

const CarStatus = ({ telemetry }) => {
    const [history, setHistory] = useState(null);

    // Mock tire temps based on brake/throttle usage
    const getTireTemp = (base) => {
        const brake = telemetry?.pbrake_f || 0;
        const throttle = telemetry?.aps || 0;
        return base + (brake * 10) + (throttle * 5);
    };

    const tires = [
        { name: 'FL', temp: getTireTemp(95) },
        { name: 'FR', temp: getTireTemp(97) },
        { name: 'RL', temp: getTireTemp(93) },
        { name: 'RR', temp: getTireTemp(94) }
    ];

    const getTireColor = (temp) => {
        if (temp > 105) return 'bg-red-900/20 border-red-500/30 text-red-400';
        if (temp > 100) return 'bg-yellow-900/20 border-yellow-500/30 text-yellow-400';
        return 'bg-green-900/20 border-green-500/30 text-green-400';
    };

    return (
        <div className="h-full flex flex-col gap-2">
            {/* Tire Status */}
            <div className="h-1/3 glass rounded-lg p-2">
                <div className="text-xs text-cyan-400 uppercase tracking-widest mb-2">Tire Status</div>
                <div className="grid grid-cols-2 gap-2 h-[calc(100%-24px)]">
                    {tires.map(tire => (
                        <div
                            key={tire.name}
                            className={`border flex items-center justify-center text-sm font-bold ${getTireColor(tire.temp)}`}
                        >
                            {tire.name} {Math.round(tire.temp)}°
                        </div>
                    ))}
                </div>
            </div>

            {/* Pit Strategy */}
            <div className="flex-1 glass rounded-lg p-2">
                <div className="text-xs text-cyan-400 uppercase tracking-widest mb-2">Strategy Prediction</div>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Undercut Probability</span>
                            <span className="text-green-400">{(Math.random() * 20 + 70).toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-800 h-1 rounded-full">
                            <div className="w-[85%] h-full bg-green-500 rounded-full"></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Est. Rejoin Position</span>
                            <span className="text-white font-bold">P{Math.floor(Math.random() * 5 + 1)}</span>
                        </div>
                        <div className="p-2 bg-gray-800 rounded text-[10px] text-gray-400">
                            Traffic expected in Sector 1. Recommended box: Lap {Math.floor(Math.random() * 5 + 10)}.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CarStatus;
