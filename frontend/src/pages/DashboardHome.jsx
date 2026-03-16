import React from 'react';
import { motion } from 'framer-motion';
import { Car, Users, AlertTriangle, ShieldCheck } from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

// Mock Data for Charts
const weeklyTrafficData = [
    { name: 'Mon', vehicles: 850 },
    { name: 'Tue', vehicles: 920 },
    { name: 'Wed', vehicles: 1050 },
    { name: 'Thu', vehicles: 1100 },
    { name: 'Fri', vehicles: 1250 },
    { name: 'Sat', vehicles: 890 },
    { name: 'Sun', vehicles: 780 },
];

const vehicleTypesData = [
    { name: 'Registered Residents', value: 65, color: '#7c3aed' }, // Violet
    { name: 'Visitor/Guest', value: 25, color: '#6366f1' },       // Indigo
    { name: 'Delivery/Service', value: 10, color: '#f59e0b' },    // Amber
];

const StatCard = ({ title, value, icon: Icon, color, delay }) => {
    // Determine color classes based on the passed color prop for the glowing effects
    const themeColors = {
        violet: 'from-violet-500/20 to-violet-500/5 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-500/20 group-hover:border-violet-500/50 group-hover:shadow-[0_0_30px_rgba(124,58,237,0.2)]',
        indigo: 'from-indigo-500/20 to-indigo-500/5 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20 group-hover:border-indigo-500/50 group-hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]',
        amber: 'from-amber-500/20 to-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20 group-hover:border-amber-500/50 group-hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]',
        rose: 'from-rose-500/20 to-rose-500/5 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20 group-hover:border-rose-500/50 group-hover:shadow-[0_0_30px_rgba(244,63,94,0.2)]',
    };

    const currentTheme = themeColors[color] || themeColors.violet;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className={`bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border p-6 rounded-2xl relative overflow-hidden group transition-all duration-500 ${currentTheme}`}
        >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${currentTheme.split(' ')[0]} ${currentTheme.split(' ')[1]} rounded-bl-[100px] -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform duration-500`}></div>

            <div className="flex justify-between items-start relative z-10">
                <div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">{title}</p>
                    <h3 className="text-4xl font-black text-slate-800 dark:text-white mt-2 group-hover:scale-105 origin-left transition-transform">
                        {value}
                    </h3>
                </div>
                <div className={`p-3 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border ${currentTheme.split(' ').find(c => c.startsWith('border-'))} shadow-sm group-hover:-translate-y-1 transition-transform`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs font-medium">
                <span className="text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full flex items-center">
                    ↑ 12%
                </span>
                <span className="text-slate-500">vs yesterday</span>
            </div>
        </motion.div>
    );
};

// Custom Tooltip for Recharts to match our theme
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 p-4 rounded-xl shadow-xl">
                <p className="font-bold text-slate-800 dark:text-white mb-2">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
                        {entry.name}: {entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const DashboardHome = () => {
    return (
        <div className="space-y-8 pb-12">
            <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Dashboard Overview</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Real-time insight into vehicle movement and security status.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Vehicles" value="1,248" icon={Car} color="violet" delay={0.1} />
                <StatCard title="Registered" value="856" icon={ShieldCheck} color="indigo" delay={0.2} />
                <StatCard title="Visitors" value="342" icon={Users} color="amber" delay={0.3} />
                <StatCard title="Alerts" value="15" icon={AlertTriangle} color="rose" delay={0.4} />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Activity Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="lg:col-span-2 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 p-6 rounded-2xl shadow-sm"
                >
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Weekly Traffic Volume</h3>
                            <p className="text-sm text-slate-500 text-medium">Total vehicles detected across all gates</p>
                        </div>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={weeklyTrafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorVehicles" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="vehicles" stroke="#7c3aed" strokeWidth={3} fillOpacity={1} fill="url(#colorVehicles)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Distribution Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 p-6 rounded-2xl shadow-sm flex flex-col"
                >
                    <div className="mb-2">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Vehicle Categories</h3>
                        <p className="text-sm text-slate-500 text-medium">Distribution for today</p>
                    </div>
                    <div className="h-64 w-full flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={vehicleTypesData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {vehicleTypesData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Custom Legend */}
                    <div className="space-y-3 mt-4">
                        {vehicleTypesData.map((item, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{item.name}</span>
                                </div>
                                <span className="text-sm font-bold text-slate-800 dark:text-white">{item.value}%</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default DashboardHome;
