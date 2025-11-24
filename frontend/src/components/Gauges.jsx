import React from 'react';

const Gauges = ({ telemetry }) => {
    if (!telemetry) return null;

    const { nmot, gear, speed } = telemetry;

    // RPM percentage (assuming max 7500)
    const rpmPercent = Math.min((nmot / 7500) * 100, 100);

    // Color for RPM
    let rpmColor = "text-accent-cyan";
    if (rpmPercent > 80) rpmColor = "text-yellow-400";
    if (rpmPercent > 90) rpmColor = "text-accent-red";

    // Calculate circumference for stroke-dasharray
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (rpmPercent / 100) * circumference;

    return (
        <div className="grid grid-cols-3 gap-2 p-4">
            {/* RPM */}
            <div className="flex flex-col items-center relative">
                <span className="text-space-400 text-[10px] uppercase tracking-widest mb-1">Engine RPM</span>
                <div className="relative w-28 h-28 flex items-center justify-center">
                    {/* Outer Ring */}
                    <div className="absolute inset-0 border border-space-700 rounded-full opacity-30"></div>

                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        {/* Background Track */}
                        <circle
                            cx="50" cy="50" r={radius}
                            fill="none"
                            stroke="#15192b"
                            strokeWidth="6"
                        />
                        {/* Progress */}
                        <circle
                            cx="50" cy="50" r={radius}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="6"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            className={`${rpmColor} transition - all duration - 100 ease - out`}
                        />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                        <span className="text-2xl font-mono font-bold text-white">{Math.round(nmot)}</span>
                        <span className="text-[10px] text-space-400">RPM</span>
                    </div>
                </div>
            </div>

            {/* Gear */}
            <div className="flex flex-col items-center justify-center border-x border-space-700/50">
                <span className="text-space-400 text-[10px] uppercase tracking-widest mb-2">Gear</span>
                <div className="w-20 h-24 bg-space-900 border border-space-700 rounded flex items-center justify-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-accent-cyan/50"></div>
                    <span className="text-6xl font-mono font-bold text-white z-10">{Math.round(gear)}</span>
                    <div className="absolute inset-0 bg-accent-cyan/5 blur-xl"></div>
                </div>
            </div>

            {/* Speed */}
            <div className="flex flex-col items-center justify-center">
                <span className="text-space-400 text-[10px] uppercase tracking-widest mb-2">Velocity</span>
                <div className="flex flex-col items-center">
                    <span className="text-5xl font-mono font-bold text-white tracking-tighter">{Math.round(speed)}</span>
                    <span className="text-accent-cyan text-xs font-bold uppercase tracking-widest mt-1">km/h</span>
                </div>
            </div>
        </div>
    );
};

export default Gauges;
