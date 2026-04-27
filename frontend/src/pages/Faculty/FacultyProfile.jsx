import React, { useState } from 'react';
import axios from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
    User,
    Phone,
    Lock,
    Camera,
    CheckCircle,
    Shield,
    Mail,
    Info,
    ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const FacultyProfile = () => {
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        phone_number: user?.phone_number || '',
        current_password: '',
        new_password: '',
        confirm_password: ''
    });

    const [imagePreview, setImagePreview] = useState(user?.profile_image || null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            handleProfileUpdate(file);
        }
    };

    const handleProfileUpdate = async (file) => {
        const updateData = new FormData();
        if (file) updateData.append('profile_image', file);
        updateData.append('phone_number', formData.phone_number);

        setLoading(true);
        try {
            const res = await axios.put('/faculty/profile', updateData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                toast.success("Identity updated successfully");
                // In a real app, update global auth context too
            }
        } catch (error) {
            toast.error("Handshake failed");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (formData.new_password !== formData.confirm_password) {
            return toast.error("Password mismatch detection");
        }

        setLoading(true);
        try {
            const res = await axios.put('/faculty/profile', {
                password: formData.new_password
            });
            if (res.data.success) {
                toast.success("Security credentials updated");
                setFormData({ ...formData, current_password: '', new_password: '', confirm_password: '' });
            }
        } catch (error) {
            toast.error("Security update failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-12">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic">Identity Control</h2>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Manage your core credentials and public profile</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left: Identity Card */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-slate-900 rounded-[3.5rem] p-10 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#008080]/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>

                        <div className="relative z-10 flex flex-col items-center">
                            <div className="relative group/avatar cursor-pointer mb-8">
                                <div className="w-40 h-40 bg-white/10 backdrop-blur-xl rounded-[3rem] border-2 border-white/20 flex items-center justify-center overflow-hidden transition-all duration-700 group-hover/avatar:scale-105 group-hover/avatar:border-[#008080]">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={64} className="text-slate-500" />
                                    )}
                                </div>
                                <label
                                    htmlFor="avatar-upload"
                                    className="absolute bottom-2 right-2 w-12 h-12 bg-[#008080] text-white rounded-2xl flex items-center justify-center shadow-2xl cursor-pointer hover:bg-[#008080] transition-all hover:scale-110 active:scale-90"
                                >
                                    <Camera size={20} />
                                    <input type="file" id="avatar-upload" className="hidden" onChange={handleImageChange} />
                                </label>
                            </div>

                            <h3 className="text-2xl font-black tracking-tight mb-2 italic">{user?.name}</h3>
                            <p className="text-[10px] font-black text-[#008080] uppercase tracking-[0.3em] mb-8">Authorized Faculty</p>

                            <div className="w-full space-y-4 pt-10 border-t border-white/10">
                                <div className="flex items-center gap-4 text-slate-400">
                                    <Mail size={16} />
                                    <span className="text-xs font-bold truncate">{user?.email}</span>
                                </div>
                                <div className="flex items-center gap-4 text-emerald-400">
                                    <Shield size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Enterprise Secured</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">System Privileges</h4>
                        <div className="space-y-4">
                            {[
                                'Full Roster Access',
                                'Cross-Student Interaction',
                                'Asset Distribution Rights',
                                'Session Orchestration'
                            ].map((priv, idx) => (
                                <div key={idx} className="flex items-center gap-3 text-slate-700">
                                    <CheckCircle size={14} className="text-emerald-500" />
                                    <span className="text-xs font-bold">{priv}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Forms */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Basic Info */}
                    <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 bg-[#008080]/10 rounded-2xl flex items-center justify-center text-[#008080]">
                                <Info size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Contact Matrix</h3>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Update your reachable indicators</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Global Phone Number</label>
                                <div className="relative group">
                                    <Phone className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#008080] transition-colors" size={18} />
                                    <input
                                        type="text"
                                        className="w-full pl-18 pr-8 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#008080]/5 focus:border-[#008080] transition-all shadow-sm"
                                        placeholder="+91 XXXXX XXXXX"
                                        value={formData.phone_number}
                                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                    />
                                </div>
                            </div>
                            <button
                                onClick={() => handleProfileUpdate()}
                                className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all inline-flex items-center gap-3"
                            >
                                Synchronize Updates
                                <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Password Update */}
                    <form onSubmit={handlePasswordChange} className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
                                <Lock size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Security Vault</h3>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Rotate access credentials</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">New Password</label>
                                <input
                                    type="password"
                                    className="w-full px-10 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-rose-500/5 focus:border-rose-500 transition-all shadow-sm"
                                    placeholder="••••••••"
                                    value={formData.new_password}
                                    onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Confirm Handshake</label>
                                <input
                                    type="password"
                                    className="w-full px-10 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-rose-500/5 focus:border-rose-500 transition-all shadow-sm"
                                    placeholder="••••••••"
                                    value={formData.confirm_password}
                                    onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-rose-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 transition-all shadow-xl shadow-rose-100 disabled:opacity-50"
                        >
                            {loading ? 'Executing Rotation...' : 'Rotate Security Tokens'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FacultyProfile;
