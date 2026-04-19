import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CarFront, Clock, MapPin, Search, AlertOctagon, Info } from 'lucide-react';

const Parking = () => {
    const [occupancy, setOccupancy] = useState({ active: 0, capacity: 500 });
    const [activeVehicles, setActiveVehicles] = useState([]);
    const [zones, setZones] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('data'); // 'data' or 'map'

    useEffect(() => {
        const fetchParkingData = async () => {
            try {
                // Fetch occupancy stats
                const occRes = await fetch('http://localhost:8000/api/parking/occupancy');
                if (occRes.ok) {
                    setOccupancy(await occRes.json());
                }

                // Fetch active parked vehicles list
                const vehiclesRes = await fetch('http://localhost:8000/api/parking/active');
                if (vehiclesRes.ok) {
                    setActiveVehicles(await vehiclesRes.json());
                }

                // Fetch grid mapping
                const zonesRes = await fetch('http://localhost:8000/api/parking/zones');
                if (zonesRes.ok) {
                    setZones(await zonesRes.json());
                }
            } catch (error) {
                console.error("Failed to fetch parking data", error);
            }
        };

        fetchParkingData();
        // Poll every 5 seconds for live updates
        const interval = setInterval(fetchParkingData, 5000);
        return () => clearInterval(interval);
    }, []);

    const occupancyPercentage = Math.round((occupancy.active / occupancy.capacity) * 100) || 0;

    const filteredVehicles = activeVehicles.filter(v => 
        v.plate.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const visitorZones = zones.filter(z => z.zone_type === 'Visitor');
    const residentZones = zones.filter(z => z.zone_type === 'Resident');

    const formatDuration = (minutes) => {
        if (minutes < 60) return `${minutes}m`;
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h}h ${m}m`;
    };

    return (
        <div className="space-y-6 pb-12">
            <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Parking Intelligence</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Real-time tracking of capacity, duration overstays, and digital mapping.</p>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Big dial/progress circle for Occupancy */}
                <div className="col-span-1 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 p-8 rounded-2xl shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm border ${occupancyPercentage > 90 ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' : occupancyPercentage > 75 ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'}`}>
                            {occupancyPercentage > 90 ? 'Full Capacity' : 'Available Spots'}
                        </span>
                    </div>

                    <div className="relative w-48 h-48 mt-4 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                            <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={2 * Math.PI * 88} strokeDashoffset={(2 * Math.PI * 88) - ((occupancyPercentage / 100) * (2 * Math.PI * 88))} className={`${occupancyPercentage > 90 ? 'text-rose-500' : occupancyPercentage > 75 ? 'text-amber-500' : 'text-primary'} transition-all duration-1000 ease-out`} strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{occupancyPercentage}%</span>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Filled</span>
                        </div>
                    </div>
                    
                    <div className="flex gap-8 mt-6">
                        <div className="text-center">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Occupied</p>
                            <p className="text-2xl font-black text-slate-800 dark:text-slate-200">{occupancy.active}</p>
                        </div>
                        <div className="w-px bg-slate-200 dark:bg-slate-800"></div>
                        <div className="text-center">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Slots</p>
                            <p className="text-2xl font-black text-slate-800 dark:text-slate-200">{zones.length > 0 ? zones.length : occupancy.capacity}</p>
                        </div>
                    </div>
                </div>

                {/* Overstay Alerts Notice */}
                <div className="col-span-1 lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-rose-600 to-orange-600 p-6 rounded-2xl shadow-lg flex flex-col justify-between overflow-hidden relative group">
                        <div className="absolute -right-12 -top-12 bg-white/10 w-48 h-48 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
                        <div className="bg-white/20 w-12 h-12 flex items-center justify-center rounded-xl backdrop-blur-md relative z-10">
                            <AlertOctagon className="text-white w-6 h-6" />
                        </div>
                        <div className="mt-4 relative z-10">
                            <h3 className="text-white text-xl font-black tracking-tight">Duration & Overstays</h3>
                            <p className="text-orange-100 text-sm mt-3 opacity-95 leading-relaxed font-medium">
                                The AI actively audits parked durations against a strict <strong className="text-white">7 Hour Visitor Grace Period</strong> limit. Vehicles violating this grace limit are aggressively flagged below.
                            </p>
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-violet-600 to-indigo-600 p-6 rounded-2xl shadow-lg flex flex-col justify-between overflow-hidden relative group">
                        <div className="absolute -right-12 -bottom-12 bg-white/10 w-48 h-48 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
                        <div className="bg-white/20 w-12 h-12 flex items-center justify-center rounded-xl backdrop-blur-md relative z-10">
                            <MapPin className="text-white w-6 h-6" />
                        </div>
                        <div className="mt-4 relative z-10">
                            <h3 className="text-white text-xl font-black tracking-tight">Digital Twin Tracking</h3>
                            <p className="text-violet-100 text-sm mt-3 opacity-95 leading-relaxed font-medium">
                                Incoming vehicles are logically auto-assigned into physical Zones via the AI engine, constructing a live <strong className="text-white">virtual map</strong> of all bays in the property.
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            {/* Toggle Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl w-fit border border-slate-200 dark:border-slate-800">
                <button
                    onClick={() => setActiveTab('data')}
                    className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'data' ? 'bg-white dark:bg-slate-900 shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    Stateful Logging
                </button>
                <button
                    onClick={() => setActiveTab('map')}
                    className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'map' ? 'bg-white dark:bg-slate-900 shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    Digital Twin Layout
                </button>
            </div>

            {/* Content Views */}
            <AnimatePresence mode="wait">
                {activeTab === 'data' ? (
                    <motion.div
                        key="data"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-2xl shadow-sm overflow-hidden flex flex-col"
                    >
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center sm:flex-row flex-col gap-4">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                Active Parked Vehicles
                                {activeVehicles.find(v => v.is_overstay) && (
                                   <span className="flex h-3 w-3 relative ml-2">
                                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                     <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                                   </span> 
                                )}
                            </h3>
                            
                            <div className="relative group w-full sm:w-64">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search License Plate..."
                                    className="w-full bg-slate-50 dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none border border-slate-200 dark:border-slate-800 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all font-medium"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800/50 text-xs uppercase tracking-wider text-slate-500 font-bold">
                                        <th className="p-4 pl-6 font-bold">License Plate</th>
                                        <th className="p-4 font-bold">Vehicle Type</th>
                                        <th className="p-4 font-bold">Valid Entry</th>
                                        <th className="p-4 font-bold">Duration</th>
                                        <th className="p-4 font-bold">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                    {filteredVehicles.map((vehicle, idx) => (
                                        <tr 
                                            key={vehicle.id} 
                                            className={`transition-colors group relative ${vehicle.is_overstay ? 'bg-rose-50/50 dark:bg-rose-900/10 hover:bg-rose-100/50 dark:hover:bg-rose-900/20' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'}`}
                                        >
                                            {/* Overstay Red Border Indicator */}
                                            {vehicle.is_overstay && (
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500"></div>
                                            )}
                                            
                                            <td className="p-4 pl-6">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${vehicle.is_overstay ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-primary/10 group-hover:text-primary'}`}>
                                                        <CarFront className="w-4 h-4" />
                                                    </div>
                                                    <span className={`font-mono font-black tracking-wider ${vehicle.is_overstay ? 'text-rose-700 dark:text-rose-300' : 'text-slate-800 dark:text-slate-200'}`}>
                                                        {vehicle.plate}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">{vehicle.vehicle_type}</span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                                                    <Clock className="w-4 h-4" />
                                                    {new Date(vehicle.entry_time).toLocaleTimeString()}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`text-sm font-black ${vehicle.is_overstay ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                                    {formatDuration(vehicle.duration_minutes)}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                {vehicle.is_overstay ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-600 border border-rose-500/20 shadow-sm animate-pulse">
                                                        <AlertOctagon className="w-3 h-3" /> Overstay Alert
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                        Parked
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredVehicles.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="p-8 text-center text-slate-500 font-bold uppercase tracking-widest">
                                                No active sessions found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="map"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-2xl shadow-sm p-6 space-y-8"
                    >
                        {/* Zone A: Visitors */}
                        <div>
                            <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
                                <h4 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-violet-500"></div>
                                    Zone A <span className="opacity-50 font-medium tracking-normal normal-case ml-2">- Visitor Bays</span>
                                </h4>
                                <span className="text-sm font-bold text-slate-500">{visitorZones.filter(z => z.is_occupied).length} / {visitorZones.length} Occupied</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-3">
                                {visitorZones.map((zone) => (
                                    <ZoneSlot key={zone.id} zone={zone} />
                                ))}
                            </div>
                        </div>

                        {/* Zone B: Residents */}
                        <div>
                            <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
                                <h4 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                    Zone B <span className="opacity-50 font-medium tracking-normal normal-case ml-2">- Resident Bays</span>
                                </h4>
                                <span className="text-sm font-bold text-slate-500">{residentZones.filter(z => z.is_occupied).length} / {residentZones.length} Occupied</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-3">
                                {residentZones.map((zone) => (
                                    <ZoneSlot key={zone.id} zone={zone} />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

/* Helper Component for Rendering Individual Parking Bays */
const ZoneSlot = ({ zone }) => {
    return (
        <div className="group relative">
            <div 
                className={`flex flex-col items-center justify-center aspect-square rounded-xl border-2 transition-all duration-300 shadow-sm
                ${zone.is_occupied 
                    ? 'bg-rose-500/10 border-rose-500/50 text-rose-600 dark:text-rose-400' 
                    : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
                }`}
            >
                <span className="font-black text-lg opacity-80">{zone.slot_id}</span>
                {zone.is_occupied ? (
                    <CarFront className="w-6 h-6 mt-1 opacity-90 text-rose-500" />
                ) : (
                    <span className="text-[10px] font-bold uppercase tracking-widest mt-2 opacity-50">Empty</span>
                )}
            </div>

            {/* Tooltip on Hover if occupied */}
            {zone.is_occupied && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl flex items-center gap-2">
                    <span className="font-mono tracking-widest text-primary-200">{zone.current_plate}</span>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                </div>
            )}
        </div>
    );
};

export default Parking; 
