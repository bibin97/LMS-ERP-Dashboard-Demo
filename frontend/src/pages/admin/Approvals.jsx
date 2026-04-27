import React, { useState, useEffect } from 'react';
import {
    Activity,
    CheckCircle,
    XCircle,
    Loader2,
    Shield,
    User,
    Calendar,
    ArrowUpRight,
    Mail,
    MapPin,
    Phone,
    UserCheck
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { premiumConfirm } from '../../utils/premiumConfirm';

const Approvals = () => {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPendingUsers();
    }, []);

    const fetchPendingUsers = async () => {
        try {
            const res = await api.get('/admin/pending-users');
            if (res.data.success) {
                setPendingUsers(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching pending users:', error);
            toast.error("Failed to load pending approvals");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id, role) => {
        try {
            await api.put(`/admin/approve/${id}`, { role });
            toast.success(`${role === 'student' ? 'Student' : 'User'} approved successfully`);
            setPendingUsers(prev => prev.filter(user => !(user.id === id && user.role === role)));
            // Trigger notification refresh for 'at the spot' feel
            if (window.refetchNotifications) window.refetchNotifications();
        } catch (error) {
            console.error('Approve error:', error);
            toast.error("Failed to approve user");
        }
    };

    const handleReject = async (id, role, name = 'this user') => {
        premiumConfirm(async () => {
            try {
                await api.put(`/admin/reject/${id}`, { role });
                toast.success(`${role === 'student' ? 'Student' : 'User'} rejected successfully`);
                setPendingUsers(prev => prev.filter(user => !(user.id === id && user.role === role)));
                // Trigger notification refresh
                if (window.refetchNotifications) window.refetchNotifications();
            } catch (error) {
                console.error('Reject error:', error);
                toast.error("Failed to reject user");
            }
        }, { 
            name: name,
            title: 'Reject Registration', 
            message: `Are you sure you want to reject this ${role === 'student' ? 'student' : 'user'}? They will not be able to access the platform.`,
            type: 'danger'
        });
    };

    const getRoleBadgeStyle = (role) => {
        switch (role) {
            case 'academic_head':
                return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'mentor_head':
                return 'bg-[#008080]/10 text-[#008080] border-[#008080]';
            case 'faculty':
                return 'bg-green-50 text-green-700 border-green-200';
            case 'mentor':
                return 'bg-teal-50 text-teal-700 border-teal-200';
            case 'student':
                return 'bg-slate-100 text-slate-600 border-slate-200';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-[#008080] animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="bg-white/70 backdrop-blur-xl p-12 rounded-[40px] border border-white/60 shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="w-20 h-20 bg-[#14B8A6] rounded-[28px] shadow-2xl shadow-[#14B8A6]/30 flex items-center justify-center group hover:rotate-12 transition-transform duration-700">
                            <Shield className="text-white" size={36} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none mb-3 italic">Pending Approvals</h2>
                            <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.25em] flex items-center justify-center md:justify-start gap-3 mt-1">
                                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                                Secure Admission & Staff Activation Matrix
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-900 px-10 py-6 rounded-[32px] border border-slate-800 shadow-2xl flex items-center gap-6 group hover:translate-x-2 transition-all">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] leading-none mb-2">Unverified Nodes</span>
                        <span className="text-3xl font-black text-white leading-none tabular-nums tracking-tighter">{pendingUsers.length}</span>
                    </div>
                    <div className="w-px h-10 bg-slate-800"></div>
                    <Activity className="text-[#14B8A6] animate-pulse" size={24} strokeWidth={3} />
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                {pendingUsers.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/40 border-b border-slate-100/50">
                                    <th className="p-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Candidate Identity</th>
                                    <th className="p-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Designation Vector</th>
                                    <th className="p-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Authorizing Node</th>
                                    <th className="p-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Communications</th>
                                    <th className="p-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] italic text-right">Verification Protocol</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {pendingUsers.map((user) => (
                                    <tr key={`${user.role}-${user.id}`} className="hover:bg-slate-50/50 transition-all group">
                                        <td className="p-8">
                                            <div className="flex items-center gap-5">
                                                <div className="w-16 h-16 bg-white rounded-[24px] flex items-center justify-center text-slate-400 font-black border border-slate-100 group-hover:border-[#14B8A6] group-hover:text-[#14B8A6] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all shadow-sm">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <span className="text-lg font-black text-slate-800 block tracking-tight leading-none italic group-hover:text-[#14B8A6] transition-colors mb-2 uppercase">{user.name}</span>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar size={12} className="text-[#14B8A6] opacity-60" />
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">
                                                            LOGGED_{new Date(user.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <span className={`inline-flex items-center gap-2.5 px-6 py-2.5 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm transition-all group-hover:scale-105 active:scale-95 ${getRoleBadgeStyle(user.role).replace('008080', '14B8A6')}`}>
                                                <div className={`w-2 h-2 rounded-full ${user.role === 'student' ? 'bg-slate-400' : 'bg-current animate-pulse'}`} />
                                                {user.role.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="p-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-[#14B8A6] border border-slate-100 group-hover:bg-white transition-all">
                                                    <UserCheck size={16} strokeWidth={2.5} />
                                                </div>
                                                <div>
                                                    <span className="text-xs font-black text-slate-800 block uppercase tracking-tight italic">{user.registered_by_name || 'Autonomous Registry'}</span>
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mt-0.5 block">Authorized Registrar</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <Mail size={12} className="text-slate-300" />
                                                    <span className="text-[11px] font-bold text-slate-500 lowercase tracking-wide truncate max-w-[150px]">{user.email || 'NODATA'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone size={12} className="text-slate-300" />
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                                                        {user.phone_number || 'OFFLINE'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8 text-right">
                                            <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                                                <button
                                                    onClick={() => handleReject(user.id, user.role, user.name)}
                                                    className="w-12 h-12 rounded-[18px] flex items-center justify-center text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all border border-transparent hover:border-rose-100 active:scale-90"
                                                    title="Reject Application"
                                                >
                                                    <XCircle size={22} strokeWidth={2.5} />
                                                </button>
                                                <button
                                                     onClick={() => handleApprove(user.id, user.role)}
                                                     className="w-12 h-12 rounded-[18px] flex items-center justify-center bg-[#14B8A6]/10 text-[#14B8A6] hover:bg-[#14B8A6] hover:text-white transition-all shadow-[0_10px_20px_rgba(20,184,166,0.15)] active:scale-95 group/btn"
                                                     title="Approve & Activate"
                                                 >
                                                     <CheckCircle size={22} strokeWidth={2.5} className="group-hover/btn:scale-110 transition-transform" />
                                                 </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center flex-1 py-20 text-center">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6 border-4 border-white shadow-inner">
                            <CheckCircle size={48} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Pipeline Clear</h3>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mt-3">
                            All registration requests have been processed
                        </p>
                    </div>
                )}
            </div>

            <div className="bg-slate-950 rounded-[2.5rem] p-10 text-white relative overflow-hidden border border-white/5">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="max-w-md">
                        <h3 className="text-2xl font-black mb-2 tracking-tight text-[#008080]">Security Protocol Enforcement</h3>
                        <p className="text-slate-400 text-sm font-bold leading-relaxed">
                            Every account activated here gains immediate access to their designated tools.
                            Rejected records are permanently archived in the system to prevent spam.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <div className="bg-gradient-to-br from-[#008080] to-[#14B8A6] p-6 rounded-3xl w-full md:w-44 text-center shadow-lg shadow-[#008080]/20 border border-white/10 group hover:scale-105 transition-all">
                            <span className="text-[10px] font-black text-white/50 uppercase tracking-widest block mb-1">Active Today</span>
                            <span className="text-3xl font-black text-white tracking-tighter">0</span>
                        </div>
                        <div className="bg-gradient-to-br from-[#008080] to-[#14B8A6] p-6 rounded-3xl w-full md:w-44 text-center shadow-lg shadow-[#008080]/20 border border-white/10 group hover:scale-105 transition-all">
                            <span className="text-[10px] font-black text-white/50 uppercase tracking-widest block mb-1">Rejected Today</span>
                            <span className="text-3xl font-black text-white tracking-tighter">0</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Approvals;
