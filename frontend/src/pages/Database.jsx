import React, { useState, useEffect } from 'react';
import { Search, Plus, UserCheck, Mail, Phone, CarFront, X, Trash2, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Database = () => {
    const [residents, setResidents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingResidentId, setEditingResidentId] = useState(null);

    // Form State
    const [newResident, setNewResident] = useState({
        name: '',
        flat: '',
        phone: '',
        email: '',
        vehiclePlate: '',
        vehicleType: 'Car'
    });

    useEffect(() => {
        fetchResidents();
    }, []);

    const fetchResidents = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/vehicles/');
            if (res.ok) {
                const data = await res.json();
                // Map the backend data to the frontend state structure
                const formatted = data.map(v => ({
                    id: v.id,
                    name: v.name,
                    flat: v.flat,
                    phone: v.phone,
                    email: v.email,
                    vehicles: [{ plate: v.vehiclePlate, type: v.vehicleType }]
                }));
                setResidents(formatted);
            }
        } catch (error) {
            console.error("Failed to fetch residents", error);
        }
    };

    const handleAddResident = async (e) => {
        e.preventDefault();

        const payload = {
            name: newResident.name,
            flat: newResident.flat,
            phone: newResident.phone,
            email: newResident.email,
            vehiclePlate: newResident.vehiclePlate,
            vehicleType: newResident.vehicleType
        };

        try {
            if (editingResidentId) {
                // Update existing resident
                const res = await fetch(`http://localhost:8000/api/vehicles/${editingResidentId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (res.ok) fetchResidents();
                else alert("Failed to update resident");
            } else {
                // Add new resident
                const res = await fetch('http://localhost:8000/api/vehicles/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (res.ok) fetchResidents();
                else {
                    const errorData = await res.json();
                    alert(errorData.detail || "Failed to add resident");
                }
            }
        } catch (error) {
            console.error("API error", error);
            alert("Error communicating with server.");
        }

        setIsAddModalOpen(false);
        setEditingResidentId(null);
        setNewResident({ name: '', flat: '', phone: '', email: '', vehiclePlate: '', vehicleType: 'Car' });
    };

    const handleEditClick = (resident) => {
        setNewResident({
            name: resident.name,
            flat: resident.flat,
            phone: resident.phone,
            email: resident.email,
            vehiclePlate: resident.vehicles[0]?.plate || '',
            vehicleType: resident.vehicles[0]?.type || 'Car'
        });
        setEditingResidentId(resident.id);
        setIsAddModalOpen(true);
    };

    const handleDeleteResident = async (id) => {
        if (window.confirm("Are you sure you want to remove this resident? This action cannot be undone.")) {
            try {
                const res = await fetch(`http://localhost:8000/api/vehicles/${id}`, {
                    method: 'DELETE'
                });
                if (res.ok) fetchResidents();
                else alert("Failed to delete resident");
            } catch (error) {
                console.error("API error", error);
            }
        }
    };


    const filteredResidents = residents.filter(res =>
        res.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.flat.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.vehicles.some(v => v.plate.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Registered Vehicles</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Manage authorized residents and their registered vehicles.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingResidentId(null);
                        setNewResident({ name: '', flat: '', phone: '', email: '', vehiclePlate: '', vehicleType: 'Car' });
                        setIsAddModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-bold py-2.5 px-5 rounded-xl transition-all shadow-md shadow-violet-500/20 hover:shadow-violet-500/40 transform hover:-translate-y-0.5"
                >
                    <Plus className="w-5 h-5" />
                    Add Resident
                </button>
            </div>

            {/* Verification Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 p-6 rounded-2xl shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center border border-violet-500/20">
                        <UserCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">Total Residents</p>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">1,248</h3>
                    </div>
                </div>
                <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 p-6 rounded-2xl shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                        <CarFront className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">Active Vehicles</p>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">1,856</h3>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-violet-600 to-indigo-600 p-6 rounded-2xl shadow-lg relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="relative z-10 text-white">
                        <h3 className="text-lg font-bold mb-2">Automated Plate Recognition</h3>
                        <p className="text-indigo-100 text-sm font-medium leading-relaxed">
                            Vehicles listed here are automatically granted access through the main gates using AI vision.
                        </p>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 p-4 rounded-2xl shadow-sm">
                <div className="relative group max-w-xl">
                    <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by name, flat, or vehicle plate..."
                        className="w-full bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 rounded-xl pl-12 pr-4 py-3 outline-none border border-slate-200 dark:border-slate-800 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all placeholder-slate-400 font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Resident Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredResidents.map(resident => (
                    <div key={resident.id} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group">

                        <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/50 flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full border-2 border-violet-100 dark:border-violet-500/20 bg-violet-50 dark:bg-slate-800 flex items-center justify-center text-xl font-black text-violet-600 dark:text-violet-400 shadow-inner">
                                    {resident.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{resident.name}</h3>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 mt-1 uppercase tracking-wider border border-slate-200 dark:border-slate-700">
                                        Flat: {resident.flat}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleEditClick(resident)}
                                    className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors group relative"
                                    title="Edit Resident"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDeleteResident(resident.id)}
                                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors group relative"
                                    title="Remove Resident"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Contact Details */}
                            <div className="space-y-3">
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-2">Contact Info</p>
                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-100 dark:border-slate-700">
                                        <Phone className="w-4 h-4" />
                                    </div>
                                    <span className="font-medium">{resident.phone}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-100 dark:border-slate-700">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <span className="font-medium truncate">{resident.email}</span>
                                </div>
                            </div>

                            {/* Registered Vehicles */}
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-3">Vehicles ({resident.vehicles.length})</p>
                                <div className="space-y-2">
                                    {resident.vehicles.map((v, i) => (
                                        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                                            <div className="flex items-center gap-2">
                                                <CarFront className="w-4 h-4 text-emerald-500" />
                                                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{v.plate}</span>
                                            </div>
                                            <span className="text-xs text-slate-500 font-medium bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">{v.type}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                ))}
            </div>

            {filteredResidents.length === 0 && (
                <div className="text-center py-12 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-2xl shadow-sm">
                    <UserCheck className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">No residents found</h3>
                    <p className="text-slate-500 mt-1">Try adjusting your search criteria.</p>
                </div>
            )}

            {/* Add Resident Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            onClick={() => {
                                setIsAddModalOpen(false);
                                setEditingResidentId(null);
                            }}
                        ></motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl relative z-10 overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50 shrink-0">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    <UserCheck className="w-6 h-6 text-primary" />
                                    {editingResidentId ? 'Edit Resident Details' : 'Register New Resident'}
                                </h3>
                                <button
                                    onClick={() => {
                                        setIsAddModalOpen(false);
                                        setEditingResidentId(null);
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleAddResident} className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">

                                {/* Personal Info Section */}
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">Personal Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Full Name</label>
                                            <input
                                                type="text" required
                                                className="w-full bg-slate-50 dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-200 rounded-xl px-4 py-2.5 outline-none border border-slate-200 dark:border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all font-medium"
                                                placeholder="e.g. John Doe"
                                                value={newResident.name} onChange={e => setNewResident({ ...newResident, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Flat / Villa Number</label>
                                            <input
                                                type="text" required
                                                className="w-full bg-slate-50 dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-200 rounded-xl px-4 py-2.5 outline-none border border-slate-200 dark:border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all font-medium uppercase font-mono"
                                                placeholder="e.g. A-101"
                                                value={newResident.flat} onChange={e => setNewResident({ ...newResident, flat: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Phone Number</label>
                                            <input
                                                type="tel" required
                                                className="w-full bg-slate-50 dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-200 rounded-xl px-4 py-2.5 outline-none border border-slate-200 dark:border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all font-medium"
                                                placeholder="+91 98765 43210"
                                                value={newResident.phone} onChange={e => setNewResident({ ...newResident, phone: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Email Address</label>
                                            <input
                                                type="email" required
                                                className="w-full bg-slate-50 dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-200 rounded-xl px-4 py-2.5 outline-none border border-slate-200 dark:border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all font-medium"
                                                placeholder="john@example.com"
                                                value={newResident.email} onChange={e => setNewResident({ ...newResident, email: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Vehicle Info Section */}
                                <div className="pt-2">
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">Primary Vehicle Configuration</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400">License Plate (Required for AI)</label>
                                            <input
                                                type="text" required
                                                className="w-full bg-slate-50 dark:bg-slate-950 text-lg text-slate-800 dark:text-slate-200 rounded-xl px-4 py-2.5 outline-none border border-slate-200 dark:border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all font-black font-mono tracking-widest uppercase placeholder-slate-300 dark:placeholder-slate-700"
                                                placeholder="MH12AB1234"
                                                value={newResident.vehiclePlate} onChange={e => setNewResident({ ...newResident, vehiclePlate: e.target.value.toUpperCase() })}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Vehicle Type</label>
                                            <select
                                                className="w-full bg-slate-50 dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-200 rounded-xl px-4 py-3 outline-none border border-slate-200 dark:border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all font-medium"
                                                value={newResident.vehicleType} onChange={e => setNewResident({ ...newResident, vehicleType: e.target.value })}
                                            >
                                                <option value="Car">Car / SUV</option>
                                                <option value="Bike">Motorcycle / Bike</option>
                                                <option value="Truck">Commercial / Truck</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-slate-900 pb-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsAddModalOpen(false);
                                            setEditingResidentId(null);
                                        }}
                                        className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-dark transition-colors rounded-xl shadow-md shadow-primary/20"
                                    >
                                        {editingResidentId ? 'Update & Save' : 'Register & Save'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Database;
