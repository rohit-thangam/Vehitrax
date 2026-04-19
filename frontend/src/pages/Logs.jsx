import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, Download, ArrowUpDown, Play, Pause, Calendar, X, Camera, MapPin, Clock, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../utils/auth';

const Logs = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [selectedLog, setSelectedLog] = useState(null);
    const [logsData, setLogsData] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const user = getCurrentUser();

    // Fetch data from backend
    const fetchLogs = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/logs?limit=100');
            const data = await response.json();

            // Map the API response fields to match the frontend expectations
            const mappedLogs = data.map(log => ({
                id: log.id,
                plate: log.plate,
                type: log.type || 'Car',
                date: log.entryTime ? log.entryTime.split(' ')[0] : new Date().toISOString().split('T')[0], // The entryTime is like "10:11:06 AM" but backend currently returns time. Let's handle it
                time: log.entryTime, // just use the full string for now as it contains time
                location: log.location || 'Gate 1 - Entry',
                status: log.status || 'Unknown',
                image: log.image || null,
            }));

            setLogsData(mappedLogs);
        } catch (error) {
            console.error('Failed to fetch logs from API:', error);
        }
    };

    useEffect(() => {
        // Fetch initially
        fetchLogs();
    }, []);

    // CSV Export Logic
    const handleExportCSV = () => {
        let exportData = logsData;

        // Apply Date Range Filter for Export if both dates are selected
        if (startDate && endDate) {
            exportData = exportData.filter(log => {
                const logDate = new Date(log.date);
                return logDate >= new Date(startDate) && logDate <= new Date(endDate);
            });
        }

        if (exportData.length === 0) {
            alert("No data available for the selected date range.");
            return;
        }

        const headers = ['Plate Number', 'Vehicle Type', 'Date', 'Time', 'Location', 'Status'];
        const csvRows = [headers.join(',')];

        exportData.forEach(log => {
            const row = [log.plate, log.type, log.date, log.time, log.location, log.status];
            csvRows.push(row.join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `detection_logs_${startDate || 'all'}_to_${endDate || 'all'}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Filter Logic for Table Display
    const filteredLogs = logsData.filter(log => {
        const matchesSearch = log.plate.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'All' || log.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Registered': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
            case 'Visitor': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
            case 'Blacklisted': return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.3)]';
            default: return 'bg-slate-500/10 text-slate-500 border border-slate-500/20';
        }
    };

    return (
        <div className="space-y-6 pb-12">
            <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Detection Logs</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Historical records of all vehicle movements across checkposts.</p>
            </div>

            {/* Controls */}
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative group">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search License Plate..."
                            className="w-full sm:w-64 bg-white dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none border border-slate-200 dark:border-slate-800 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all placeholder-slate-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Filter Dropdown */}
                    <div className="relative">
                        <select
                            className="w-full sm:w-48 appearance-none bg-white dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-200 rounded-xl pl-4 pr-10 py-2.5 outline-none border border-slate-200 dark:border-slate-800 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all font-medium"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="All">All Statuses</option>
                            <option value="Registered">Registered</option>
                            <option value="Visitor">Visitor</option>
                            <option value="Unknown">Unknown</option>
                            <option value="Blacklisted">Blacklisted</option>
                        </select>
                        <Filter className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>

                {/* Live Mode Toggle & CSV Export */}
                <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-4 border-t border-slate-200 dark:border-slate-800/50 md:border-0 pt-4 md:pt-0">

                    {/* Date Range Picker for CSV Export */}
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                        <Calendar className="w-4 h-4 text-slate-400 ml-2" />
                        <input
                            type="date"
                            className="bg-transparent text-xs text-slate-700 dark:text-slate-300 outline-none"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <span className="text-slate-400 font-bold text-xs">-</span>
                        <input
                            type="date"
                            className="bg-transparent text-xs text-slate-700 dark:text-slate-300 outline-none pr-2"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-sm font-bold py-2.5 px-4 rounded-xl transition-all shadow-sm group w-full sm:w-auto justify-center"
                    >
                        <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                        Export
                    </button>

                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-200/50 dark:border-slate-800/50">
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                                    Plate Number <ArrowUpDown className="w-3 h-3" />
                                </th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                                    Time <ArrowUpDown className="w-3 h-3" />
                                </th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Location</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="inline-flex items-center px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-inner">
                                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200 tracking-widest">{log.plate}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-sm font-medium text-slate-600 dark:text-slate-400">{log.type}</td>
                                    <td className="py-4 px-6 text-sm font-medium text-slate-600 dark:text-slate-400">{log.date}</td>
                                    <td className="py-4 px-6 text-sm font-bold text-slate-800 dark:text-slate-300">{log.time}</td>
                                    <td className="py-4 px-6 text-sm font-medium text-slate-600 dark:text-slate-400">{log.location}</td>
                                    <td className="py-4 px-6">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${getStatusStyle(log.status)}`}>
                                            {log.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right whitespace-nowrap">
                                        <button
                                            onClick={() => setSelectedLog(log)}
                                            className="text-primary hover:text-primary-dark dark:hover:text-primary-light text-sm font-bold transition-colors"
                                        >
                                            Details
                                        </button>
                                        {user?.role === 'admin' && (
                                            <button
                                                onClick={async () => {
                                                    if(window.confirm(`Are you sure you want to delete log for ${log.plate}?`)) {
                                                        try {
                                                            const res = await fetch(`http://localhost:8000/api/logs/${log.id}`, { method: 'DELETE' });
                                                            if(res.ok) {
                                                                fetchLogs();
                                                            }
                                                        } catch (e) {
                                                            console.error("Failed to delete log", e);
                                                        }
                                                    }
                                                }}
                                                className="text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 text-sm font-bold transition-colors ml-4"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredLogs.length === 0 && (
                        <div className="p-10 text-center text-slate-500 font-medium">
                            No logs found matching your criteria.
                        </div>
                    )}
                </div>

                {/* Pagination Placeholder */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-950/30 flex items-center justify-between text-sm text-slate-500">
                    <span>Showing 1 to {filteredLogs.length} of {filteredLogs.length} entries</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 text-slate-700 dark:text-slate-300 font-medium pb-2" disabled>Previous</button>
                        <button className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300 font-medium pb-2">Next</button>
                    </div>
                </div>
            </div>

            {/* Log Details Modal */}
            <AnimatePresence>
                {selectedLog && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            onClick={() => setSelectedLog(null)}
                        ></motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl relative z-10 overflow-hidden border border-slate-200 dark:border-slate-800"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    <Camera className="w-5 h-5 text-primary" />
                                    Detection Details
                                </h3>
                                <button
                                    onClick={() => setSelectedLog(null)}
                                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 space-y-6">
                                {/* Snapshot Placeholder */}
                                <div className="space-y-3">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Vehicle Snapshot</p>
                                    <div className="h-48 rounded-xl overflow-hidden border-2 border-slate-100 dark:border-slate-800 relative group bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
                                        <img
                                            src={selectedLog.image || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop"}
                                            alt="Vehicle Plate Crop"
                                            className="w-full h-full object-contain !opacity-100"
                                        />
                                        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
                                            <span className="font-mono text-white font-bold tracking-widest">{selectedLog.plate}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50 space-y-1">
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1.5"><Clock className="w-3 h-3 text-primary" /> TIME OF ENTRY</p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-slate-200">{selectedLog.date} • {selectedLog.time}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50 space-y-1">
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1.5"><MapPin className="w-3 h-3 text-primary" /> LOCATION</p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-slate-200">{selectedLog.location}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50 space-y-1">
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1.5"><Camera className="w-3 h-3 text-primary" /> DETECTED TYPE</p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-slate-200">{selectedLog.type}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50 space-y-1">
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1.5"><ShieldAlert className="w-3 h-3 text-primary" /> SYSTEM STATUS</p>
                                        <span className={`inline-block mt-0.5 px-2 py-0.5 text-[10px] font-bold rounded-lg uppercase tracking-wider ${getStatusStyle(selectedLog.status)}`}>
                                            {selectedLog.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex justify-end gap-3">
                                <button
                                    onClick={() => setSelectedLog(null)}
                                    className="px-5 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                >
                                    Close
                                </button>
                                {selectedLog.status === 'Registered' && (
                                    <button
                                        onClick={() => navigate('/dashboard/database')}
                                        className="px-5 py-2 text-sm font-bold text-white bg-primary hover:bg-primary-dark transition-colors rounded-xl shadow-md shadow-primary/20"
                                    >
                                        View Owner Profile
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Logs;
