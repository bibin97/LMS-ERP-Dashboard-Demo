import React, { useState, useEffect } from 'react';
import { Bell, Search, User, ShieldCheck, CheckCheck, Menu, LogOut, Settings, HelpCircle, Activity, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Navbar = ({ onMenuClick }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const adminName = user?.name || "Super Admin";
    const [notifications, setNotifications] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') === 'dark');

    // Theme effect
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    // Auto-close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isDropdownOpen || isUserMenuOpen) {
                // If the click is not on a dropdown or a button that opens a dropdown
                if (!event.target.closest('.dropdown-container')) {
                    setIsDropdownOpen(false);
                    setIsUserMenuOpen(false);
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isDropdownOpen, isUserMenuOpen]);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 5000);
            return () => clearInterval(interval);
        }
    }, [user]);

    // Cleanup: Export refetch function to window for 'spot' updates from other components
    useEffect(() => {
        window.refetchNotifications = fetchNotifications;
        return () => { delete window.refetchNotifications; };
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setNotifications(res.data.data);
            }
        } catch (e) {
        }
    };

    const markRead = async (id, e) => {
        e.stopPropagation();
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: 1 } : n));
        } catch (error) {
        }
    };

    const deleteNotification = async (id, e) => {
        if (e) e.stopPropagation();
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/notifications/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(notifications.filter(n => n.id !== id));
        } catch (error) {
        }
    };

    const clearAllNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete('/api/admin/notifications/clear-all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications([]);
        } catch (error) {
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleProfileClick = () => {
        setIsUserMenuOpen(false);
        const rolePaths = {
            'super_admin': '/admin/profile',
            'admin': '/admin/profile',
            'mentor_head': '/mentor-head/profile',
            'academic_head': '/academic-head/profile',
            'mentor': '/mentor/profile',
            'faculty': '/faculty/profile'
        };

        const path = rolePaths[user?.role];
        if (path) {
            navigate(path);
        } else {
            toast.error('Profile route not defined for this role');
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 flex items-center justify-between px-8 sticky top-0 z-[900] shadow-sm shadow-[#0F172A]/5">
            <div className="flex items-center gap-6 w-full md:w-auto">
                <button 
                    onClick={onMenuClick}
                    className="md:hidden p-2.5 text-slate-600 hover:bg-slate-100/50 rounded-[14px] transition-all active:scale-95"
                >
                    <Menu size={22} />
                </button>
                <div className="flex-1 md:flex-none flex items-center gap-3 bg-[#F1F5F9] px-5 py-3 rounded-[16px] max-w-full md:w-96 group focus-within:bg-white focus-within:ring-2 focus-within:ring-[#14B8A6]/20 transition-all border border-transparent focus-within:border-[#14B8A6]/30 shadow-inner">
                    <Search size={20} className="text-slate-400 group-focus-within:text-[#14B8A6] shrink-0 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search workspace..."
                        className="bg-transparent border-none text-sm outline-none w-full placeholder:text-slate-400 font-semibold tracking-tight"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4 md:gap-8 ml-4">
                {/* Dark Mode Toggle */}
                <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="p-3 rounded-[16px] hover:bg-white hover:shadow-lg hover:shadow-[#0F172A]/5 text-slate-500 transition-all border border-transparent hover:border-slate-100 active:scale-95 flex items-center justify-center dark:hover:bg-slate-800"
                >
                    {isDarkMode ? <Sun size={22} className="text-amber-400" /> : <Moon size={22} />}
                </button>

                <div className="relative dropdown-container">
                    <button
                        onClick={() => {
                            setIsDropdownOpen(!isDropdownOpen);
                            setIsUserMenuOpen(false);
                        }}
                        className="relative p-3 rounded-[16px] hover:bg-white hover:shadow-lg hover:shadow-[#0F172A]/5 text-slate-500 transition-all group border border-transparent hover:border-slate-100 active:scale-95"
                    >
                        <Bell size={22} className="group-hover:rotate-12 transition-transform" />
                        {unreadCount > 0 && (
                            <span className="absolute top-3 right-3 w-3 h-3 bg-rose-500 border-[2.5px] border-white rounded-full animate-pulse shadow-sm"></span>
                        )}
                    </button>

                    {isDropdownOpen && (
                        <div className="fixed inset-x-4 top-24 md:absolute md:inset-auto md:right-0 md:top-full md:mt-4 md:w-[420px] bg-white/95 backdrop-blur-2xl border border-slate-200/60 rounded-[28px] shadow-2xl shadow-[#0F172A]/15 overflow-hidden z-[1000] max-h-[calc(100vh-140px)] md:max-h-[550px] flex flex-col transition-all duration-300 animate-in fade-in slide-in-from-top-4">
                            <div className="p-6 bg-gradient-to-br from-slate-50/50 to-white border-b border-slate-100/50 flex justify-between items-center shrink-0">
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                                        <Activity size={16} className="text-[#F59E0B]" />
                                        Activity Feed
                                    </h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Platform Pulse</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {notifications.length > 0 && (
                                        <button 
                                            onClick={clearAllNotifications}
                                            className="text-[10px] font-black text-rose-500 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-colors uppercase tracking-widest"
                                        >
                                            Clear Stack
                                        </button>
                                    )}
                                    <span className="text-[10px] font-black text-white bg-gradient-to-r from-[#0F766E] to-[#14B8A6] px-3.5 py-1.5 rounded-full shadow-lg shadow-[#14B8A6]/20">{unreadCount} New</span>
                                </div>
                            </div>
                            
                            <div className="overflow-y-auto p-4 space-y-3 max-h-[420px] flex-grow custom-scrollbar overscroll-contain">
                                {notifications.length === 0 ? (
                                    <div className="py-24 flex flex-col items-center justify-center opacity-30">
                                        <div className="w-16 h-16 bg-slate-100 rounded-[22px] flex items-center justify-center mb-6">
                                            <Bell size={28} className="text-slate-400" />
                                        </div>
                                        <p className="text-[11px] text-slate-500 font-black tracking-[0.3em] uppercase">Status: Nominal</p>
                                    </div>
                                ) : (
                                    notifications.map((notif, idx) => (
                                        <div 
                                            key={notif.id} 
                                            className={`group relative p-5 rounded-[22px] transition-all duration-300 border ${
                                                notif.is_read 
                                                    ? 'bg-white/40 border-slate-100/50 opacity-70 hover:opacity-100 hover:bg-white hover:border-slate-200' 
                                                    : 'bg-gradient-to-br from-[#14B8A6]/5 to-transparent border-[#14B8A6]/20 shadow-sm hover:shadow-xl hover:shadow-[#14B8A6]/5 hover:border-[#14B8A6]/40'
                                            }`}
                                            style={{ animationDelay: `${idx * 50}ms` }}
                                        >
                                            <div className="flex gap-5">
                                                <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                                                    notif.is_read ? 'bg-slate-100 text-slate-400' : 'bg-white text-[#14B8A6] shadow-md border border-[#14B8A6]/10'
                                                }`}>
                                                    <Bell size={20} />
                                                </div>
                                                <div className="flex-1 min-w-0 pr-8">
                                                    <div 
                                                        className={`text-[13px] leading-relaxed break-words ${notif.is_read ? 'text-slate-600 font-semibold' : 'text-slate-900 font-black tracking-tight'}`}
                                                        dangerouslySetInnerHTML={{ __html: notif.message }}
                                                    />
                                                    <div className="flex items-center gap-3 mt-3">
                                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-black bg-slate-100/50 px-2.5 py-1 rounded-lg">
                                                            <span className="w-1 h-1 bg-[#14B8A6] rounded-full animate-pulse"></span>
                                                            <span>{new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                                            {new Date(notif.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="absolute right-4 top-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                                    {!notif.is_read && (
                                                        <button 
                                                            onClick={(e) => markRead(notif.id, e)} 
                                                            className="p-2 bg-white text-[#14B8A6] border border-[#14B8A6]/20 hover:bg-[#14B8A6] hover:text-white rounded-[12px] shadow-sm transition-all duration-300"
                                                            title="Mark read"
                                                        >
                                                            <CheckCheck size={16} />
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={(e) => deleteNotification(notif.id, e)}
                                                        className="p-2 bg-white text-rose-500 border border-rose-100 hover:bg-rose-500 hover:text-white rounded-[12px] shadow-sm transition-all duration-300"
                                                        title="Delete"
                                                    >
                                                        <ShieldCheck className="rotate-45" size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-center shrink-0">
                                <button className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-[#14B8A6] transition-all active:scale-95">Archived Records</button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4 md:gap-8 md:pl-8 md:border-l border-slate-200/60 relative dropdown-container">
                    <div className="text-right hidden sm:flex flex-col items-end">
                        <p className="text-sm font-black text-slate-900 leading-none tracking-tight mb-1">{adminName}</p>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-[#F59E0B]/10 rounded-lg group hover:bg-[#F59E0B]/20 transition-colors">
                            <ShieldCheck size={11} className="text-[#F59E0B]" />
                            <p className="text-[9px] text-[#F59E0B] font-black uppercase tracking-[0.2em]">Verified Hub</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => {
                            setIsUserMenuOpen(!isUserMenuOpen);
                            setIsDropdownOpen(false);
                        }}
                        className="w-12 h-12 bg-gradient-to-br from-[#0F766E] to-[#14B8A6] rounded-[18px] flex items-center justify-center text-white border-2 border-white shadow-[0_10px_20px_rgba(20,184,166,0.25)] overflow-hidden hover:scale-105 active:scale-95 transition-all cursor-pointer ring-4 ring-[#14B8A6]/10"
                    >
                        {user?.profile_image ? (
                            <img src={user.profile_image} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <User size={24} />
                        )}
                    </button>

                    {isUserMenuOpen && (
                        <div className="absolute right-0 top-full mt-4 w-64 bg-white/95 backdrop-blur-2xl border border-slate-200/60 rounded-[28px] shadow-2xl shadow-[#0F172A]/15 overflow-hidden z-[1000] animate-in fade-in slide-in-from-top-4 p-2">
                            <div className="p-5 border-b border-slate-100/50 bg-slate-50/50 rounded-[24px] mb-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 leading-none">Session Context</p>
                                <p className="text-sm font-black text-slate-900 truncate tracking-tight">{user?.email}</p>
                            </div>
                            <div className="space-y-1">
                                <button 
                                    onClick={handleProfileClick}
                                    className="w-full flex items-center gap-3.5 px-4 py-3.5 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-[#14B8A6] rounded-[18px] transition-all group"
                                >
                                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-[#14B8A6]/10 transition-all group-hover:scale-105">
                                        <User size={18} />
                                    </div>
                                    Profile Console
                                </button>
                                <div className="my-3 mx-4 border-t border-slate-100/50"></div>
                                <button 
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3.5 px-4 py-4 text-sm font-black text-white bg-slate-900 hover:bg-[#EF4444] rounded-[20px] transition-all group shadow-xl shadow-slate-900/10 hover:shadow-rose-500/20"
                                >
                                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center transition-all group-hover:bg-white/20">
                                        <LogOut size={18} />
                                    </div>
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
