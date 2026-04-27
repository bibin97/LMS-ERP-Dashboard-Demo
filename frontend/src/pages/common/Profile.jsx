import React from 'react';
import { User, Mail, Shield, Smartphone, Lock, AlertCircle, Activity, Camera, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState, useRef } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ProfileConsole = () => {
    const { user, updateUser } = useAuth();
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith('image/')) return toast.error("Please upload an image file");
        if (file.size > 5 * 1024 * 1024) return toast.error("Image size must be less than 5MB");

        const formData = new FormData();
        formData.append('image', file);

        setUploading(true);
        try {
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                const imageUrl = res.data.url;
                // Update user in context and DB
                updateUser({ profile_image: imageUrl });
                
                // Also update in database for persistence
                await api.put('/auth/update-profile-image', { profile_image: imageUrl });
                
                toast.success("Identity visual updated successfully");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to update visual node");
        } finally {
            setUploading(false);
        }
    };

    const DetailBlock = ({ icon: Icon, label, value, color = "text-slate-900" }) => (
        <div className="bg-slate-50/50 p-6 rounded-[24px] border border-slate-100 group hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#008080] shadow-sm group-hover:scale-110 transition-transform">
                    <Icon size={20} />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
                    <p className={`text-sm font-black ${color} tracking-tight`}>{value || 'NOT DEFINED'}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-4 md:p-12 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-10 duration-1000">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-16 bg-white p-10 rounded-[48px] border border-slate-100 shadow-2xl shadow-slate-200/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
                
                <div className="flex items-center gap-8 relative z-10">
                    <div className="relative group">
                        <div className="w-28 h-28 bg-slate-900 rounded-[36px] overflow-hidden border-4 border-white shadow-2xl group-hover:rotate-6 transition-transform duration-500 flex items-center justify-center text-white relative">
                            {user?.profile_image ? (
                                <img src={user.profile_image} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User size={48} className="opacity-80" />
                            )}
                            
                            {uploading && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
                                    <Loader2 className="text-white animate-spin" size={24} />
                                </div>
                            )}
                        </div>
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#008080] rounded-2xl border-4 border-white flex items-center justify-center text-white shadow-lg shadow-[#008080]/30 hover:scale-110 active:scale-95 transition-all z-20 cursor-pointer"
                        >
                            <Camera size={16} />
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleImageChange} 
                            className="hidden" 
                            accept="image/*"
                        />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">{user?.name}</h1>
                        <div className="flex items-center gap-3 mt-3">
                            <span className="px-4 py-1.5 bg-[#008080]/10 text-[#008080] rounded-full text-[10px] font-black uppercase tracking-widest border border-[#008080]/20">
                                {user?.role?.replace('_', ' ')}
                            </span>
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active Node</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 relative z-10">
                    <div className="bg-slate-50 px-6 py-4 rounded-[28px] border border-slate-100 text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                        <p className="text-sm font-black text-emerald-600 uppercase">Verified</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Core Identity Panel */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-2xl shadow-slate-200/30">
                        <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight mb-10 flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#008080]/10 rounded-xl flex items-center justify-center text-[#008080]">
                                <User size={20} />
                            </div>
                            Core Credentials
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <DetailBlock icon={User} label="Assigned Identifier" value={user?.name} />
                            <DetailBlock icon={Mail} label="Communication Terminal" value={user?.email} />
                            <DetailBlock icon={Smartphone} label="Voice/Phone Link" value={user?.phone_number} />
                            <DetailBlock icon={Shield} label="Protocol Authority" value={user?.role?.toUpperCase()} color="text-[#008080]" />
                        </div>
                    </div>

                    {/* System Information */}
                    <div className="bg-slate-900 p-10 rounded-[48px] shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
                        <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full -mb-24 -mr-24 blur-3xl group-hover:bg-[#14B8A6]/10 transition-colors duration-1000"></div>
                        <h3 className="text-xl font-black text-white uppercase italic tracking-tight mb-10 flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white">
                                <Lock size={20} />
                            </div>
                            Security Perimeter
                        </h3>
                        <div className="flex items-start gap-6 bg-white/5 p-8 rounded-[32px] border border-white/10">
                            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-[#14B8A6] shrink-0">
                                <AlertCircle size={24} />
                            </div>
                            <div>
                                <h4 className="text-lg font-black text-white uppercase italic mb-2">Protocol Monitoring</h4>
                                <p className="text-slate-400 text-xs font-bold leading-relaxed uppercase tracking-tight">
                                    This identity console is in high-security mode. Changes to core credentials must be requested through administrative protocols for security maintenance.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Stats/Info */}
                <div className="space-y-8">
                    <div className="bg-[#008080] p-10 rounded-[48px] shadow-2xl shadow-[#008080]/30 text-white relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mt-16 blur-2xl"></div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-6 opacity-70">Session Health</h4>
                        <div className="space-y-6">
                            <div className="flex justify-between items-end border-b border-white/10 pb-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase opacity-60">System Role</p>
                                    <p className="text-lg font-black uppercase">{user?.role?.split('_')[0]}</p>
                                </div>
                                <Shield size={24} className="opacity-40" />
                            </div>
                            <div className="flex justify-between items-end border-b border-white/10 pb-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase opacity-60">Permissions</p>
                                    <p className="text-lg font-black uppercase">Standard</p>
                                </div>
                                <Lock size={24} className="opacity-40" />
                            </div>
                        </div>
                        <div className="mt-10 p-4 bg-white/10 rounded-[28px] border border-white/10 text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest italic animate-pulse">Node Status: Nominal</p>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 px-2">Recent Access</h4>
                        <div className="space-y-4">
                            {[1, 2].map(i => (
                                <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white hover:border-[#008080]/30 transition-all cursor-pointer group">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-[#008080] transition-colors shadow-sm">
                                        <Activity size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">Login Successful</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">{new Date().toLocaleDateString()} • System Terminal</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileConsole;
