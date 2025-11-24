import React from 'react';

// Memoized Map Component to prevent re-renders
const TrackMapBackground = React.memo(({ trackPath, carX, carY }) => {
    return (
        <div className="absolute inset-0 opacity-30 flex items-center justify-center p-8">
            {trackPath && (
                <svg viewBox="0 0 100 100" className="w-full h-full stroke-cyan-800 fill-none stroke-1 overflow-visible">
                    <path d={trackPath} />
                    {/* Car Dot */}
                    <circle cx={carX} cy={carY} r="2" className="fill-cyan-400 animate-pulse shadow-[0_0_10px_cyan]" />
                </svg>
            )}
        </div>
    );
});

const PilotsHUD = ({ telemetry }) => {
    const [trackPath, setTrackPath] = React.useState('');
    const [bounds, setBounds] = React.useState(null);

    React.useEffect(() => {
        fetch('http://localhost:8000/api/track')
            .then(res => res.json())
            .then(data => {
                if (data && data.length > 0) {
                    // Calculate bounds
                    const lats = data.map(p => p[0]);
                    const longs = data.map(p => p[1]);
                    const minLat = Math.min(...lats);
                    const maxLat = Math.max(...lats);
                    const minLong = Math.min(...longs);
                    const maxLong = Math.max(...longs);

                    setBounds({ minLat, maxLat, minLong, maxLong });

                    // Generate SVG Path
                    const path = data.map(p => {
                        const x = ((p[1] - minLong) / (maxLong - minLong)) * 100;
                        const y = 100 - ((p[0] - minLat) / (maxLat - minLat)) * 100; // Invert Y
                        return `${x},${y}`;
                    }).join(' L ');

                    setTrackPath(`M ${path} Z`);
                }
            })
            .catch(err => console.error("Error fetching track:", err));
    }, []);

    // Calculate car position on map
    let carX = 50;
    let carY = 50;

    if (bounds && telemetry.VBOX_Lat_Min && telemetry.VBOX_Long_Minutes) {
        carX = ((telemetry.VBOX_Long_Minutes - bounds.minLong) / (bounds.maxLong - bounds.minLong)) * 100;
        carY = 100 - ((telemetry.VBOX_Lat_Min - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 100;
    }

    const speed = telemetry.speed || 0;
    const rpm = telemetry?.nmot || 0;
    const gear = telemetry?.gear || 0;
    const throttle = telemetry?.aps || 0;
    const brake = telemetry?.pbrake_f || 0;
    const gx = telemetry?.accx_can || 0;
    const gy = telemetry?.accy_can || 0;

    // Calculate RPM percentage (assuming max 8000 RPM)
    const rpmPercent = Math.min((rpm / 8000) * 100, 100);

    return (
        <div className="h-full w-full relative overflow-hidden flex items-center justify-center">
            {/* Background Map (Real) */}
            <TrackMapBackground trackPath={trackPath} carX={carX} carY={carY} />
            {/* Central HUD */}
            <div className="relative z-10 flex items-center gap-8">
                {/* G-Force Circle */}
                <div className="w-24 h-24 rounded-full border border-gray-700 bg-black/40 flex items-center justify-center relative">
                    <div className="absolute inset-0 border border-cyan-500/30 rounded-full"></div>
                    <div
                        className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_cyan] absolute"
                        style={{
                            left: `calc(50% + ${gx * 20}px)`,
                            top: `calc(50% - ${gy * 20}px)`
                        }}
                    ></div>
                    <span className="absolute bottom-1 text-[8px] text-gray-500">G-FORCE</span>
                </div>

                {/* Speed/RPM/Pedals */}
                <div className="text-center flex flex-col items-center">
                    <div className="text-6xl font-bold text-white neon-text">{Math.round(speed)}</div>
                    <div className="text-sm text-cyan-400 tracking-[0.5em]">KM/H</div>
                    <div className="w-64 h-2 bg-gray-800 mt-2 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-100"
                            style={{ width: `${rpmPercent}%` }}
                        ></div>
                    </div>

                    {/* Pedals */}
                    <div className="flex gap-1 mt-4 w-48 h-16">
                        <div className="flex-1 bg-gray-800/50 border border-gray-700 relative flex flex-col justify-end">
                            <div
                                className="w-full bg-red-500/80 transition-all duration-100"
                                style={{ height: `${brake * 100}%` }}
                            ></div>
                            <span className="absolute bottom-1 left-1 text-[8px] text-gray-400">BRAKE</span>
                        </div>
                        <div className="flex-1 bg-gray-800/50 border border-gray-700 relative flex flex-col justify-end">
                            <div
                                className="w-full bg-green-500/80 transition-all duration-100"
                                style={{ height: `${throttle * 100}%` }}
                            ></div>
                            <span className="absolute bottom-1 left-1 text-[8px] text-gray-400">THROTTLE</span>
                        </div>
                    </div>
                </div>

                {/* Gear */}
                <div className="w-20 h-24 border-x border-gray-700 flex flex-col items-center justify-center">
                    <span className="text-4xl text-white font-bold">{gear}</span>
                    <span className="text-[8px] text-gray-500">GEAR</span>
                </div>
            </div>

            {/* AI Coach Overlay */}
            <div className="absolute top-4 right-4 w-48 bg-black/60 border-l-2 border-yellow-400 p-2 backdrop-blur-sm">
                <div className="text-[10px] text-yellow-400 font-bold mb-1">RACE ENGINEER AI</div>
                <div className="text-xs text-white mb-1">
                    {speed > 150 ? "Braking zone approaching. Focus on exit speed." :
                        speed > 100 ? "Maintain momentum through the apex." :
                            "Good traction on exit. Keep pushing."}
                </div>
                <div className="text-[10px] text-gray-400">Pace Delta: <span className={Math.random() > 0.5 ? "text-green-400" : "text-red-400"}>
                    {(Math.random() * 0.5 - 0.25).toFixed(2)}s
                </span></div>
            </div>
        </div>
    );
};

export default PilotsHUD;
