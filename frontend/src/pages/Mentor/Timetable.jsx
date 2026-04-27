import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    CalendarClock, CheckCircle, XCircle, Clock, ChevronRight,
    MessageSquare, Plus, Filter, Calendar, Users,
    MoreVertical, Edit2, Trash2, AlertTriangle, Info,
    ArrowRight, MapPin, Search, ChevronDown, Clock3, Target, FileText,
    CalendarDays, UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { premiumConfirm } from '../../utils/premiumConfirm';
import { useAuth } from '../../context/AuthContext';

const Timetable = () => {
    const { user } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [students, setStudents] = useState([]);
    const [mentors, setMentors] = useState([]);
    const [studentSearch, setStudentSearch] = useState('');
    const [summary, setSummary] = useState({
        total: 0, completed: 0, cancelled: 0, postponed: 0, upcoming: 0
    });
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSession, setEditingSession] = useState(null);

    // Filters
    const [filters, setFilters] = useState({
        student_id: '',
        mentor_id: '',
        status: '',
        start_date: (() => {
            const d = new Date();
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
        })(),
        end_date: (() => {
            const d = new Date();
            const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);
            return `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;
        })()
    });

    // Form State
    const [formData, setFormData] = useState({
        student_id: '',
        date: new Date().toISOString().split('T')[0],
        start_time: '10:00',
        end_time: '11:00',
        chapter: '',
        session_type: 'Regular Class',
        status: 'Scheduled',
        status_reason: '',
        notes: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        fetchTimetable();
    }, [filters]);

    useEffect(() => {
        fetchStudents();
        if (user?.role === 'academic_head' || user?.role === 'super_admin') {
            fetchMentors();
        }
    }, [user, filters.mentor_id]);

    const fetchMentors = async () => {
        try {
            const res = await api.get('/academic-head/mentors-all');
            setMentors(res.data.data);
        } catch (error) {
            console.error("Failed to load mentors");
        }
    };

    const fetchTimetable = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });
            const res = await api.get(`/mentor/timetable?${params.toString()}`);
            setSessions(res.data.data);
            setSummary(res.data.summary);
        } catch (error) {
            toast.error("Failed to load timetable");
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            // If user is academic_head or super_admin, fetch all students
            const endpoint = (user?.role === 'academic_head' || user?.role === 'super_admin')
                ? `/academic-head/students-all${filters.mentor_id ? `?mentor_id=${filters.mentor_id}` : ''}`
                : '/mentor/students';
            const res = await api.get(endpoint);
            setStudents(res.data.data);
        } catch (error) {
            console.error("Failed to load students");
        }
    };

    const filteredStudents = students.filter(s =>
        s.name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.student_id?.toString().toLowerCase().includes(studentSearch.toLowerCase())
    );

    const handleCreateOpen = () => {
        setEditingSession(null);
        setFormData({
            student_id: filters.student_id || '',
            date: new Date().toISOString().split('T')[0],
            start_time: '10:00',
            end_time: '11:00',
            chapter: '',
            session_type: 'Regular Class',
            status: 'Scheduled',
            status_reason: '',
            notes: ''
        });
        setIsModalOpen(true);
    };

    const handleEditOpen = (session) => {
        setEditingSession(session);
        setFormData({
            student_id: session.student_id,
            date: new Date(session.date).toISOString().split('T')[0],
            start_time: (session.start_time || '10:00').substring(0, 5),
            end_time: (session.end_time || '11:00').substring(0, 5),
            chapter: session.chapter || '',
            session_type: session.session_type || 'Regular Class',
            status: session.status,
            status_reason: session.status_reason || '',
            notes: session.notes || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (sessionParam) => {
        // If it's just an ID being passed from older calls, we'll try to handle it. Best to pass the full object.
        const id = typeof sessionParam === 'object' ? sessionParam.id : sessionParam;
        const name = typeof sessionParam === 'object' ? sessionParam.student_name : 'the selected';
        
        premiumConfirm(async () => {
            try {
                await api.delete(`/mentor/timetable/${id}`);
                toast.success("Session deleted");
                fetchTimetable();
            } catch (error) {
                toast.error(error.response?.data?.message || "Delete failed");
            }
        }, {
            name: `${name}'s Session`,
            title: 'Delete Scheduled Session',
            message: `Are you sure you want to permanently remove this session from the timeline?`,
            type: 'danger'
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.end_time <= formData.start_time) {
            toast.error("End time must be after start time");
            return;
        }

        try {
            if (editingSession) {
                await api.put(`/mentor/timetable/${editingSession.id}`, formData);
                toast.success("Session updated");
            } else {
                await api.post('/mentor/timetable', formData);
                toast.success("Session created");
            }
            setIsModalOpen(false);
            fetchTimetable();
        } catch (error) {
            toast.error(error.response?.data?.message || "Operation failed");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Scheduled': return 'bg-[#008080] text-white border-[#008080]';
            case 'Completed': return 'bg-emerald-100 text-emerald-600 border-emerald-200';
            case 'Postponed': return 'bg-amber-100 text-amber-600 border-amber-200';
            case 'Cancelled': return 'bg-rose-100 text-rose-600 border-rose-200';
            case 'No Show': return 'bg-slate-800 text-white border-slate-900';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    const formatDate = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const setQuickFilter = (type) => {
        const today = new Date();
        let start, end;

        if (type === 'this_month') {
            start = new Date(today.getFullYear(), today.getMonth(), 1);
            end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        } else if (type === 'today') {
            start = today;
            end = today;
        } else if (type === 'week') {
            const day = today.getDay();
            const diff = today.getDate() - day + (day === 0 ? -6 : 1);
            start = new Date(today.setDate(diff));
            end = new Date(today.setDate(diff + 6));
        }

        setFilters({
            ...filters,
            start_date: formatDate(start),
            end_date: formatDate(end)
        });
    };

    return (
        <div className="space-y-8 pb-20 max-w-[1600px] mx-auto min-h-screen">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 border-b-4 border-b-[#008080]">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3 group hover:rotate-0 transition-all duration-500">
                        <CalendarClock size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Academic Scheduling</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Master Control for Student Sessions & Timetables</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setQuickFilter('this_month')}
                        className="hidden lg:flex items-center gap-2 px-6 py-4 bg-slate-50 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100"
                    >
                        <CalendarDays size={16} /> This Month
                    </button>
                    <button
                        onClick={handleCreateOpen}
                        className="flex items-center justify-center gap-3 bg-[#008080] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#008080]/30 hover:bg-[#008080] hover:-translate-y-1 transition-all active:scale-95 italic"
                    >
                        <Plus size={18} /> Create Session
                    </button>
                </div>
            </div>

            {/* Dashboard Intelligence - Stats & Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                {[
                    { label: 'Total Logs', value: summary.total, icon: Calendar, color: 'text-slate-900', bg: 'bg-white border-slate-100' },
                    { label: 'Concluded', value: summary.completed, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50/50 border-emerald-100/50' },
                    { label: 'Outstanding', value: summary.upcoming, icon: Clock, color: 'text-[#008080]', bg: 'bg-[#008080]/10 border-[#008080]/50' },
                    { label: 'Reconfigured', value: summary.postponed, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50/50 border-amber-100/50' },
                    { label: 'Aborted', value: summary.cancelled, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50/50 border-rose-100/50' },
                ].map((stat, i) => (
                    <div key={i} className={`${stat.bg} p-8 rounded-[2.5rem] border shadow-sm flex flex-col items-center text-center group hover:shadow-xl hover:-translate-y-2 transition-all duration-500`}>
                        <div className={`w-10 h-10 ${stat.bg.replace('/50', '')} rounded-xl flex items-center justify-center mb-4 text-slate-400 group-hover:scale-110 transition-transform`}>
                            <stat.icon size={20} className={stat.color} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <h4 className={`text-3xl font-black ${stat.color} tracking-tighter`}>{stat.value}</h4>
                    </div>
                ))}
            </div>



            {/* Refined Filter Intelligence Bar */}
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                <div className="flex flex-wrap items-end gap-6 justify-between">
                    {/* 1. Student Target */}
                    <div className="flex-1 min-w-[240px]">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1 mb-2 block">Target Student</label>
                        <div className="relative group">
                            <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#008080] transition-colors" size={16} />
                            <select
                                value={filters.student_id}
                                onChange={(e) => setFilters({ ...filters, student_id: e.target.value })}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-[11px] font-black text-slate-700 focus:bg-white focus:ring-4 ring-[#008080]/10 outline-none appearance-none transition-all cursor-pointer"
                            >
                                <option value="">Global Student View (All)</option>
                                {students.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} ({s.student_id})</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                        </div>
                    </div>

                    {/* 2. Month Navigator */}
                    <div className="w-[200px]">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1 mb-2 block">Temporal Batch (Month)</label>
                        <div className="relative group">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#008080] transition-colors" size={16} />
                            <select
                                onChange={(e) => {
                                    if (!e.target.value) return;
                                    if (e.target.value === 'full') {
                                        setFilters({ ...filters, start_date: '', end_date: '' });
                                        return;
                                    }
                                    const [year, month] = e.target.value.split('-');
                                    const start = new Date(year, month - 1, 1);
                                    const end = new Date(year, month, 0);
                                    setFilters({
                                        ...filters,
                                        start_date: formatDate(start),
                                        end_date: formatDate(end)
                                    });
                                }}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-[11px] font-black text-slate-700 focus:bg-white focus:ring-4 ring-[#008080]/10 outline-none appearance-none transition-all cursor-pointer"
                            >
                                <option value="">Select Target Month</option>
                                <option value="full">Full Academic Timeline</option>
                                {Array.from({ length: 12 }, (_, i) => {
                                    const d = new Date();
                                    d.setMonth(d.getMonth() - i);
                                    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                                    const label = d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
                                    return <option key={val} value={val}>{label}</option>;
                                })}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                        </div>
                    </div>

                    {/* 3. Status Segregation */}
                    <div className="w-[200px]">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1 mb-2 block">Status segregation</label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-[11px] font-black text-slate-700 focus:bg-white focus:ring-4 ring-[#008080]/10 outline-none cursor-pointer"
                        >
                            <option value="">Global Operations</option>
                            {['Scheduled', 'Completed', 'Postponed', 'Cancelled', 'No Show'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <button
                        onClick={() => setFilters({ ...filters, student_id: '', status: '', start_date: formatDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)), end_date: formatDate(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)) })}
                        className="px-8 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-[#008080] shadow-xl shadow-slate-100 transition-all active:scale-95 italic"
                    >
                        Reset Timeline
                    </button>
                </div>

                <div className="flex items-center gap-6 pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-3">
                        <label className="text-[9px] font-black text-slate-400 uppercase italic">Custom Range:</label>
                        <div className="flex items-center bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                            <input
                                type="date"
                                value={filters.start_date}
                                onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                                className="bg-transparent border-none px-3 py-1 text-[10px] font-bold text-slate-600 outline-none"
                            />
                            <span className="text-slate-300 px-2 text-[10px] font-black">→</span>
                            <input
                                type="date"
                                value={filters.end_date}
                                onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                                className="bg-transparent border-none px-3 py-1 text-[10px] font-bold text-slate-600 outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

                {/* Session Stream */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-32 space-y-4 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                        <div className="w-16 h-16 border-4 border-[#008080] border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Syncing session stream...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sessions.map((session) => (
                            <div key={session.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group overflow-hidden flex flex-col md:flex-row items-stretch">
                                <div className={`w-3 shrink-0 ${getStatusColor(session.status).split(' ')[0]} opacity-40 group-hover:opacity-100 transition-opacity`}></div>

                                <div className="flex-grow p-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
                                    <div className="flex items-center gap-6 min-w-[250px]">
                                        <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-slate-400 group-hover:bg-[#008080] group-hover:text-white transition-all duration-700 -rotate-3 group-hover:rotate-0">
                                            <Users size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-black text-slate-900 italic tracking-tight uppercase">{session.student_name}</h3>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic mt-1">SN #{session.session_number} • {session.session_type}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-8 flex-grow">
                                        <div className="flex items-center gap-3 bg-slate-50/50 px-5 py-3 rounded-2xl border border-slate-100 transition-colors group-hover:bg-[#008080]/10">
                                            <Calendar className="text-[#008080]" size={16} />
                                            <span className="text-xs font-black text-slate-700 italic">{new Date(session.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                                        </div>

                                        <div className="flex items-center gap-3 bg-slate-50/50 px-5 py-3 rounded-2xl border border-slate-100 transition-colors group-hover:bg-[#008080]/10">
                                            <Clock className="text-[#008080]" size={16} />
                                            <span className="text-xs font-black text-slate-700 italic tracking-tighter">
                                                {(session.start_time || '00:00').substring(0, 5)} - {(session.end_time || '00:00').substring(0, 5)}
                                            </span>
                                        </div>

                                        <div className="flex flex-col gap-1 flex-grow min-w-[200px]">
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Chapter / Primary Topic</span>
                                            <p className="text-sm font-black text-slate-900 truncate italic">{session.chapter || 'Pending topic assignment'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 pl-8 md:border-l border-slate-100">
                                        <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(session.status)} shadow-sm whitespace-nowrap`}>
                                            {session.status}
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleEditOpen(session)}
                                                className="w-11 h-11 bg-slate-50 text-white rounded-[1rem] flex items-center justify-center hover:bg-[#008080] hover:text-white transition-all duration-500 active:scale-90 shadow-sm"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(session)}
                                                className="w-11 h-11 bg-slate-50 text-rose-600 rounded-[1rem] flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all duration-500 active:scale-90 shadow-sm"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {sessions.length === 0 && (
                            <div className="col-span-full py-32 bg-white rounded-[3rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-8 border border-slate-100 shadow-inner">
                                    <Target size={48} />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight italic uppercase">Timeline Void Discovery</h3>
                                <p className="text-[10px] font-bold text-slate-400 max-w-sm mt-3 uppercase tracking-widest leading-relaxed">No sessions found for the current filter parameters. Adjust your timeline or student selection.</p>
                            </div>
                        )}
                    </div>
                )}

            {/* Creation/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white/80 backdrop-blur-xl px-10 py-6 border-b border-slate-100 flex justify-between items-center z-10">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight italic uppercase">
                                    {editingSession ? 'Reconfigure Session' : 'Deploy New Session'}
                                </h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Master Scheduling Module</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-100 hover:text-slate-600 transition-all active:scale-90"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 space-y-12">
                            <div className="space-y-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <h3 className="text-xs font-black text-[#008080] uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Info size={16} /> SECTION 1: Parameters
                                    </h3>
                                    {formData.student_id && !editingSession && (
                                        (() => {
                                            const student = students.find(s => s.id == formData.student_id);
                                            const nextSessionNum = (student?.session_count || 0) + 1;
                                            if (nextSessionNum % 5 === 0) {
                                                return (
                                                    <div className="bg-rose-50 border border-rose-100 px-4 py-2 rounded-xl flex items-center gap-3 animate-pulse">
                                                        <AlertCircle className="text-rose-600" size={14} />
                                                        <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest italic">
                                                            Milestone Alert: Next session (#{nextSessionNum}) requires an exam assessment
                                                        </span>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Student Select *</label>
                                        <select
                                            required
                                            value={formData.student_id}
                                            onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                                            disabled={!!editingSession}
                                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:bg-white focus:ring-4 ring-[#008080]/10 transition-all outline-none disabled:opacity-50"
                                        >
                                            <option value="">Choose Student</option>
                                            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Session Date *</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:bg-white focus:ring-4 ring-[#008080]/10 transition-all outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Time *</label>
                                        <input
                                            type="time"
                                            required
                                            value={formData.start_time}
                                            onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:bg-white focus:ring-4 ring-[#008080]/10 transition-all outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4 pt-10 border-t border-slate-50">
                                <button
                                    type="submit"
                                    className="flex-1 bg-slate-900 text-white p-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:shadow-2xl transition-all h-16 italic"
                                >
                                    {editingSession ? 'Execute Update' : 'Initialize Session'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 bg-slate-50 text-slate-400 p-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all h-16"
                                >
                                    Cancel Operation
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Timetable;

