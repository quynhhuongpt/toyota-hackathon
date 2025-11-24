import React, { useState, useEffect, useRef } from 'react';
import TrackMap from './TrackMap';
import PilotsHUD from './PilotsHUD';
import StrategyTerminal from './StrategyTerminal';
import Leaderboard from './Leaderboard';
import CarStatus from './CarStatus';

const Dashboard = () => {
    const [drivers, setDrivers] = useState([]);
    const [selectedDriver, setSelectedDriver] = useState('');
    const [trackData, setTrackData] = useState([]);
    const [telemetryHistory, setTelemetryHistory] = useState([]);
    const [currentTelemetry, setCurrentTelemetry] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    const wsRef = useRef(null);

    useEffect(() => {
        // Fetch drivers
        fetch('http://localhost:8000/api/drivers')
            .then(res => res.json())
            .then(data => {
                setDrivers(data.drivers);
                if (data.drivers.length > 0) {
                    setSelectedDriver(data.drivers[0]);
                }
            })
            .catch(err => console.error("Error fetching drivers:", err));

        // Fetch track map
        fetch('http://localhost:8000/api/track')
            .then(res => res.json())
            .then(data => setTrackData(data.track_map))
            .catch(err => console.error("Error fetching track:", err));
    }, []);

    useEffect(() => {
        if (!selectedDriver) return;

        // Close existing WebSocket
        if (wsRef.current) {
            wsRef.current.close();
        }

        // Connect to WebSocket
        const ws = new WebSocket(`ws://localhost:8000/ws/telemetry/${selectedDriver}`);

        ws.onopen = () => {
            console.log("WebSocket connected");
            setIsConnected(true);
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setCurrentTelemetry(data);
            setTelemetryHistory(prev => [...prev.slice(-100), data]);
        };

        ws.onclose = () => {
            console.log("WebSocket disconnected");
            setIsConnected(false);
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
            setIsConnected(false);
        };

        wsRef.current = ws;

        return () => {
            if (ws) ws.close();
        };
    }, [selectedDriver]);

    const currentPosition = currentTelemetry && currentTelemetry.VBOX_Lat_Min && currentTelemetry.VBOX_Long_Minutes ? {
        lat: currentTelemetry.VBOX_Lat_Min,
        long: currentTelemetry.VBOX_Long_Minutes
    } : null;

    return (
        <div className="h-screen w-screen overflow-hidden p-2 flex flex-col gap-2 bg-[#0b0d17] text-[#a0aec0] font-rajdhani">
            {/* Header */}
            <header className="flex justify-between items-center px-4 py-2 glass rounded-t-lg">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold text-white tracking-widest">GR CUP <span className="text-cyan-400">STRATEGY</span></h1>
                    <div className="h-4 w-px bg-gray-700"></div>
                    <select
                        className="bg-gray-800 text-white text-xs border border-gray-600 rounded px-2 py-1 focus:outline-none focus:border-cyan-400"
                        value={selectedDriver}
                        onChange={(e) => setSelectedDriver(e.target.value)}
                    >
                        {drivers.map(d => <option key={d} value={d}>DRIVER: {d}</option>)}
                    </select>
                    <span className={`text-xs font-bold ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                        ● {isConnected ? 'LIVE TELEMETRY' : 'OFFLINE'}
                    </span>
                </div>
                <div className="text-2xl font-mono text-white">
                    {currentTelemetry ? new Date(currentTelemetry.timestamp).toLocaleTimeString() : '14:32:05'}
                </div>
            </header>

            {/* Main Grid */}
            <div className="flex-1 grid grid-cols-12 gap-2">

                {/* Left: Leaderboard (2 cols) */}
                <div className="col-span-2 glass rounded-lg p-2 flex flex-col">
                    <Leaderboard selectedDriver={selectedDriver} />
                </div>

                {/* Center (7 cols) */}
                <div className="col-span-7 flex flex-col gap-2">
                    {/* Top: Pilot's HUD (2/3 height) */}
                    <div className="h-2/3 glass rounded-lg overflow-hidden relative flex items-center justify-center">
                        <div className="absolute top-2 left-2 text-xs text-cyan-400 uppercase tracking-widest">Live Cockpit View</div>
                        <PilotsHUD telemetry={currentTelemetry || {}} />
                    </div>

                    {/* Bottom: Strategy Terminal (1/3 height) */}
                    <div className="h-1/3 glass rounded-lg p-2 flex gap-2 flex-col">
                        <StrategyTerminal telemetryHistory={telemetryHistory} />
                    </div>
                </div>

                {/* Right: Car Status (3 cols) */}
                <div className="col-span-3 flex flex-col gap-2">
                    <CarStatus telemetry={currentTelemetry || {}} />
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
