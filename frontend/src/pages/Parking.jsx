import React from 'react';
import { Circle, Square, LayoutGrid } from 'lucide-react';

const Parking = () => {
    // Generate a simple grid of parking spots
    const totalSpots = 100;
    const occupiedCount = 42;
    const reservedCount = 15;
    const availableCount = totalSpots - occupiedCount - reservedCount;

    const spots = Array.from({ length: totalSpots }, (_, i) => {
        if (i < occupiedCount) return 'occupied';
        if (i < occupiedCount + reservedCount) return 'reserved';
        return 'available';
    });

    // Mix them up for a more realistic look
    spots.sort(() => Math.random() - 0.5);

    return (
        <div className="space-y-6 pb-12">
            <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                    <LayoutGrid className="text-primary w-8 h-8" />
                    Parking Availability
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium pl-11">Real-time occupancy status of community parking slots.</p>
            </div>

            {/* Legend & Stats */}
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 p-6 rounded-2xl shadow-sm flex flex-wrap gap-8 items-center justify-between">
                <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                        <Square className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                        <span className="text-slate-600 dark:text-slate-300 font-bold text-sm">Available ({availableCount})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Square className="w-5 h-5 text-rose-500 fill-rose-500/20" />
                        <span className="text-slate-600 dark:text-slate-300 font-bold text-sm">Occupied ({occupiedCount})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Square className="w-5 h-5 text-amber-500 fill-amber-500/20" />
                        <span className="text-slate-600 dark:text-slate-300 font-bold text-sm">Reserved ({reservedCount})</span>
                    </div>
                </div>

                <div className="flex items-center gap-4 border-l border-slate-200 dark:border-slate-800 pl-8">
                    <span className="text-sm font-bold text-slate-500">Utilization</span>
                    <div className="w-32 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                        <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full" style={{ width: `${(occupiedCount / totalSpots) * 100}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Grid Layout */}
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 p-8 rounded-2xl shadow-sm overflow-x-auto custom-scrollbar">

                <div className="min-w-[800px]">
                    {/* Zone A */}
                    <div className="mb-8">
                        <h3 className="text-lg font-black text-slate-400 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">ZONE A - Residents</h3>
                        <div className="grid grid-cols-10 gap-3">
                            {spots.slice(0, 50).map((status, index) => (
                                <div
                                    key={`A${index}`}
                                    className={`aspect-[2/3] rounded-lg border-2 flex items-center justify-center font-mono font-bold text-xs transition-transform hover:scale-105 cursor-pointer shadow-sm
                                        ${status === 'available' ? 'border-emerald-400/50 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400' :
                                            status === 'occupied' ? 'border-rose-400/50 bg-rose-500/10 text-rose-600 dark:text-rose-400' :
                                                'border-amber-400/50 bg-amber-500/10 text-amber-600 dark:text-amber-400'}
                                    `}
                                >
                                    A{String(index + 1).padStart(2, '0')}
                                    {status === 'occupied' && <Circle className="w-2 h-2 absolute top-2 right-2 fill-rose-500 text-rose-500" />}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Zone B */}
                    <div>
                        <h3 className="text-lg font-black text-slate-400 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">ZONE B - Visitors</h3>
                        <div className="grid grid-cols-10 gap-3">
                            {spots.slice(50, 100).map((status, index) => (
                                <div
                                    key={`B${index}`}
                                    className={`aspect-[2/3] rounded-lg border-2 flex items-center justify-center font-mono font-bold text-xs transition-transform hover:scale-105 cursor-pointer shadow-sm
                                        ${status === 'available' ? 'border-emerald-400/50 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400' :
                                            status === 'occupied' ? 'border-rose-400/50 bg-rose-500/10 text-rose-600 dark:text-rose-400' :
                                                'border-amber-400/50 bg-amber-500/10 text-amber-600 dark:text-amber-400'}
                                    `}
                                >
                                    B{String(index + 1).padStart(2, '0')}
                                    {status === 'occupied' && <Circle className="w-2 h-2 absolute top-2 right-2 fill-rose-500 text-rose-500" />}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Parking;
