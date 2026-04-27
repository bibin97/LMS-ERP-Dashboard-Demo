import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ScrollText, Filter, Search, User, BookOpen, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const InteractionLogs = () => {
    const [activeTab, setActiveTab] = useState('student'); // 'student' or 'faculty'
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchLogs();
    }, [activeTab]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const endpoint = activeTab === 'student' ? '/admin/student-logs' : '/admin/faculty-logs';
            const res = await api.get(endpoint);
            setLogs(res.data.data);
        } catch (error) {
            toast.error("Failed to fetch logs");
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(log =>
        log.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.mentor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.chapter && log.chapter.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic flex items-center gap-3">
                        <ScrollText size={32} className="text-[#008080]" /> Interaction Logs
                    </h1>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2">Comprehensive archive of all session interactions and reports.</p>
                </div>

                <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                    <button
                        onClick={() => setActiveTab('student')}
                        className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'student' ? 'bg-white text-[#008080] shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Student Logs
                    </button>
                    <button
                        onClick={() => setActiveTab('faculty')}
                        className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'faculty' ? 'bg-white text-purple-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Faculty Logs
                    </button>
                </div>
            </header>

            <div className="flex gap-4 items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100 w-full md:w-96">
                <Search size={20} className="text-slate-400" />
                <input
                    type="text"
                    placeholder="Search by student, mentor or chapter..."
                    className="w-full bg-transparent outline-none text-sm font-bold text-slate-700 placeholder:text-slate-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="text-center py-20 font-bold text-slate-400 animate-pulse">Retrieving Encrypted Logs...</div>
            ) : (
                <div className="grid gap-6">
                    {filteredLogs.map((log) => (
                        <div key={log.id} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-50 hover:shadow-2xl transition-all relative overflow-hidden group">
                            <div className={`absolute top-0 left-0 w-2 h-full ${activeTab === 'student' ? 'bg-[#008080]' : 'bg-purple-500'}`}></div>

                            <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                                <div className="space-y-4 flex-1">
                                    <div className="flex items-center gap-4">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${activeTab === 'student' ? 'bg-[#008080] text-white' : 'bg-purple-600 text-white'}`}>
                                            {activeTab === 'student' ? `Session #${log.session_number}` : log.session_type}
                                        </span>
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-wide flex items-center gap-2">
                                            <Clock size={14} /> {new Date(log.created_at).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Student</p>
                                            <p className="text-lg font-black text-slate-900">{log.student_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mentor</p>
                                            <p className="text-sm font-bold text-slate-600">{log.mentor_name}</p>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                            {activeTab === 'student' ? 'Mentor Synthesis / Notes' : 'Topics / Issues'}
                                        </p>
                                        <p className="text-sm font-medium text-slate-700 leading-relaxed">
                                            {activeTab === 'student'
                                                ? (log.mentor_notes || log.notes || 'No specific notes.')
                                                : (log.topics_covered || log.notes || 'No details.')}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 min-w-[200px]">
                                    {activeTab === 'student' ? (
                                        <>
                                            <Metric label="Understanding" value={log.understanding_level} color="emerald-600" />
                                            <Metric label="Confidence" value={log.student_confidence} color="[#008080]" />
                                            <Metric label="Stress Level" value={log.stress_level} color="rose-600" />
                                        </>
                                    ) : (
                                        <>
                                            <Metric label="Performance" value={log.student_performance} color="emerald-600" />
                                            <Metric label="Homework" value={log.homework_status} color="purple-600" />
                                            <div className="mt-2">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Chapter</p>
                                                <p className="text-xs font-bold text-slate-800">{log.chapter}</p>
                                            </div>
                                        </>
                                    )}

                                    {log.screenshot_url && (
                                        <a
                                            href={log.screenshot_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-4 text-center py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-colors"
                                        >
                                            View Evidence
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredLogs.length === 0 && (
                        <div className="bg-slate-50 p-20 rounded-[3rem] text-center border-2 border-dashed border-slate-200">
                            <p className="text-slate-400 font-bold">No logs found matching your criteria.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const Metric = ({ label, value, color }) => (
    <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        <span className={`text-xs font-black text-${color}`}>{value}</span>
    </div>
);

export default InteractionLogs;
