import React, { useRef, useState, useEffect } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { FileText, TrendingUp, Users, Activity, Download, Calendar, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { motion } from 'framer-motion';

const Reports = () => {
    const reportRef = useRef(null);
    const [isExporting, setIsExporting] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');

    const handleExportPDF = async () => {
        if (!reportRef.current) return;
        setIsExporting(true);
        try {
            // Apply a slight delay to ensure UI is ready
            await new Promise(resolve => setTimeout(resolve, 100));
            const canvas = await html2canvas(reportRef.current, {
                scale: 2,
                backgroundColor: '#0f172a', // Dark mode background for clean export
                logging: false
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Vehitrax-Report-${selectedDate || 'Latest'}.pdf`);
        } catch (error) {
            console.error("Error generating PDF", error);
        } finally {
            setIsExporting(false);
        }
    };

    const [stats, setStats] = useState({
        kpi: { total_logs: 0, visitor_ratio: 0 },
        vehicleTypes: [],
        weeklyVolume: []
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('http://localhost:8000/api/logs/stats/realtime');
                if (res.ok) {
                    setStats(await res.json());
                }
            } catch (e) {
                console.error("Failed to fetch stats", e);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 2000); // 2 second polling for rapid real-time feel
        return () => clearInterval(interval);
    }, []);

    const hourlyTraffic = [
        { time: '06:00', vehicles: 45 },
        { time: '08:00', vehicles: 350 },
        { time: '10:00', vehicles: 220 },
        { time: '12:00', vehicles: 180 },
        { time: '14:00', vehicles: 195 },
        { time: '16:00', vehicles: 410 },
        { time: '18:00', vehicles: 520 },
        { time: '20:00', vehicles: 280 },
        { time: '22:00', vehicles: 90 },
    ];

    // Custom Tooltip for Charts
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xl">
                    <p className="text-slate-900 dark:text-white font-bold mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm font-medium">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-slate-600 dark:text-slate-400 capitalize">{entry.name}:</span>
                            <span className="text-slate-900 dark:text-white font-bold">{entry.value}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <FileText className="text-primary w-8 h-8" />
                        Intelligence Reports
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium pl-11">
                        Comprehensive analytics and insights from gateway data.
                    </p>
                </div>
                <div className="flex gap-2">
                    <div className="relative group">
                        <input
                            type="date"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                        <button className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 px-4 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 text-sm font-bold flex items-center gap-2 transition-all shadow-sm">
                            <Calendar className="w-4 h-4" />
                            {selectedDate ? selectedDate : "Select Date"}
                        </button>
                    </div>
                    <button
                        onClick={handleExportPDF}
                        disabled={isExporting}
                        className="bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-md shadow-primary/20 disabled:opacity-70"
                    >
                        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        {isExporting ? 'Exporting...' : 'Export PDF'}
                    </button>
                </div>
            </div>

            {/* Report Content to Export */}
            <div ref={reportRef} className="space-y-6 bg-slate-50 dark:bg-slate-950 py-2">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 p-6 rounded-2xl shadow-sm text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                            <Activity className="w-6 h-6" />
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={stats.kpi.total_logs}>
                                {stats.kpi.total_logs.toLocaleString()}
                            </motion.span>
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">Total Weekly Logins</p>
                        <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                            <TrendingUp className="w-3.5 h-3.5" /> Live Sync Active
                        </div>
                    </div>

                    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 p-6 rounded-2xl shadow-sm text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto mb-4 border border-violet-500/20 group-hover:scale-110 transition-transform">
                            <Users className="w-6 h-6" />
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={stats.kpi.visitor_ratio}>
                                {stats.kpi.visitor_ratio}%
                            </motion.span>
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">Visitor Ratio</p>
                        <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-full">
                            <TrendingUp className="w-3.5 h-3.5" /> +5% weekend spike
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-violet-600 flex-col justify-center to-indigo-600 p-6 rounded-2xl shadow-lg relative overflow-hidden group text-center flex items-center">
                        <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="relative z-10 text-white">
                            <h3 className="text-4xl font-black mb-2">99.4%</h3>
                            <p className="text-indigo-100 text-sm font-bold uppercase tracking-widest">Model Accuracy</p>
                            <p className="text-indigo-200 text-xs mt-3 font-medium opacity-80">
                                Based on manual validations.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Main Area Chart - Traffic Volume */}
                    <div className="lg:col-span-2 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 p-6 rounded-2xl shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" /> Traffic Volume Analysis
                        </h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.weeklyVolume} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                                    <RechartsTooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#colorTotal)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Pie Chart - Vehicle Types */}
                    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 p-6 rounded-2xl shadow-sm flex flex-col">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Category Distribution</h3>
                        <div className="flex-1 min-h-[300px] flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.vehicleTypes}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {stats.vehicleTypes.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip content={<CustomTooltip />} />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        iconType="circle"
                                        wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Bar Chart - Hourly Traffic */}
                    <div className="lg:col-span-3 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 p-6 rounded-2xl shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Peak Hour Detection Trends</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={hourlyTraffic} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                                    <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#8b5cf6', opacity: 0.1 }} />
                                    <Bar dataKey="vehicles" fill="#0ea5e9" radius={[6, 6, 0, 0]} maxBarSize={50} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Reports;
