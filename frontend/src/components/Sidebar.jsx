import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Video,
    FileText,
    Database,
    Users,
    AlertTriangle,
    ParkingCircle,
    BarChart3,
    Settings,
    LogOut,
    X,
    Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { getCurrentUser, ROLES, logoutUser } from '../utils/auth';

const Sidebar = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const user = getCurrentUser();
    const isSecurity = user?.role === ROLES.SECURITY;

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'Live Monitoring', icon: Video, path: '/dashboard/live' },
        { name: 'Detection Logs', icon: FileText, path: '/dashboard/logs' },
        { name: 'Registered Vehicles', icon: Database, path: '/dashboard/database' },
        { name: 'Alerts', icon: AlertTriangle, path: '/dashboard/alerts' },
        { name: 'Parking Management', icon: ParkingCircle, path: '/dashboard/parking' },
        { name: 'Reports', icon: BarChart3, path: '/dashboard/reports' },
    ].filter(item => {
        if (!isSecurity) return true;
        return ['Dashboard', 'Live Monitoring', 'Alerts'].includes(item.name);
    });

    return (
        <aside
            className={`
                fixed left-0 top-0 h-screen w-64 bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-800/50 flex flex-col z-50
                transition-all duration-300 ease-in-out shadow-[0_0_40px_rgba(0,0,0,0.05)] dark:shadow-[0_0_40px_rgba(0,0,0,0.2)]
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}
        >
            <div className="h-20 px-6 border-b border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex items-center gap-3 relative z-10">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-violet-500/20">
                        <Shield className="w-4 h-4" />
                    </div>
                    <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 tracking-tight">
                        Vehitrax
                    </span>
                </div>
                {/* Close Button for Mobile */}
                <button
                    onClick={onClose}
                    className="lg:hidden text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary-light transition-colors relative z-10"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-6 custom-scrollbar">
                <ul className="space-y-1.5 px-4">
                    {navItems.map((item) => (
                        <li key={item.name}>
                            <NavLink
                                to={item.path}
                                end={item.path === '/dashboard'}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${isActive
                                        ? 'text-primary dark:text-primary-light font-bold shadow-md shadow-violet-500/10 dark:shadow-violet-500/20 bg-white dark:bg-slate-800/80 border border-violet-100 dark:border-violet-500/20'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <div className={`absolute inset-0 bg-gradient-to-r from-violet-500/5 to-transparent opacity-0 transition-opacity ${isActive ? 'opacity-100' : 'group-hover:opacity-100'}`}></div>
                                        <item.icon className={`w-5 h-5 relative z-10 transition-colors ${isActive ? 'text-primary dark:text-primary-light' : 'text-slate-400 group-hover:text-primary'}`} />
                                        <span className="text-sm relative z-10">{item.name}</span>
                                        {isActive && (
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                                        )}
                                    </>
                                )}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="px-4 py-4 border-t border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/20">
                {!isSecurity && (
                    <NavLink
                        to="/dashboard/settings"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group mb-2 ${isActive
                                ? 'text-primary font-bold bg-white dark:bg-slate-800/80 border border-violet-100 dark:border-violet-500/20 shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium hover:bg-white dark:hover:bg-slate-800/50 border border-transparent'
                            }`
                        }
                    >
                        <Settings className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                        <span className="text-sm">Settings</span>
                    </NavLink>
                )}
                <button
                    onClick={() => {
                        logoutUser();
                        navigate('/login');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 font-medium transition-all duration-300 group border border-transparent hover:border-red-100 dark:hover:border-red-500/20"
                >
                    <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
