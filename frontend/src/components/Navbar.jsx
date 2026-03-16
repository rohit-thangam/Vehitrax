import React, { useState, useEffect, useRef } from 'react';
import { Bell, User, Search, Menu, Moon, Sun, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';

import { getCurrentUser } from '../utils/auth';
import { useTheme } from '../context/ThemeContext';

const Navbar = ({ onMenuClick }) => {
    const [time, setTime] = useState(new Date());
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const notificationsRef = useRef(null);
    const profileRef = useRef(null);
    const user = getCurrentUser();
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Handle clicks outside of dropdowns to close them
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setIsNotificationsOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isSecurity = user?.role === 'security';

    const adminNotifications = [
        { id: 1, title: 'System Update', message: 'Vehitrax v2.1 installed successfully.', time: '2m ago', unread: true, type: 'info' },
        { id: 2, title: 'Weekly Report Ready', message: 'Your PDF export is ready for review.', time: '1h ago', unread: true, type: 'success' },
        { id: 3, title: 'Database Backup', message: 'Automated snapshot saved.', time: '3h ago', unread: false, type: 'info' },
    ];

    const securityNotifications = [
        { id: 1, title: 'Blacklisted Match', message: 'MH12BQ9999 spotted at Gate 1.', time: 'Just now', unread: true, type: 'critical' },
        { id: 2, title: 'Overstay Alert', message: 'Visitor KA05JK5555 exceeded time.', time: '15m ago', unread: true, type: 'warning' },
        { id: 3, title: 'Shift Started', message: 'Your attendance was logged at 08:00 AM.', time: '4h ago', unread: false, type: 'success' },
    ];

    const notifications = isSecurity ? securityNotifications : adminNotifications;
    const unreadCount = notifications.filter(n => n.unread).length;

    return (
        <header className="h-20 bg-white/40 dark:bg-slate-900/50 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 fixed top-0 right-0 left-0 lg:left-64 z-40 transition-all duration-500 shadow-sm px-4 sm:px-6 lg:px-8">
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-violet-500/30 to-transparent"></div>

            <div className="w-full max-w-7xl mx-auto h-full flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuClick}
                        className="text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary-light lg:hidden transition-colors"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="relative group hidden sm:block">
                        <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search vehicle number..."
                            className="bg-white/60 dark:bg-slate-800/60 text-sm text-slate-800 dark:text-slate-200 rounded-full pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500/40 w-64 lg:w-80 transition-all border border-slate-200/50 dark:border-slate-700/50 placeholder-slate-400 dark:placeholder-slate-500"
                        />
                    </div>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-4 sm:gap-6">
                    {/* Time Display */}
                    <div className="hidden md:flex flex-col items-end mr-2">
                        <span className="text-lg font-mono font-bold text-slate-800 dark:text-white leading-none tracking-tight">
                            {time.toLocaleTimeString([], { hour12: false })}
                        </span>
                        <span className="text-[10px] text-primary font-bold tracking-widest uppercase mt-1">
                            {time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                    </div>

                    <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-full hover:bg-white/80 dark:hover:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary-light transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        {/* Notifications */}
                        <div className="relative" ref={notificationsRef}>
                            <button
                                onClick={() => {
                                    setIsNotificationsOpen(!isNotificationsOpen);
                                    setIsProfileOpen(false);
                                }}
                                className="relative p-2.5 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary-light transition-colors hover:bg-white/80 dark:hover:bg-slate-800/80 rounded-full border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {isNotificationsOpen && (
                                <div className="absolute right-0 top-14 mt-2 w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-50 overflow-hidden transform origin-top-right transition-all">
                                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                                        <p className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                            Notifications
                                            {unreadCount > 0 && (
                                                <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full">{unreadCount} New</span>
                                            )}
                                        </p>
                                        <button className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider">Mark all read</button>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                                        {notifications.length > 0 ? (
                                            <ul className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                                {notifications.map(notif => (
                                                    <li key={notif.id} className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${notif.unread ? 'bg-violet-50/30 dark:bg-violet-900/10' : ''}`}>
                                                        <div className="flex gap-4">
                                                            <div className="shrink-0 mt-1">
                                                                {notif.type === 'critical' ? <ShieldAlert className="w-5 h-5 text-rose-500" /> :
                                                                    notif.type === 'warning' ? <Clock className="w-5 h-5 text-amber-500" /> :
                                                                        notif.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> :
                                                                            <Bell className="w-5 h-5 text-indigo-500" />}
                                                            </div>
                                                            <div>
                                                                <p className={`text-sm tracking-tight ${notif.unread ? 'font-black text-slate-900 dark:text-white' : 'font-bold text-slate-700 dark:text-slate-300'}`}>
                                                                    {notif.title}
                                                                </p>
                                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{notif.message}</p>
                                                                <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider">{notif.time}</p>
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="p-8 text-center text-slate-500">No new notifications</div>
                                        )}
                                    </div>
                                    <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 text-center">
                                        <button className="text-xs font-bold text-slate-500 hover:text-primary transition-colors">View All Notifications</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Profile */}
                        <div className="relative pl-2 sm:pl-4 border-l border-slate-200 dark:border-slate-800" ref={profileRef}>
                            <button
                                onClick={() => {
                                    setIsProfileOpen(!isProfileOpen);
                                    setIsNotificationsOpen(false);
                                }}
                                className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
                            >
                                <div className="text-right hidden xl:block">
                                    <p className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-primary transition-colors">{user?.name || 'Guest'}</p>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{user?.role || 'Visitor'}</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-50 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-primary border border-white dark:border-slate-700 shadow-sm group-hover:shadow-[0_0_15px_rgba(124,58,237,0.2)] transition-all">
                                    <User className="w-5 h-5" />
                                </div>
                            </button>

                            {/* Profile Dropdown */}
                            {isProfileOpen && (
                                <div className="absolute right-0 top-14 mt-2 w-64 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-50 overflow-hidden transform origin-top-right transition-all">
                                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                                        <p className="text-sm font-bold text-slate-800 dark:text-white">User Profile</p>
                                    </div>
                                    <div className="p-4 space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-50 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-primary border border-white dark:border-slate-700 shadow-inner">
                                                <User className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight">{user?.name}</p>
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-primary mt-1">{user?.role}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2 pt-2">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-500 font-medium">ID:</span>
                                                <span className="text-slate-700 dark:text-slate-300 font-mono">EMP-8472</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-500 font-medium">Email:</span>
                                                <span className="text-slate-700 dark:text-slate-300">{user?.username || 'user'}@vehitrax.com</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50">
                                        <button className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:bg-white dark:hover:bg-slate-800/80 rounded-xl transition-all flex items-center gap-2">
                                            Account Settings
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
