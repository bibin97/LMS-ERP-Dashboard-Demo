import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    UserSquare2,
    GraduationCap,
    ListTodo,
    FileText,
    LogOut,
    User,
    ScrollText,
    UserCheck,
    Target,
    X,
    ChevronLeft,
    ChevronRight,
    MessageSquare,
    Contact,
    CalendarClock,
    Calendar,
    ClipboardList,
    Bell,
    Settings,
    HelpCircle,
    Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

const Sidebar = ({ isOpen, setIsOpen, isCollapsed, setIsCollapsed, navItems, title = "MashMagic" }) => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        toast.success("Successfully logged out");
        navigate('/login');
    };

    return (
        <aside className={`fixed left-0 top-0 h-full flex flex-col z-[1000] shadow-2xl transition-all duration-300 ease-in-out md:translate-x-0 
            ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
            w-[80%] max-w-[20rem] sm:w-80 ${isCollapsed ? 'md:w-24' : 'md:w-72'}`}
               style={{ background: 'linear-gradient(180deg, #0F172A, #020617)' }}>
            
            {/* Mobile Close Button */}
            <button 
                onClick={() => setIsOpen(false)}
                className="md:hidden absolute right-4 top-4 z-[1100] p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all backdrop-blur-md border border-white/20"
            >
                <X size={20} />
            </button>

            {/* Collapse Toggle Bar (Desktop Only) */}
            <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden md:flex absolute -right-4 top-24 w-8 h-8 bg-[#14B8A6] rounded-full items-center justify-center text-white shadow-lg border-2 border-slate-900 z-50 hover:scale-110 active:scale-95 transition-all"
            >
                {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            <div className={`p-8 border-b border-white/5 flex flex-col items-center gap-6 transition-all duration-500 overflow-hidden ${isCollapsed ? 'px-2' : 'px-8'}`}>
                <div className="flex items-center justify-center w-full relative">
                    <div className={`transition-all duration-500 flex flex-col items-center ${isCollapsed ? 'w-full' : 'w-full'}`}>
                        {/* THE 'FULL' LOGO AREA */}
                        <div className={`bg-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-700 ${isCollapsed ? 'w-14 h-14 rounded-2xl' : 'w-full h-32 rounded-[24px] mb-4 border-4 border-white/10'}`}>
                            <img src="/mashmagic logo.jpg" alt="Logo" className="w-full h-full object-contain bg-black px-2" />
                        </div>
                        {!isCollapsed && (
                             <h1 className="text-2xl font-black text-white tracking-[0.2em] italic uppercase animate-in fade-in slide-in-from-top-6 duration-700 text-center drop-shadow-2xl">
                                MashMagic
                            </h1>
                        )}
                    </div>
                </div>
            </div>

            <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) => `
                            flex items-center gap-3 px-4 py-4 rounded-2xl transition-all duration-300 group relative
                            ${isActive
                                ? 'bg-[#14B8A6]/10 text-[#14B8A6] font-bold border-l-[3px] border-[#14B8A6] shadow-[0_0_20px_rgba(20,184,166,0.1)]'
                                : 'text-slate-400 hover:bg-white/5 hover:text-white hover:translate-x-1'}
                            ${isCollapsed ? 'justify-center px-0' : ''}
                        `}
                    >
                        <span className={`transition-all duration-300 ${isCollapsed ? 'scale-110' : 'opacity-70 group-hover:opacity-100 flex items-center justify-center shrink-0'}`}>
                            {item.icon}
                        </span>
                        {!isCollapsed && (
                            <div className="flex-1 flex items-center justify-between min-w-0">
                                <span className="text-sm tracking-tight whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300 truncate">{item.label}</span>
                                {item.badge > 0 && (
                                    <span className="flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-[#F59E0B] text-[9px] font-black text-black shadow-lg shadow-[#F59E0B]/20 animate-pulse ml-2">
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                        )}
                        
                        {/* Tooltip for collapsed state */}
                        {isCollapsed && (
                            <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity border border-white/10 z-[1100] whitespace-nowrap">
                                {item.label} {item.badge > 0 ? `(${item.badge})` : ''}
                            </div>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className={`p-4 border-t border-white/5 space-y-4 transition-all ${isCollapsed ? 'items-center px-2' : ''}`}>
                <div className={`bg-white/5 border border-white/10 p-4 rounded-[24px] flex items-center gap-3 group hover:bg-white/10 transition-all cursor-pointer overflow-hidden ${isCollapsed ? 'justify-center w-14' : ''}`}>
                    <div className="shrink-0 w-10 h-10 bg-gradient-to-br from-[#0F766E] to-[#14B8A6] rounded-[14px] flex items-center justify-center text-white shadow-lg shadow-[#14B8A6]/20 group-hover:scale-110 transition-transform">
                        <User size={20} />
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col overflow-hidden animate-in fade-in duration-500">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">
                                {user?.role?.split('_').join(' ')}
                            </span>
                            <span className="text-xs font-bold text-slate-200 truncate">{user?.name}</span>
                        </div>
                    )}
                </div>
                <button
                    onClick={handleLogout}
                    className={`w-full flex items-center justify-center gap-3 px-4 py-4 rounded-[20px] transition-all duration-300 text-[10px] font-black uppercase tracking-[0.2em] bg-white/5 text-slate-400 hover:bg-[#EF4444] hover:text-white border border-white/10 hover:border-transparent group overflow-hidden ${isCollapsed ? 'px-0' : ''}`}
                >
                    <LogOut size={16} className={`${!isCollapsed ? 'group-hover:-translate-x-1' : ''} transition-transform`} />
                    {!isCollapsed && <span className="animate-in fade-in duration-300">Logout</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
