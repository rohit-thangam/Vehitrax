import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Camera,
    MapPin,
    Clock,
    CheckCircle,
    AlertTriangle,
    XOctagon,
    ShieldAlert
} from 'lucide-react';

const LiveMonitor = () => {
    const navigate = useNavigate();
    const [videoUrl, setVideoUrl] = useState(null);
    const [selectedCamera, setSelectedCamera] = useState('CAM-01');
    const simulationIntervalRef = React.useRef(null);

    // Simulated Detection Data
    const [lastDetection, setLastDetection] = useState({
        plate: "AP39WD8488",
        confidence: 96,
        type: "Car",
        entryTime: new Date().toLocaleTimeString(),
        status: "Registered", // Registered, Visitor, Blacklisted
        location: "Gate 1 - Entry",
        image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop"
    });

    const [isProcessing, setIsProcessing] = useState(false);
    const [currentVideoId, setCurrentVideoId] = useState(null);

    const startStream = (videoId) => {
        // Close existing stream if any
        if (simulationIntervalRef.current) {
            simulationIntervalRef.current.close();
        }

        const source = new EventSource(`http://localhost:8000/api/stream/detections?video_id=${videoId}`);
        simulationIntervalRef.current = source;

        source.addEventListener('detection', (event) => {
            const data = JSON.parse(event.data);
            setLastDetection(data);
        });

        source.addEventListener('end', (event) => {
            console.log("Stream ended:", event.data);
            source.close();
            setIsProcessing(false);
        });

        source.onerror = (error) => {
            console.error("SSE Error:", error);
            source.close();
            setIsProcessing(false);
        };
    };

    React.useEffect(() => {
        const initLiveFeed = async () => {
            try {
                setIsProcessing(true);
                const response = await fetch('http://localhost:8000/api/video/live_feed');
                const data = await response.json();

                if (data.video_id) {
                    setVideoUrl(`http://localhost:8000/api/stream/video_feed?video_id=${data.video_id}`);
                    setCurrentVideoId(data.video_id);
                    startStream(data.video_id);
                    setIsProcessing(false);
                }
            } catch (error) {
                console.error("Failed to start live feed:", error);
                setIsProcessing(false);
            }
        };

        if (selectedCamera === 'CAM-01') {
            initLiveFeed();
        }

        return () => {
            if (simulationIntervalRef.current) {
                // If it's an EventSource now
                if (simulationIntervalRef.current.close) {
                    simulationIntervalRef.current.close();
                } else {
                    clearInterval(simulationIntervalRef.current);
                }
            }
        };
    }, [selectedCamera]);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Registered':
                return {
                    color: 'text-emerald-500',
                    bg: 'bg-emerald-500/10',
                    border: 'border-emerald-500/20',
                    glow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]',
                    icon: CheckCircle
                };
            case 'Visitor':
                return {
                    color: 'text-amber-500',
                    bg: 'bg-amber-500/10',
                    border: 'border-amber-500/20',
                    glow: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]',
                    icon: AlertTriangle
                };
            case 'Blacklisted':
                return {
                    color: 'text-rose-500',
                    bg: 'bg-rose-500/10',
                    border: 'border-rose-500/30',
                    glow: 'shadow-[0_0_20px_rgba(244,63,94,0.4)]',
                    icon: ShieldAlert
                };
            default:
                return { color: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-500/20', glow: '', icon: CheckCircle };
        }
    };

    const StatusIcon = getStatusStyle(lastDetection.status).icon;
    const styles = getStatusStyle(lastDetection.status);

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col xl:flex-row gap-6 pb-6">

            {/* Left: Live Feed */}
            <div className="flex-1 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-2xl overflow-hidden relative shadow-sm flex flex-col">
        
                {/* Header Overlay */}
                <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
                    <div className="flex items-center gap-3 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-200/50 dark:border-slate-800 shadow-sm">
                        <div className={`w-2.5 h-2.5 ${selectedCamera === 'CAM-01' ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-red-500'} rounded-full`}></div>

                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-widest uppercase">
                                {selectedCamera === 'CAM-01' ? 'Live Feed' : 'No Signal'} •
                            </span>
                            <select
                                className="bg-transparent text-xs font-bold text-primary outline-none cursor-pointer uppercase tracking-widest"
                                value={selectedCamera}
                                onChange={(e) => setSelectedCamera(e.target.value)}
                            >
                                <option className="bg-white dark:bg-slate-900" value="CAM-01">CAM-01 (Main Entry)</option>
                                <option className="bg-white dark:bg-slate-900" value="CAM-02">CAM-02 (Visitor Gate)</option>
                                <option className="bg-white dark:bg-slate-900" value="EXIT-01">EXIT-01 (Outbound)</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {isProcessing && selectedCamera === 'CAM-01' && (
                            <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-800 shadow-sm flex items-center gap-2">
                                <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Processing</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Video Playback / Placeholder */}
                <div className="flex-1 bg-slate-100 dark:bg-slate-950 relative w-full h-full min-h-[400px] flex items-center justify-center">
                    {selectedCamera === 'CAM-01' ? (
                        videoUrl ? (
                            <img
                                src={videoUrl}
                                alt="Live YOLOv8 Stream"
                                className="w-full h-full object-contain bg-black"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
                                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-sm font-bold uppercase tracking-widest">Connecting to Stream...</p>
                            </div>
                        )
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-4 text-slate-400 dark:text-slate-600 bg-slate-200/50 dark:bg-slate-900/50 w-full h-full absolute inset-0 backdrop-blur-md z-0">
                            <div className="w-16 h-16 rounded-full bg-slate-300 dark:bg-slate-800 flex items-center justify-center mb-2 shadow-inner">
                                <XOctagon className="w-8 h-8 opacity-50 text-red-500" />
                            </div>
                            <p className="text-lg font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">No Signal</p>
                            <p className="text-xs font-bold uppercase tracking-widest opacity-60 text-slate-500 dark:text-slate-400">Camera {selectedCamera} is offline</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Detection Details Panel */}
            <div className={`w-full xl:w-96 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-2xl flex flex-col shadow-sm transition-all duration-300 ${lastDetection.status === 'Blacklisted' ? styles.glow : ''}`}>
                <div className="p-5 border-b border-slate-200 dark:border-slate-800/50 flex items-center justify-between">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Camera className="w-5 h-5 text-primary" />
                        Latest Detection
                    </h3>
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        key={lastDetection.plate}
                        className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded"
                    >
                        Just Now
                    </motion.div>
                </div>

                <div className="p-6 flex-1 overflow-y-auto space-y-6 custom-scrollbar">

                    {/* Snapshot */}
                    <div className="space-y-3">
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Capture Snapshot</p>
                        <div className="h-44 rounded-xl overflow-hidden border-2 border-slate-100 dark:border-slate-800 relative group">
                            <img
                                src={lastDetection.image}
                                alt="Vehicle Snapshot"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent"></div>
                        </div>
                    </div>

                    {/* License Plate Zoom */}
                    <div className="space-y-3">
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Recognized Plate</p>
                        <div className="h-16 bg-white dark:bg-slate-950 rounded-xl border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-inner relative overflow-hidden">
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(124,58,237,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:250px_250px] animate-shimmer"></div>
                            <span className="text-3xl font-mono font-black text-slate-800 dark:text-white tracking-[0.2em] relative z-10 drop-shadow-sm">
                                {lastDetection.plate}
                            </span>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className="space-y-3">
                        <div className={`p-4 rounded-xl ${styles.bg} ${styles.border} border flex items-center gap-4 transition-colors`}>
                            <div className={`p-2 rounded-lg bg-white/50 dark:bg-slate-950/50 shadow-sm`}>
                                <StatusIcon className={`w-8 h-8 ${styles.color}`} />
                            </div>
                            <div>
                                <p className={`${styles.color} font-black text-lg tracking-tight uppercase`}>{lastDetection.status}</p>
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mt-0.5">
                                    {lastDetection.status === 'Unknown' ? 'Verification Required' : 'Access Confirmed'}
                                </p>
                            </div>
                        </div>

                        {lastDetection.status === 'Unknown' && (
                            <button
                                onClick={async () => {
                                    if (!lastDetection.id) return;
                                    try {
                                        const res = await fetch(`http://localhost:8000/api/logs/${lastDetection.id}/status`, {
                                            method: 'PATCH',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ status: "Visitor" })
                                        });
                                        if (res.ok) {
                                            setLastDetection({ ...lastDetection, status: "Visitor" });
                                        }
                                    } catch (e) {
                                        console.error("Failed to update status", e);
                                    }
                                }}
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm shadow-emerald-500/20"
                            >
                                <CheckCircle className="w-5 h-5" />
                                Approve as Visitor
                            </button>
                        )}
                    </div>

                    {/* Details List */}
                    <div className="space-y-4 pt-2">
                        <div className="flex justify-between items-center text-sm p-3 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50">
                            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2 font-medium">
                                <MapPin className="w-4 h-4 text-primary" /> Location
                            </span>
                            <span className="text-slate-800 dark:text-slate-200 font-bold">{lastDetection.location}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm p-3 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50">
                            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2 font-medium">
                                <Clock className="w-4 h-4 text-primary" /> Entry Time
                            </span>
                            <span className="text-slate-800 dark:text-slate-200 font-bold">{lastDetection.entryTime}</span>
                        </div>
                    </div>

                </div>

                {/* Action Buttons */}
                <div className="p-5 border-t border-slate-200 dark:border-slate-800/50 grid grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-900/30 rounded-b-2xl">
                    <button className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-sm font-bold py-2.5 rounded-xl transition-all shadow-sm">
                        Dismiss
                    </button>

                    {lastDetection.status === 'Registered' ? (
                        <button
                            onClick={() => navigate('/dashboard/database')}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold py-2.5 rounded-xl transition-all shadow-md shadow-emerald-500/20 transform hover:-translate-y-0.5"
                        >
                            View Owner Details
                        </button>
                    ) : (
                        <button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-sm font-bold py-2.5 rounded-xl transition-all shadow-md shadow-amber-500/20 transform hover:-translate-y-0.5 flex flex-col items-center justify-center leading-tight">
                            <span>Take Action</span>
                            <span className="text-[10px] opacity-90 font-medium">Log as Visitor</span>
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default LiveMonitor;
