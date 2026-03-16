import React, { useState } from 'react';
import {
    Settings as SettingsIcon, Bell, Shield, User, Database, Building, Cpu,
    Save, AlertCircle, CheckCircle2, RotateCcw, MonitorSmartphone
} from 'lucide-react';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Form State
    const [config, setConfig] = useState({
        societyName: 'Vehitrax Residences',
        blocks: 4,
        gates: 2,
        aiThreshold: 85,
        saveUnrecognized: true,
        enableNightVision: true,
        emailAlerts: true,
        dailyReports: false,
        retentionDays: 30,
        theme: 'system'
    });

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        }, 1500);
    };

    const handleToggle = (key) => {
        setConfig(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    const tabs = [
        { id: 'general', label: 'General Settings', icon: Building, color: 'text-violet-500' },
        { id: 'ai', label: 'AI & Detection', icon: Cpu, color: 'text-indigo-500' },
        { id: 'notifications', label: 'Notifications', icon: Bell, color: 'text-rose-500' },
        { id: 'data', label: 'Data Management', icon: Database, color: 'text-cyan-500' },
        { id: 'account', label: 'Account & Security', icon: Shield, color: 'text-emerald-500' },
    ];

    const Toggle = ({ label, description, isChecked, onToggle }) => (
        <label className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/40 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group">
            <div className="pr-4">
                <p className="font-bold text-slate-800 dark:text-white">{label}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
            </div>
            <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isChecked ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isChecked ? 'translate-x-6' : 'translate-x-1'}`} />
            </div>
        </label>
    );

    return (
        <div className="space-y-6 pb-12">
            <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                    <SettingsIcon className="text-primary w-8 h-8" />
                    System Configuration
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium pl-11">
                    Manage your deployment parameters, AI thresholds, and security preferences.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-8">

                {/* Sidebar Menu */}
                <div className="space-y-2 lg:col-span-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${activeTab === tab.id
                                    ? 'bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
                                    : 'text-slate-500 hover:bg-white/50 dark:hover:bg-slate-800/50 border border-transparent hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                        >
                            <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? tab.color : 'text-slate-400'}`} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Settings Content */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 p-6 sm:p-8 rounded-2xl shadow-sm min-h-[500px] flex flex-col justify-between">

                        <div className="space-y-6">
                            {/* Header */}
                            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-200 dark:border-slate-800/50">
                                {React.createElement(tabs.find(t => t.id === activeTab)?.icon || SettingsIcon, {
                                    className: `w-6 h-6 ${tabs.find(t => t.id === activeTab)?.color}`
                                })}
                                <h3 className="text-xl font-black text-slate-800 dark:text-white">
                                    {tabs.find(t => t.id === activeTab)?.label}
                                </h3>
                            </div>

                            {/* --- General Settings --- */}
                            {activeTab === 'general' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Facility Name</label>
                                        <input
                                            type="text"
                                            name="societyName"
                                            value={config.societyName}
                                            onChange={handleInputChange}
                                            className="w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-medium"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Total Blocks/Towers</label>
                                            <input
                                                type="number"
                                                name="blocks"
                                                value={config.blocks}
                                                onChange={handleInputChange}
                                                className="w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-medium"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Total Entry Gates</label>
                                            <input
                                                type="number"
                                                name="gates"
                                                value={config.gates}
                                                onChange={handleInputChange}
                                                className="w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-medium"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">UI Theme</label>
                                        <div className="flex gap-4">
                                            {['light', 'dark', 'system'].map(theme => (
                                                <button
                                                    key={theme}
                                                    onClick={() => setConfig({ ...config, theme })}
                                                    className={`px-4 py-2 rounded-lg font-bold capitalize transition-all border ${config.theme === theme
                                                            ? 'bg-primary text-white border-primary shadow-md'
                                                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                                        }`}
                                                >
                                                    {theme}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- AI & Detection --- */}
                            {activeTab === 'ai' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 p-4 rounded-xl flex gap-3 text-indigo-800 dark:text-indigo-300">
                                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                        <p className="text-sm font-medium">Changes to the AI threshold module require a system reboot which takes ~30 seconds. Proceed with caution.</p>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-end mb-2">
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Confidence Threshold</label>
                                            <span className="text-lg font-black text-primary">{config.aiThreshold}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            name="aiThreshold"
                                            min="50" max="99"
                                            value={config.aiThreshold}
                                            onChange={handleInputChange}
                                            className="w-full accent-primary h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <p className="text-xs text-slate-500 mt-2">Minimum Optical Character Recognition (OCR) confidence required to log an entry automatically.</p>
                                    </div>

                                    <div className="space-y-3 pt-4">
                                        <Toggle
                                            label="Save Unrecognized Plates"
                                            description="Keep a snapshot of plates that fall below the threshold for manual review."
                                            isChecked={config.saveUnrecognized}
                                            onToggle={() => handleToggle('saveUnrecognized')}
                                        />
                                        <Toggle
                                            label="Night Vision Enhancements"
                                            description="Apply CLAHE equalization to camera feeds during 18:00 - 06:00."
                                            isChecked={config.enableNightVision}
                                            onToggle={() => handleToggle('enableNightVision')}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* --- Notifications --- */}
                            {activeTab === 'notifications' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <Toggle
                                        label="Critical Alerts (Blacklisted/Suspicious)"
                                        description="Instantly notify guards and admins when a flagged vehicle is detected."
                                        isChecked={config.emailAlerts}
                                        onToggle={() => handleToggle('emailAlerts')}
                                    />
                                    <Toggle
                                        label="Daily Summary Digest"
                                        description="Send a PDF breakdown of peak traffic and anomalies at midnight."
                                        isChecked={config.dailyReports}
                                        onToggle={() => handleToggle('dailyReports')}
                                    />
                                </div>
                            )}

                            {/* --- Data Management --- */}
                            {activeTab === 'data' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Data Retention Policy</label>
                                        <select
                                            name="retentionDays"
                                            value={config.retentionDays}
                                            onChange={handleInputChange}
                                            className="w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-medium appearance-none"
                                        >
                                            <option value="7">7 Days (Lightweight)</option>
                                            <option value="30">30 Days (Standard)</option>
                                            <option value="90">90 Days (Compliance)</option>
                                            <option value="365">1 Year (Archival)</option>
                                        </select>
                                        <p className="text-xs text-slate-500 mt-2">Logs and standard snapshots older than this will be permanently purged.</p>
                                    </div>

                                    <div className="pt-4 flex gap-4">
                                        <button className="flex-1 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-primary dark:hover:border-primary text-slate-700 dark:text-slate-200 px-4 py-3 rounded-xl font-bold transition-all flex justify-center items-center gap-2">
                                            <Download className="w-4 h-4" /> Export All Data
                                        </button>
                                        <button className="flex-1 bg-rose-50 dark:bg-rose-500/10 border-2 border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 px-4 py-3 rounded-xl font-bold transition-all flex justify-center items-center gap-2">
                                            <RotateCcw className="w-4 h-4" /> Reset Database
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* --- Account --- */}
                            {activeTab === 'account' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 text-center py-12">
                                    <div className="w-20 h-20 rounded-full bg-violet-100 dark:bg-violet-900/30 mx-auto flex items-center justify-center text-violet-600 dark:text-violet-400 mb-4">
                                        <User className="w-10 h-10" />
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-900 dark:text-white">Admin Account</h4>
                                    <p className="text-slate-500 max-w-sm mx-auto">
                                        Account settings (passwords, 2FA, API keys) are managed securely via the overarching Vehitrax central portal.
                                    </p>
                                    <button className="mt-4 text-primary font-bold hover:underline">Manage at Central Portal &rarr;</button>
                                </div>
                            )}

                        </div>

                        {/* Save Actions */}
                        <div className="pt-6 mt-8 border-t border-slate-200 dark:border-slate-800/50 flex justify-end items-center gap-4">
                            {saveSuccess && (
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                                    <CheckCircle2 className="w-5 h-5" /> Saved Successfully
                                </span>
                            )}
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-slate-900 dark:bg-primary hover:bg-slate-800 dark:hover:bg-primary-dark text-white text-sm font-bold py-3 px-8 rounded-xl transition-all shadow-xl shadow-slate-900/20 dark:shadow-primary/20 disabled:opacity-70 flex items-center gap-2"
                            >
                                {isSaving ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                {isSaving ? 'Saving...' : 'Save Configuration'}
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
