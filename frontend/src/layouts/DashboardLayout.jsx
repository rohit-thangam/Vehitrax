import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const DashboardLayout = () => {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsMobileSidebarOpen(!isMobileSidebarOpen);
    };

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-sans selection:bg-violet-500/30">

            {/* Ambient Background Glow for Dashboard */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] bg-violet-600/10 dark:bg-violet-600/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob"></div>
                <div className="absolute top-[20%] -right-[10%] w-[40vw] h-[40vw] bg-indigo-600/10 dark:bg-indigo-600/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000"></div>
            </div>

            {/* Sidebar */}
            <Sidebar
                isOpen={isMobileSidebarOpen}
                onClose={() => setIsMobileSidebarOpen(false)}
            />

            {/* Overlay for mobile */}
            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsMobileSidebarOpen(false)}
                ></div>
            )}

            <div className="flex-1 lg:ml-64 flex flex-col transition-all duration-300 relative z-10 min-w-0">
                <Navbar onMenuClick={toggleSidebar} />

                <main className="flex-1 mt-20 p-4 sm:p-6 lg:p-8 overflow-y-auto relative custom-scrollbar">
                    {/* Background Grid Pattern */}
                    <div className="absolute inset-0 opacity-40 dark:opacity-20 bg-[linear-gradient(to_right,#8b5cf615_1px,transparent_1px),linear-gradient(to_bottom,#8b5cf615_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0"></div>

                    <div className="relative z-10 max-w-7xl mx-auto">
                        <Outlet />
                    </div>

                    {/* Watermark */}
                    <div className="fixed bottom-4 right-6 pointer-events-none opacity-40 dark:opacity-50 z-50">
                        <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">
                            Engineered with Vision by Rohit
                        </p>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
