import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Moon, Sun, Shield, ArrowRight, Camera, Cpu, FileText, LayoutDashboard, Database,
    Building2, Store, Car, MapPin, X, Mail, MapPinned
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import logoIcon from '../assets/images/colour-icon.png';

const FloatingParticles = () => {
    // Generate 30 random particles
    const particles = Array.from({ length: 30 });
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {particles.map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute bg-violet-400 dark:bg-violet-300 rounded-full mix-blend-screen blur-[1px]"
                    style={{
                        width: Math.random() * 4 + 2 + 'px',
                        height: Math.random() * 4 + 2 + 'px',
                        top: Math.random() * 100 + '%',
                        left: Math.random() * 100 + '%',
                    }}
                    animate={{
                        y: [0, -150, 0],
                        x: [0, Math.random() * 100 - 50, 0],
                        opacity: [0.1, 0.8, 0.1],
                        scale: [1, Math.random() * 2 + 1, 1],
                    }}
                    transition={{
                        duration: Math.random() * 10 + 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: Math.random() * 5,
                    }}
                />
            ))}
        </div>
    );
};

const BackgroundDecorations = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">

        {/* Massive deeply colored glowing orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-violet-600/50 dark:bg-violet-600/40 rounded-full blur-[120px] animate-blob mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-600/50 dark:bg-indigo-600/40 rounded-full blur-[120px] animate-blob animation-delay-2000 mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute top-[30%] left-[30%] w-[40vw] h-[40vw] bg-fuchsia-600/40 dark:bg-fuchsia-600/30 rounded-full blur-[120px] animate-blob animation-delay-4000 mix-blend-multiply dark:mix-blend-screen"></div>

        {/* Floating star-like particles */}
        <FloatingParticles />

        {/* Dynamic Panning Grid with gradient mask */}
        <div className="absolute inset-0 opacity-50 dark:opacity-30 bg-[linear-gradient(rgba(99,102,241,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.3)_1px,transparent_1px)] bg-[length:40px_40px] animate-pan-grid [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]"></div>
    </div>
);

const LandingPage = () => {
    const { theme, toggleTheme } = useTheme();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 10 } }
    };

    const teamContacts = [
        { name: "Rohit T", role: "AI & Backend Developer", email: "rohit.cs22@bitsathy.ac.in", location: "Sankari, Tamil Nadu", initial: "RT" },
        { name: "Srinithi K", role: "Database & System Design", email: "srinithi.cs22@bitsathy.ac.in", location: "Annur, Tamil Nadu", initial: "SK" },
        { name: "Srilekha V", role: "Frontend Developer", email: "srilekha.cs22@bitsathy.ac.in", location: "Annur, Tamil Nadu", initial: "SV" }
    ];

    return (
        <div className="min-h-screen text-slate-800 dark:text-slate-200 transition-colors duration-500 font-sans selection:bg-primary/30 selection:text-primary-dark relative">

            <BackgroundDecorations />

            {/* Navbar */}
            <nav className="fixed w-full z-40 bg-white/40 dark:bg-[#0f0c29]/50 backdrop-blur-xl border-b border-white/20 dark:border-white/10 transition-colors duration-500">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 flex items-center justify-center relative flex-shrink-0">
                            <img src={logoIcon} alt="Vehitrax" className="w-full h-full object-contain drop-shadow-lg" />
                        </div>
                        <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 tracking-tight">Vehitrax</span>
                    </div>

                    <div className="hidden md:flex items-center gap-10">
                        {['Home', 'Features', 'Team'].map((item) => (
                            <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary-light transition-colors relative group">
                                {item}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center gap-6">
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-full hover:bg-white/50 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-all backdrop-blur-md border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        <Link to="/login">
                            <button className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(124,58,237,0.4)] hover:shadow-[0_0_25px_rgba(124,58,237,0.6)] transform hover:-translate-y-0.5 relative overflow-hidden group">
                                <span className="relative z-10">Login</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section (Centered) */}
            <section id="home" className="pt-48 pb-32 overflow-hidden relative z-10">
                <div className="container mx-auto px-6 text-center">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                        className="max-w-4xl mx-auto space-y-10"
                    >
                        <motion.div variants={itemVariants} className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/50 dark:bg-white/5 border border-white/40 dark:border-white/10 backdrop-blur-md shadow-sm">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-500"></span>
                            </span>
                            <span className="text-violet-700 dark:text-violet-300 text-xs font-bold uppercase tracking-widest">
                                Smart Vehicle Monitoring
                            </span>
                        </motion.div>

                        <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white leading-[1.05] tracking-tight drop-shadow-sm">
                            Vehitrax
                        </motion.h1>

                        <motion.h2 variants={itemVariants} className="text-2xl md:text-4xl font-extrabold text-slate-700 dark:text-slate-200">
                            Smarter Vehicle Tracking. <br className="md:hidden" />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-indigo-500">Safer Infrastructure.</span>
                        </motion.h2>

                        <motion.p variants={itemVariants} className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed font-light">
                            Vehitrax is an affordable AI-powered vehicle monitoring system that uses advanced number plate detection and recognition technology to automate security, parking management, and intelligent vehicle tracking across modern infrastructure environments.
                        </motion.p>

                        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
                            <Link to="/login">
                                <button className="px-10 py-5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:shadow-[0_0_35px_rgba(99,102,241,0.6)] transform hover:-translate-y-1 flex items-center gap-3 min-w-[200px] justify-center group">
                                    Get Started
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </Link>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-10 py-5 bg-white/20 dark:bg-slate-900/40 backdrop-blur-md border border-violet-500/30 text-slate-800 dark:text-white font-bold rounded-2xl hover:bg-white/40 dark:hover:bg-slate-800/60 transition-all min-w-[200px] hover:border-violet-500/60 transform hover:-translate-y-1"
                            >
                                Learn More
                            </button>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Detailed Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] border border-white/50 dark:border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-8 md:p-12 z-10 custom-scrollbar"
                        >
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="text-center mb-12">
                                <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4">About Vehitrax</h2>
                                <p className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto">
                                    Vehitrax is developed as a Final Year Engineering Project focused on delivering an affordable, scalable AI-powered vehicle monitoring solution tailored for Indian infrastructure environments.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 text-center">Get in Touch With the Development Team</h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {teamContacts.map((contact, index) => (
                                        <div key={index} className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-white/60 dark:border-white/5 hover:border-violet-500/40 hover:shadow-[0_8px_30px_rgba(124,58,237,0.1)] transition-all duration-300 group">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-100 to-indigo-50 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center font-black text-primary border border-white/50 dark:border-slate-600 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                                    {contact.initial}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900 dark:text-white leading-tight">{contact.name}</h4>
                                                    <span className="text-xs font-bold uppercase tracking-wider text-primary">{contact.role}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <a href={`mailto:${contact.email}`} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors">
                                                    <Mail className="w-4 h-4 text-slate-400" />
                                                    {contact.email}
                                                </a>
                                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                                    <MapPinned className="w-4 h-4 text-slate-400" />
                                                    {contact.location}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Features Section */}
            <section id="features" className="py-32 relative z-10">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: Camera, title: "Real-Time Detection", desc: "Instant ANPR detection with high accuracy using state-of-the-art YOLOv8 AI models." },
                            { icon: Database, title: "Intelligent Identification", desc: "Automated database matching for fast verification of residents, visitors, and blacklisted vehicles." },
                            { icon: LayoutDashboard, title: "Automated Parking", desc: "Track live occupancy, manage entry/exit flows, and optimize parking slot utilization seamlessly." },
                            { icon: Shield, title: "Smart Alerts", desc: "Receive immediate notifications and logging for unauthorized access or potential security breaches." }
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                whileHover={{ y: -8, scale: 1.02 }}
                                className="bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl border border-white/40 dark:border-white/10 hover:border-violet-500/50 dark:hover:border-violet-500/50 transition-all duration-300 group shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]"
                            >
                                <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-indigo-50 dark:from-slate-800 dark:to-slate-800 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:shadow-[0_0_15px_rgba(124,58,237,0.3)] transition-all border border-white dark:border-slate-700">
                                    <feature.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 group-hover:text-primary transition-colors">{feature.title}</h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                    {feature.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-32 relative z-10 overflow-hidden">
                <div className="absolute inset-0 bg-white/20 dark:bg-black/20 backdrop-blur-sm border-y border-white/20 dark:border-white/5"></div>
                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center mb-24">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6">Workflow Pattern</div>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6">How Vehitrax Works</h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">Streamlined automated pipeline from camera capture to actionable live analytics.</p>
                    </div>

                    <div className="relative max-w-6xl mx-auto">
                        <div className="hidden lg:block absolute top-12 left-[5%] w-[90%] h-0.5 bg-gradient-to-r from-transparent via-violet-500/50 to-transparent z-0"></div>

                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-16 lg:gap-8 relative z-10">
                            {[
                                { icon: Camera, step: "1", title: "Capture Output", desc: "CCTV Camera Input" },
                                { icon: Cpu, step: "2", title: "Target Detect", desc: "YOLOv8 AI Vision" },
                                { icon: FileText, step: "3", title: "Text Recognize", desc: "OCR Extraction" },
                                { icon: Database, step: "4", title: "Data Match", desc: "Database Verify" },
                                { icon: LayoutDashboard, step: "5", title: "Live Monitor", desc: "Dashboard Analytics" }
                            ].map((item, index) => (
                                <div key={index} className="flex flex-col items-center text-center group">
                                    <div className="w-24 h-24 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-white/50 dark:border-slate-700 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:text-primary group-hover:border-primary/50 group-hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all duration-300 mb-6 z-10 relative">
                                        <item.icon className="w-10 h-10" />
                                        <div className="absolute -bottom-3 -right-1 w-8 h-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center text-xs font-bold border-2 border-white dark:border-slate-900">
                                            {item.step}
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{item.title}</h3>
                                    <p className="text-xs text-primary font-bold uppercase tracking-wider">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Target Applications & Team Matrix */}
            <section id="team" className="py-32 relative z-10">
                <div className="container mx-auto px-6">

                    {/* Target Infra */}
                    <div className="mb-32">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6">Designed For Modern Infrastructure</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
                            {[
                                { icon: Building2, title: "Societies", desc: "Gated Communities" },
                                { icon: MapPin, title: "Toll Booths", desc: "Highways & Expressways" },
                                { icon: Store, title: "Business", desc: "Office Complexes" },
                                { icon: Car, title: "Parking", desc: "Public Parking Lots" }
                            ].map((app, index) => (
                                <div key={index} className="flex flex-col items-center p-8 bg-white/40 dark:bg-slate-900/30 backdrop-blur-md rounded-3xl border border-white/30 dark:border-white/5 hover:bg-white/60 dark:hover:bg-slate-800/50 hover:border-violet-500/30 transition-all duration-300 text-center cursor-default group">
                                    <app.icon className="w-12 h-12 text-slate-400 dark:text-slate-500 group-hover:text-primary mb-5 transition-colors" />
                                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">{app.title}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium uppercase tracking-wider">{app.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Team */}
                    <div>
                        <div className="text-center mb-20">
                            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6">Meet the Team Behind Vehitrax</h2>
                            <div className="w-24 h-1 bg-gradient-to-r from-violet-500 to-indigo-500 mx-auto rounded-full"></div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
                            {[
                                { name: "Rohit T", role: "AI & Backend Developer", initial: "RT", desc: "Architecting the YOLOv8 pipeline and core FastAPI backend systems." },
                                { name: "Srilekha V", role: "Frontend Developer", initial: "SV", desc: "Crafting the sleek, responsive UI and real-time dashboard experiences." },
                                { name: "Srinithi K", role: "Database & System Design", initial: "SK", desc: "Structuring scalable Firestore databases and system integration workflows." }
                            ].map((member, index) => (
                                <div key={index} className="group bg-white/40 dark:bg-slate-900/30 backdrop-blur-xl p-8 rounded-[2rem] border border-white/40 dark:border-white/10 hover:border-violet-500/50 hover:shadow-[0_10px_40px_rgba(124,58,237,0.1)] transition-all duration-500 text-center relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-2xl font-black text-slate-400 dark:text-slate-500 mb-6 border-4 border-white/50 dark:border-slate-700/50 group-hover:border-violet-500/50 group-hover:text-primary transition-all duration-300 shadow-inner">
                                        {member.initial}
                                    </div>
                                    <h3 className="font-extrabold text-xl text-slate-900 dark:text-white mb-1">{member.name}</h3>
                                    <p className="text-sm text-primary font-bold uppercase tracking-wider mb-4">{member.role}</p>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{member.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 relative z-10 border-t border-black/5 dark:border-white/5 bg-white/20 dark:bg-slate-950/20 backdrop-blur-md text-center">
                <div className="container mx-auto px-6">
                    <div className="flex items-center justify-center gap-3 mb-6 opacity-80">
                        <div className="w-10 h-10 flex items-center justify-center relative flex-shrink-0">
                            <img src={logoIcon} alt="Vehitrax" className="w-full h-full object-contain drop-shadow-md" />
                        </div>
                        <span className="font-black text-slate-900 dark:text-white tracking-widest uppercase">Vehitrax</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                        Smart Vehicle Monitoring System &copy; 2026
                    </p>
                    <p className="absolute bottom-6 right-6 text-slate-400/50 dark:text-slate-500/30 text-xs font-bold uppercase tracking-widest hover:text-primary dark:hover:text-primary transition-colors cursor-default">
                        Engineered with Vision by Rohit
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
