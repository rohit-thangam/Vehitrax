import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowRight, AlertCircle, Moon, Sun, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../utils/auth';
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
                        ease: "easeIn",
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
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-violet-600/60 dark:bg-violet-600/40 rounded-full blur-[120px] animate-blob mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-600/60 dark:bg-indigo-600/40 rounded-full blur-[120px] animate-blob animation-delay-2000 mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute top-[30%] left-[30%] w-[40vw] h-[40vw] bg-fuchsia-600/50 dark:bg-fuchsia-600/30 rounded-full blur-[120px] animate-blob animation-delay-4000 mix-blend-multiply dark:mix-blend-screen"></div>

        {/* Floating star-like particles */}
        <FloatingParticles />

        {/* Dynamic Panning Grid with gradient mask */}
        <div className="absolute inset-0 opacity-50 dark:opacity-30 bg-[linear-gradient(rgba(99,102,241,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.3)_1px,transparent_1px)] bg-[length:40px_40px] animate-pan-grid [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]"></div>
    </div>
);

const Login = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        const result = loginUser(formData.username, formData.password);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center text-slate-900 dark:text-white transition-colors duration-500 p-4 relative selection:bg-primary/30 font-sans">

            <BackgroundDecorations />

            {/* Top Right Controls */}
            <div className="absolute top-8 right-8 flex items-center gap-4 z-20">
                <button
                    onClick={toggleTheme}
                    className="p-3 rounded-xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/40 dark:border-white/10 hover:bg-white/60 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300 transition-all shadow-sm"
                >
                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
            </div>

            {/* Back home link */}
            <div className="absolute top-8 left-8 z-20">
                <Link to="/" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/40 dark:border-white/10 hover:bg-white/60 dark:hover:bg-slate-800/60 text-sm font-bold text-slate-600 dark:text-slate-300 transition-all shadow-sm">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                className="w-full max-w-md bg-white/60 dark:bg-[#1a1a2e]/60 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/50 dark:border-white/10 p-10 relative z-10"
            >
                <div className="text-center mb-10">
                    <div className="flex mx-auto items-center justify-center w-24 h-24 mb-4">
                        <img src={logoIcon} alt="Vehitrax" className="w-full h-full object-contain drop-shadow-2xl" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Access Vehitrax</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 font-medium">
                        Log in to monitor the intelligent infrastructure
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50/80 dark:bg-red-900/20 backdrop-blur border border-red-200 dark:border-red-800/50 rounded-xl p-4 flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-bold">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            {error}
                        </motion.div>
                    )}

                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 ml-1">Username</label>
                        <input
                            type="text"
                            placeholder="admin or security"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl px-5 py-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary backdrop-blur-sm transition-all shadow-inner"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 ml-1">Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl px-5 py-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary backdrop-blur-sm transition-all shadow-inner"
                        />
                    </div>

                    <div className="flex items-center justify-between text-sm px-1">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" className="w-4 h-4 cursor-pointer accent-violet-600 transition-all" />
                            <span className="text-slate-600 dark:text-slate-400 font-medium group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">Remember me</span>
                        </label>
                        <a href="#" className="font-bold text-primary hover:text-primary-light transition-colors">Recover Access?</a>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.6)] mt-4 transform hover:-translate-y-0.5 group"
                    >
                        {isLoading ? 'Authenticating...' : 'Connect to Dashboard'}
                        {!isLoading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default Login;
