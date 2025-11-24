import React from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const TrackMap = ({ trackData, currentPosition }) => {
    // If we have GPS data, show the Leaflet map
    if (trackData && trackData.length > 0 && currentPosition) {
        return (
            <MapContainer center={[currentPosition.lat, currentPosition.long]} zoom={15} style={{ height: '100%', width: '100%' }} className="bg-space-900">
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                <Polyline positions={trackData} color="#00f0ff" weight={3} />
                <CircleMarker center={[currentPosition.lat, currentPosition.long]} radius={5} color="#ff2a2a" fillOpacity={1} />
            </MapContainer>
        );
    }

    // Fallback: Static Futuristic Map (SVG)
    // Approximate COTA shape
    return (
        <div className="h-full w-full flex items-center justify-center bg-space-900 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20"
                style={{ backgroundImage: 'radial-gradient(circle at center, #15192b 0%, #0b0d17 100%)' }}>
            </div>

            {/* Grid */}
            <div className="absolute inset-0"
                style={{ backgroundImage: 'linear-gradient(#232942 1px, transparent 1px), linear-gradient(90deg, #232942 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.1 }}>
            </div>

            <div className="relative z-10 w-3/4 h-3/4 flex items-center justify-center">
                <svg viewBox="0 0 500 300" className="w-full h-full drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]">
                    {/* Simplified COTA Path */}
                    <path
                        d="M 50 250 L 150 250 L 180 200 L 220 200 L 250 250 L 400 250 L 450 150 L 400 50 L 150 50 L 100 150 Z"
                        fill="none"
                        stroke="#232942"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M 50 250 L 150 250 L 180 200 L 220 200 L 250 250 L 400 250 L 450 150 L 400 50 L 150 50 L 100 150 Z"
                        fill="none"
                        stroke="#00f0ff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="animate-pulse"
                    />

                    {/* Simulated Car Marker (Animated along path) */}
                    <circle r="4" fill="#ff2a2a">
                        <animateMotion
                            dur="10s"
                            repeatCount="indefinite"
                            path="M 50 250 L 150 250 L 180 200 L 220 200 L 250 250 L 400 250 L 450 150 L 400 50 L 150 50 L 100 150 Z"
                        />
                    </circle>
                </svg>

                <div className="absolute bottom-4 right-4 text-right">
                    <div className="text-accent-red text-xs font-bold animate-pulse">GPS SIGNAL LOST</div>
                    <div className="text-space-400 text-[10px]">ESTIMATED POSITION</div>
                </div>
            </div>
        </div>
    );
};

export default TrackMap;
