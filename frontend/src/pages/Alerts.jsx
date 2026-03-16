import React from 'react';
import { AlertTriangle, Clock, MapPin, ShieldAlert, XCircle } from 'lucide-react';

const Alerts = () => {
    const alerts = [
        { id: 1, type: "Blacklisted Vehicle", plate: "MH12BQ9999", location: "Gate 1", time: "10:45 AM", severity: "Critical", purpose: "Known offender entered premises. Immediate security response required." },
        { id: 2, type: "Unrecognized Plate", plate: "UNKNOWN", location: "Exit Gate", time: "11:20 AM", severity: "High", purpose: "Vehicle plate could not be matched against registered or expected visitor database." },
        { id: 3, type: "Overstay Alert", plate: "KA05JK5555", location: "Visitor Parking", time: "02:00 PM", severity: "Medium", purpose: "Visitor vehicle exceeded authorized parking duration by 2 hours." },
    ];

    const getSeverityStyle = (severity) => {
        switch (severity) {
            case 'Critical': return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.3)] ring-1 ring-rose-500/50';
            case 'High': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.2)]';
            case 'Medium': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
            case 'Low': return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20';
            default: return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20';
        }
    };

    const getSeverityBadge = (severity) => {
        switch (severity) {
            case 'Critical': return 'bg-rose-500 text-white shadow-sm';
            case 'High': return 'bg-orange-500 text-white shadow-sm';
            case 'Medium': return 'bg-amber-500 text-white shadow-sm';
            case 'Low': return 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300';
            default: return 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300';
        }
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <AlertTriangle className="text-rose-500 w-8 h-8" />
                        System Alerts & Violations
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium pl-11">Real-time security notifications and anomaly detection.</p>
                </div>
                <button className="bg-rose-50 text-rose-600 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 border border-rose-200 dark:border-rose-500/30 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm">
                    <XCircle className="w-5 h-5" /> Clear All Alerts
                </button>
            </div>

            <div className="grid gap-4">
                {alerts.map((alert) => (
                    <div key={alert.id} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between hover:border-violet-500/30 transition-all group shadow-sm">
                        <div className="flex items-start sm:items-center gap-4 mb-4 sm:mb-0">
                            <div className={`p-4 rounded-xl ${getSeverityStyle(alert.severity)} transition-all shrink-0`}>
                                <ShieldAlert className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-slate-900 dark:text-white font-bold text-lg group-hover:text-primary transition-colors">{alert.type}</h3>
                                <p className="text-slate-600 dark:text-slate-300 text-sm mt-1 max-w-xl">{alert.purpose}</p>
                                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary" /> {alert.time}</span>
                                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-primary" /> {alert.location}</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-left sm:text-right w-full sm:w-auto flex flex-row sm:flex-col justify-between sm:justify-start items-center sm:items-end border-t border-slate-100 dark:border-slate-800 sm:border-0 pt-4 sm:pt-0">
                            <div className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xl tracking-widest bg-slate-100 dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-inner">
                                {alert.plate}
                            </div>
                            <span className={`inline-block mt-0 sm:mt-2 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md ${getSeverityBadge(alert.severity)}`}>
                                {alert.severity}
                            </span>
                        </div>
                    </div>
                ))}

                {alerts.length === 0 && (
                    <div className="text-center py-12 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-2xl shadow-sm">
                        <ShieldAlert className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">All clear</h3>
                        <p className="text-slate-500 mt-1">No active system alerts.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Alerts;
