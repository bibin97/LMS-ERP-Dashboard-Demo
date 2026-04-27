import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    CalendarClock, Clock, BookOpen, Users,
    Search, Filter, ChevronRight, Activity,
    Calendar, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const AcademicSchedule = () => {
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        fetchSchedule();
    }, []);

    const fetchSchedule = async () => {
        try {
            const res = await api.get('/mentor/academic-schedule');
            setSchedule(res.data.data);
        } catch (error) {
            toast.error("Failed to load academic schedule");
        } finally {
            setLoading(false);
        }
    };

    const filteredSchedule = schedule.filter(session => {
        const matchesSearch =
            session.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            session.faculty_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || session.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="w-12 h-12 border-4 border-[#008080] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Syncing Academic Timetable...</p>
        </div>
    );

    return (
        <div className="space-y-8 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 border-b-4 border-b-[#008080]">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-[#008080] rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3">
                        <CalendarClock size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Academic Schedule</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Full monitoring of faculty-led sessions for your students</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 flex items-center gap-3">
                        <Activity className="text-emerald-500" size={18} />
                        <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Active</p>
                            <p className="text-sm font-black text-slate-900 leading-none">{schedule.filter(s => s.status === 'Scheduled').length} Sessions</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 w-full relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by topic or faculty name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:bg-white focus:ring-4 ring-[#008080]/10 transition-all outline-none"
                    />
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-slate-400">
                        <Filter size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Status</span>
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-slate-50 border-none rounded-xl px-4 py-4 text-xs font-bold text-slate-700 focus:bg-white outline-none min-w-[150px]"
                    >
                        <option value="All">All Sessions</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>
            </div>

            {/* Timetable Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredSchedule.map((session, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-24 h-24 ${session.status === 'Completed' ? 'bg-emerald-50' : 'bg-amber-50'} rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150`}></div>

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-2">
                                    <Calendar className="text-[#008080]" size={14} />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        {new Date(session.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                                    </span>
                                </div>
                                <div className={`px-4 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest shadow-sm border ${session.status === 'Completed'
                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                        : 'bg-amber-50 text-amber-600 border-amber-100'
                                    }`}>
                                    {session.status} Phase
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#008080]/10 flex items-center justify-center text-[#008080] shrink-0 shadow-sm border border-[#008080]">
                                        <BookOpen size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Subject / Technical Topic</p>
                                        <h4 className="text-lg font-black text-slate-900 leading-tight pr-4">{session.topic || 'General Academic Session'}</h4>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 shrink-0 shadow-sm border border-rose-100">
                                        <Users size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Assigned Faculty</p>
                                        <h4 className="text-lg font-black text-slate-900 leading-tight">{session.faculty_name}</h4>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-50 flex items-center justify-between mt-6">
                                    <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl">
                                        <Clock className="text-[#008080] font-bold" size={14} />
                                        <span className="text-xs font-black text-slate-700 italic">
                                            {session.start_time ? new Date(`2000-01-01T${session.start_time}`).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'TBD'}
                                        </span>
                                    </div>
                                    <ChevronRight className="text-slate-200 group-hover:translate-x-1 group-hover:text-[#008080] transition-all" size={20} />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredSchedule.length === 0 && (
                <div className="bg-white p-20 rounded-[3rem] border border-slate-100 text-center shadow-sm">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                        <AlertCircle size={40} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 uppercase italic">No sessions found</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Try adjusting your filters or search keywords</p>
                </div>
            )}
        </div>
    );
};

export default AcademicSchedule;
