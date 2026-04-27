import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    Search, MessageSquare, User, Calendar,
    Clock, ExternalLink, Filter, ChevronDown, CheckCircle2,
    BarChart3, BrainCircuit, Activity, Heart, ShieldAlert
} from 'lucide-react';
import toast from 'react-hot-toast';

const StudentLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLog, setSelectedLog] = useState(null);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await api.get('/academic-head/student-interaction-logs');
            setLogs(res.data.data);
        } catch (error) {
            toast.error("Failed to fetch student interaction logs");
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(log =>
        log.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.mentor_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-10 pb-20 max-w-[1600px] mx-auto animate-in fade-in duration-700">
            {/* Auditing Header */}
            <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-32 -mt-32 opacity-40"></div>
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-emerald-100 rotate-6 group hover:rotate-0 transition-all duration-500">
                        <BrainCircuit size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Interaction Logs</h1>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                            <Activity size={12} className="text-emerald-500" />
                            Comprehensive audit of mentor-parent interaction registries and student sentiment analysis
                        </p>
                    </div>
                </div>

                <div className="relative z-10 w-full md:w-96 flex items-center gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Find by Student or Mentor..."
                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:bg-white focus:ring-8 ring-emerald-500/5 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Logs Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center p-32 space-y-4">
                    <div className="w-14 h-14 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Synchronizing Intelligence Stream...</p>
                </div>
            ) : filteredLogs.length === 0 ? (
                <div className="bg-white p-20 rounded-[4rem] text-center border-2 border-dashed border-slate-100 shadow-sm">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mx-auto mb-8">
                        <MessageSquare size={48} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 italic uppercase">No Interaction Data</h3>
                    <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-[0.2em] leading-loose max-w-sm mx-auto">
                        The registry is currently silent. Synchronize with portal to ingest new mentor call logs.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {filteredLogs.map((log) => (
                        <div
                            key={log.id}
                            onClick={() => setSelectedLog(log)}
                            className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group cursor-pointer relative overflow-hidden"
                        >
                            {/* Accent line */}
                            <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>

                            <div className="flex justify-between items-start mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-emerald-50 transition-colors">
                                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-emerald-500 font-black text-xs">
                                            {log.student_name.substring(0, 2).toUpperCase()}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 italic tracking-tight uppercase">{log.student_name}</h3>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5 flex items-center gap-1">
                                            <Calendar size={10} /> {new Date(log.created_at).toLocaleDateString()}
                                            <span className="mx-2 opacity-20 text-slate-200">|</span>
                                            <Clock size={10} /> {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="inline-flex items-center gap-2 bg-[#008080]/10 px-4 py-2 rounded-xl text-[#008080] border border-[#008080]">
                                        <User size={12} />
                                        <span className="text-[9px] font-black uppercase tracking-widest">{log.mentor_name}</span>
                                    </div>
                                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-2 font-mono">ID: {log.id.toString().padStart(5, '0')}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-12 mb-10">
                                <div className="space-y-6">
                                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100/50">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <Heart size={10} className="text-rose-400" /> Sentiment Analysis
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            <div className="bg-white px-3 py-1.5 rounded-lg text-[8px] font-black uppercase text-slate-600 border border-slate-100">Conf: {log.confidence}/10</div>
                                            <div className="bg-white px-3 py-1.5 rounded-lg text-[8px] font-black uppercase text-slate-600 border border-slate-100">Focus: {log.focus_level}/10</div>
                                            <div className="bg-white px-3 py-1.5 rounded-lg text-[8px] font-black uppercase text-slate-600 border border-slate-100">HW: {log.homework_status}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col justify-center">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            <span>Communication</span>
                                            <span className="text-emerald-600">{log.connection_method}</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 rounded-full w-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="relative group/notes">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2 italic">
                                    <MessageSquare size={10} className="text-[#008080]" /> Mentor Intel Registry
                                </p>
                                <p className="text-xs text-slate-600 font-bold leading-relaxed line-clamp-3 group-hover/notes:line-clamp-none transition-all duration-500 italic">
                                    {log.mentor_notes}
                                </p>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest shadow-sm ${log.parent_update_priority === 'High' ? 'bg-rose-50 text-rose-500 border border-rose-100 animate-pulse' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>
                                    {log.parent_update_priority} Priority Alert
                                </div>
                                <button className="text-[9px] font-black text-[#008080] uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all duration-300 italic group-hover:translate-x-1">
                                    Full Investigation <ChevronDown size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Expanded Intelligence Modal */}
            {selectedLog && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[1100] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[4rem] shadow-2xl w-full max-w-5xl h-[90vh] overflow-hidden animate-in zoom-in duration-500 border border-white/20 flex flex-col">
                        <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-emerald-500 text-white relative h-32 overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                            <div className="relative z-10 flex items-center gap-6">
                                <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/20">
                                    <CheckCircle2 size={32} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight italic uppercase">Interaction Deep-Dive</h2>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 mt-1 flex items-center gap-2">
                                        <User size={12} /> Student: {selectedLog.student_name} • Mentor: {selectedLog.mentor_name}
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
                            {/* Detailed Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {[
                                    { label: 'Self Clarity', val: selectedLog.self_clarity },
                                    { label: 'Motivation', val: selectedLog.motivation_level },
                                    { label: 'Exam Anxiety', val: selectedLog.exam_anxiety },
                                    { label: 'Rev Quality', val: selectedLog.revision_quality }
                                ].map((stat, i) => (
                                    <div key={i} className="bg-slate-50 p-6 rounded-[2.5rem] text-center border border-slate-100">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                        <p className="text-xl font-black text-slate-900 italic tracking-tighter">{stat.val}/10</p>
                                        <div className="w-full h-1 bg-slate-200 mt-3 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500" style={{ width: `${stat.val * 10}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                <div className="space-y-10">
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 h-10 border-b border-slate-50 italic">
                                            <ShieldAlert size={14} className="text-rose-500" /> Barriers Identified
                                        </h4>
                                        <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-100/50 min-h-[150px]">
                                            <p className="text-xs font-black text-[#008080] uppercase tracking-widest mb-2 italic">Confusing Topics:</p>
                                            <p className="text-sm font-bold text-slate-700 leading-relaxed italic">
                                                {selectedLog.confusing_topic || "No specific roadblocks claimed."}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 h-10 border-b border-slate-50 italic">
                                            <MessageSquare size={14} className="text-emerald-500" /> Mentor Assessment Registry
                                        </h4>
                                        <div className="bg-white p-8 rounded-[3rem] border-2 border-slate-50 shadow-sm min-h-[200px]">
                                            <p className="text-sm font-bold text-slate-600 leading-relaxed italic">
                                                {selectedLog.mentor_notes}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-10">
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 h-10 border-b border-slate-50 italic">
                                            <Activity size={14} className="text-[#008080]" /> Operational Action Plan
                                        </h4>
                                        <div className="space-y-6">
                                            <div className="flex items-start gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                                <div className="w-10 h-10 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#008080]">
                                                    <BarChart3 size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Mentor Priority Action</p>
                                                    <p className="text-xs font-bold text-slate-700 italic">{selectedLog.mentor_action_needed || "Routine Monitoring"}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                                <div className="w-10 h-10 bg-white rounded-2xl shadow-sm flex items-center justify-center text-rose-500">
                                                    <ShieldAlert size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Parent Connect Protocol</p>
                                                    <p className="text-xs font-bold text-slate-700 italic">{selectedLog.parent_update_priority} Priority Status</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedLog.screenshot_url && (
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Verification Artifact</h4>
                                            <a
                                                href={selectedLog.screenshot_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="block group relative overflow-hidden rounded-[2.5rem] border-4 border-slate-100 shadow-xl"
                                            >
                                                <img
                                                    src={selectedLog.screenshot_url}
                                                    alt="Interaction Proof"
                                                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                                <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <ExternalLink className="text-white" size={32} />
                                                </div>
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
                                Secure Insight Portal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentLogs;
