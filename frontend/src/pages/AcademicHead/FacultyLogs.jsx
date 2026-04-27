import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    Search, Users, Calendar, Clock,
    BookOpen, Layers, BarChart3, Activity,
    CheckCircle2, AlertTriangle, User, ExternalLink,
    Filter, Layout, GraduationCap, Briefcase
} from 'lucide-react';
import toast from 'react-hot-toast';

const FacultyLogs = () => {
    const [mentorLogs, setMentorLogs] = useState([]);
    const [facultyLogs, setFacultyLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('mentor'); // 'mentor' or 'faculty'
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLog, setSelectedLog] = useState(null);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await api.get('/academic-head/faculty-interaction-logs');
            setMentorLogs(res.data.data.mentorLogs);
            setFacultyLogs(res.data.data.facultyLogs);
        } catch (error) {
            toast.error("Failed to fetch faculty interaction logs");
        } finally {
            setLoading(false);
        }
    };

    const isMentorTab = activeTab === 'mentor';
    const displayLogs = isMentorTab ? mentorLogs : facultyLogs;

    const filteredLogs = displayLogs.filter(log => {
        const text = isMentorTab
            ? `${log.student_name} ${log.mentor_name} ${log.faculty_name} ${log.chapter}`.toLowerCase()
            : `${log.faculty_name} ${log.chapter}`.toLowerCase();
        return text.includes(searchTerm.toLowerCase());
    });

    return (
        <div className="space-y-10 pb-20 max-w-[1600px] mx-auto animate-in fade-in duration-700">
            {/* Auditing Header */}
            <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#008080]/10 rounded-full -mr-32 -mt-32 opacity-40"></div>
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 bg-[#008080] rounded-3xl flex items-center justify-center text-white shadow-xl shadow-[#008080]/30 rotate-6 group hover:rotate-0 transition-all duration-500">
                        <Briefcase size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Faculty Logs</h1>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                            <Activity size={12} className="text-[#008080]" />
                            Session & Faculty logs
                        </p>
                    </div>
                </div>

                <div className="relative z-10 w-full md:w-auto flex flex-col sm:flex-row items-center gap-4">
                    {/* Tab Switcher */}
                    <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                        <button
                            onClick={() => setActiveTab('mentor')}
                            className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${isMentorTab ? 'bg-white text-[#008080] shadow-sm border border-slate-100' : 'text-slate-400'}`}
                        >
                            Mentor Audit
                        </button>
                        <button
                            onClick={() => setActiveTab('faculty')}
                            className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${!isMentorTab ? 'bg-white text-[#008080] shadow-sm border border-slate-100' : 'text-slate-400'}`}
                        >
                            Faculty Intake
                        </button>
                    </div>

                    <div className="relative group min-w-[300px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#008080] transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search Sessions..."
                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:bg-white focus:ring-8 ring-[#008080]/5 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Logs Area */}
            {loading ? (
                <div className="flex flex-col items-center justify-center p-32 space-y-4">
                    <div className="w-14 h-14 border-4 border-[#008080] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Ingesting Session Intel...</p>
                </div>
            ) : isMentorTab ? (
                /* Mentor Audit View */
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {filteredLogs.map((log) => (
                        <div
                            key={log.id}
                            onClick={() => setSelectedLog(log)}
                            className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group cursor-pointer relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-2 h-full bg-[#008080]"></div>

                            <div className="flex justify-between items-start mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-[#008080]/10 rounded-2xl flex items-center justify-center text-[#008080] border border-[#008080]">
                                        <BookOpen size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 italic tracking-tight uppercase line-clamp-1">{log.chapter}</h3>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5 flex items-center gap-1 italic">
                                            {log.student_name} • Session #{log.session_number}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end gap-2">
                                    <div className="bg-[#008080] text-white px-4 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest shadow-lg shadow-[#008080]/30 italic">
                                        Audit By {log.mentor_name}
                                    </div>
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 italic">
                                        <Calendar size={10} /> {new Date(log.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 mb-10">
                                <div className="space-y-4">
                                    <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100/50">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Faculty Assigned</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-[#008080] border border-slate-100">
                                                <User size={12} />
                                            </div>
                                            <span className="text-[10px] font-black text-slate-700 uppercase italic tracking-tight">{log.faculty_name}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4 text-right">
                                    <div className="inline-block bg-slate-50 p-5 rounded-[2rem] border border-slate-100/50 min-w-[120px]">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Performance</p>
                                        <div className="flex justify-end gap-1">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <div key={s} className={`w-2 h-2 rounded-full ${s <= log.student_performance ? 'bg-[#008080]' : 'bg-slate-200'}`}></div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100/30">
                                <div className="flex items-center gap-3 mb-3">
                                    <Layers size={14} className="text-[#008080]" />
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Core Intel Registry</p>
                                </div>
                                <p className="text-xs text-slate-600 font-bold leading-relaxed line-clamp-2 italic">
                                    {log.topics_covered}
                                </p>
                            </div>

                            <div className="mt-8 flex justify-between items-center bg-slate-50 px-6 py-4 rounded-[2rem] border border-slate-100/50">
                                <div className="flex items-center gap-4">
                                    {log.risk_level === 'High' && (
                                        <div className="flex items-center gap-2 text-rose-500 animate-pulse">
                                            <AlertTriangle size={14} />
                                            <span className="text-[8px] font-black uppercase tracking-widest">CRITICAL RISK</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1 text-slate-400">
                                        <span className="text-[8px] font-black uppercase tracking-widest italic">{log.session_type}</span>
                                    </div>
                                </div>
                                <button className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#008080] hover:bg-slate-900 hover:text-white transition-all">
                                    <ExternalLink size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* Faculty Intake View */
                <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden overflow-x-auto relative">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100">
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Temporal Stamp</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Faculty Unit</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Focus Chapter</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Schedule</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Chronometry</th>
                                <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Audit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-900 italic tracking-tight">{new Date(log.date).toLocaleDateString()}</span>
                                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Registry Lock</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-[#008080]">
                                                <User size={16} />
                                            </div>
                                            <span className="text-xs font-black text-slate-700 italic tracking-tight uppercase">{log.faculty_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="bg-[#008080]/10/50 px-4 py-2 rounded-xl border border-[#008080]/50 inline-block">
                                            <span className="text-xs font-black text-[#008080] italic uppercase tracking-tighter">{log.chapter}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Clock size={12} />
                                            <span className="text-[10px] font-bold italic tracking-tight">{log.start_time} - {log.end_time}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-[10px] font-black text-slate-900 italic">{log.duration}</span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-slate-200/50 hover:bg-[#008080] transition-all italic opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0">
                                            Manifest
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredLogs.length === 0 && (
                        <div className="p-20 text-center">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest italic">Audit Stream Exhausted - No Intake Logs Found</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal for Mentor Audit Detail */}
            {selectedLog && isMentorTab && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[1100] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[4rem] shadow-2xl w-full max-w-5xl h-[90vh] overflow-hidden animate-in zoom-in duration-500 border border-white/20 flex flex-col">
                        <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-[#008080] text-white relative h-32 overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                            <div className="relative z-10 flex items-center gap-6">
                                <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/20">
                                    <GraduationCap size={32} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight italic uppercase">Session intelligence Deep-Dive</h2>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 mt-1 flex items-center gap-2">
                                        <User size={12} /> Audit By: {selectedLog.mentor_name} • Faculty Unit: {selectedLog.faculty_name}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="relative z-10 w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center hover:bg-white/30 transition-all border border-white/10 active:scale-90"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-12 space-y-12">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                <div className="space-y-10">
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 h-10 border-b border-slate-50 italic">
                                            <BookOpen size={14} className="text-[#008080]" /> Academic Content Intake
                                        </h4>
                                        <div className="bg-slate-50 p-8 rounded-[3.5rem] border border-slate-100/50">
                                            <p className="text-[8px] font-black text-[#008080] uppercase tracking-widest mb-2 italic">Faculty Syllabus Coverage:</p>
                                            <h3 className="text-xl font-black text-slate-900 italic tracking-tight mb-4 uppercase">{selectedLog.chapter}</h3>
                                            <p className="text-sm font-bold text-slate-600 leading-relaxed italic">{selectedLog.topics_covered}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Engagement</p>
                                            <span className="text-xs font-black text-slate-900 uppercase italic tracking-widest">{selectedLog.engagement_level}</span>
                                        </div>
                                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Risk Status</p>
                                            <span className={`text-[8px] font-black uppercase italic tracking-widest ${selectedLog.risk_level === 'High' ? 'text-rose-500' : 'text-emerald-500'}`}>{selectedLog.risk_level} Priority</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-10">
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 h-10 border-b border-slate-50 italic">
                                            <Activity size={14} className="text-rose-500" /> Session Audit & Findings
                                        </h4>
                                        <div className="space-y-6">
                                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Issues Reported By Mentor</p>
                                                <p className="text-xs font-bold text-slate-600 italic leading-loose">{selectedLog.issues_reported || "Routine Compliance."}</p>
                                            </div>
                                            <div className="p-6 bg-[#008080]/10 rounded-3xl border border-[#008080]">
                                                <p className="text-[9px] font-black text-[#008080] uppercase tracking-widest mb-2 italic">Suggested Remedial Plan</p>
                                                <p className="text-xs font-bold text-[#008080] italic leading-loose">{selectedLog.remedial_plan || "Standard Path Sustained."}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedLog.screenshot_url && (
                                        <div className="p-6 bg-white border-2 border-slate-50 rounded-[3rem] shadow-sm flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                                                    <Layout size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Verification Document</p>
                                                    <p className="text-xs font-bold text-slate-900 italic">Audit Proof Attachment</p>
                                                </div>
                                            </div>
                                            <a href={selectedLog.screenshot_url} target="_blank" rel="noreferrer" className="bg-slate-900 text-white p-4 rounded-2xl hover:bg-[#008080] transition-all active:scale-90">
                                                <ExternalLink size={20} />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-10 border-t border-slate-50 bg-slate-50/50 flex justify-end">
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="px-12 py-5 bg-slate-900 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:-translate-y-1 transition-all italic"
                            >
                                Secure Content Portal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultyLogs;
