import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, CheckCircle2, ShieldAlert, RotateCcw, User, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const FacultyAudit = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFacultyChecks();
    }, []);

    const fetchFacultyChecks = async () => {
        try {
            const res = await api.get('/academic-head/faculty-checks');
            if (res.data.success) {
                setSessions(res.data.data);
            }
        } catch (error) {
            toast.error("Failed to load faculty session audits");
        } finally {
            setLoading(false);
        }
    };

    const handleAddCheck = async (sessionId) => {
        try {
            await api.post(`/academic-head/sessions/${sessionId}/check`);

            setSessions(prev => prev.map(s => {
                if (s.session_id === sessionId) {
                    return {
                        ...s,
                        check_count: (s.check_count || 0) + 1
                    };
                }
                return s;
            }));
            toast.success('Session audit marked as checked');
        } catch (error) {
            toast.error("Audit verification failed");
        }
    };

    const handleRemoveCheck = async (sessionId) => {
        try {
            await api.delete(`/academic-head/sessions/${sessionId}/uncheck`);

            setSessions(prev => prev.map(s => {
                if (s.session_id === sessionId && s.check_count > 0) {
                    return {
                        ...s,
                        check_count: s.check_count - 1
                    };
                }
                return s;
            }));
            toast.success('Audit verification removed');
        } catch (error) {
            toast.error("Failed to remove verification");
        }
    };

    if (loading) return (
        <div className="p-20 text-center">
            <div className="w-16 h-16 border-4 border-[#008080] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Synchronizing Audit Data...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-sm mb-10">
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#008080] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#008080]/30 rotate-3">
                        <ShieldAlert size={28} />
                    </div>
                    Compliance & Audit Center
                </h2>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-3 flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    Internal verification of completed faculty sessions to ensure academic quality and reporting compliance
                </p>
            </div>

            <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-slate-50">
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 rounded-tl-[1.5rem]">Faculty Member</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Session Date</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Chapter / Topic</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Audit Status</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center rounded-tr-[1.5rem]">Verification</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sessions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                                        No session reports available for audit.
                                    </td>
                                </tr>
                            ) : (
                                sessions.map(session => {
                                    const isChecked = session.check_count > 0;
                                    return (
                                        <tr key={session.session_id} className={`group transition-all ${isChecked ? 'bg-emerald-50/30' : 'hover:bg-slate-50/50'}`}>
                                            <td className="p-6 border-b border-slate-50">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black uppercase ${isChecked ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                                        {session.faculty_name?.charAt(0)}
                                                    </div>
                                                    <span className="font-bold text-slate-700">{session.faculty_name}</span>
                                                </div>
                                            </td>
                                            <td className="p-6 border-b border-slate-50">
                                                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold italic">
                                                    {new Date(session.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                                </div>
                                            </td>
                                            <td className="p-6 border-b border-slate-50">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{session.chapter}</span>
                                                    <span className="text-[10px] text-slate-400 font-bold line-clamp-1">{session.topics_covered}</span>
                                                </div>
                                            </td>
                                            <td className="p-6 border-b border-slate-50 text-center">
                                                {isChecked ? (
                                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100">
                                                        <CheckCircle2 size={12} />
                                                        Verified
                                                    </div>
                                                ) : (
                                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-full text-[9px] font-black uppercase tracking-widest">
                                                        <Target size={12} />
                                                        Pending
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-6 border-b border-slate-50 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleAddCheck(session.session_id)}
                                                        className={`
                                                            flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[10px] font-black transition-all uppercase tracking-widest border
                                                            ${isChecked
                                                                ? 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-100'
                                                                : 'bg-white border-slate-200 text-slate-600 hover:border-[#008080] hover:text-[#008080] shadow-sm'}
                                                            hover:scale-105 active:scale-95
                                                        `}
                                                    >
                                                        <Target size={14} />
                                                        {isChecked ? `Checked (${session.check_count})` : 'Audit Verify'}
                                                    </button>
                                                    {isChecked && (
                                                        <button
                                                            onClick={() => handleRemoveCheck(session.session_id)}
                                                            className="p-2.5 rounded-2xl bg-white border border-rose-100 text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-all hover:scale-105 active:scale-95"
                                                            title="Undo Audit Verification"
                                                        >
                                                            <RotateCcw size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FacultyAudit;
