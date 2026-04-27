import React, { useState, useEffect } from 'react';
import { Users, Search, ChevronRight, Calendar, Clock, ClipboardList, CheckCircle2, AlertCircle, TrendingUp, History } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const StudentsData = () => {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [dailyUpdates, setDailyUpdates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatesLoading, setUpdatesLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const res = await api.get('/mentor/students');
            if (res.data.success) {
                setStudents(res.data.data);
            }
        } catch (error) {
            toast.error("Failed to fetch students");
        } finally {
            setLoading(false);
        }
    };

    const fetchDailyUpdates = async (studentId) => {
        try {
            setUpdatesLoading(true);
            const res = await api.get(`/mentor/students/${studentId}/daily-updates`);
            if (res.data.success) {
                setDailyUpdates(res.data.data);
            }
        } catch (error) {
            toast.error("Failed to fetch daily updates");
        } finally {
            setUpdatesLoading(false);
        }
    };

    const handleStudentSelect = (student) => {
        setSelectedStudent(student);
        fetchDailyUpdates(student.id);
    };

    const filteredStudents = students.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate streaks/stats
    const totalUpdates = dailyUpdates.length;
    const uniqueDays = [...new Set(dailyUpdates.map(u => u.formatted_date))].length;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-32 h-32 bg-teal-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700 opacity-50" />
                <div className="relative z-10">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase flex items-center gap-3">
                        <Users className="text-teal-600" size={32} />
                        Student Tracking Gateway
                    </h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">
                        Monitor daily progress and task compliance protocols
                    </p>
                </div>
                
                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-teal-500 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search student identity..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:bg-white focus:ring-8 focus:ring-teal-500/5 transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Students List Sidebar */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Personnel</h3>
                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-black">
                            {filteredStudents.length} Active
                        </span>
                    </div>

                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <div key={i} className="h-24 bg-white rounded-3xl border border-slate-100 animate-pulse" />
                            ))
                        ) : filteredStudents.length === 0 ? (
                            <div className="bg-white p-12 rounded-[32px] border border-dashed border-slate-200 text-center">
                                <AlertCircle className="mx-auto text-slate-200 mb-4" size={48} />
                                <p className="text-sm font-bold text-slate-400 uppercase italic">No Students Found</p>
                            </div>
                        ) : (
                            filteredStudents.map(student => (
                                <button
                                    key={student.id}
                                    onClick={() => handleStudentSelect(student)}
                                    className={`w-full p-5 rounded-[28px] border transition-all flex items-center gap-4 group relative overflow-hidden
                                        ${selectedStudent?.id === student.id 
                                            ? 'bg-slate-900 border-slate-900 text-white shadow-xl translate-x-2' 
                                            : 'bg-white border-slate-100 text-slate-600 hover:border-teal-500/30 hover:bg-teal-50/10'}
                                    `}
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-transform group-hover:scale-110 duration-500
                                        ${selectedStudent?.id === student.id ? 'bg-white/10 text-white' : 'bg-slate-50 text-slate-400'}`}>
                                        {student.name.charAt(0)}
                                    </div>
                                    <div className="text-left flex-1">
                                        <h4 className="text-sm font-black tracking-tight">{student.name}</h4>
                                        <p className={`text-[9px] font-bold uppercase tracking-widest mt-1 opacity-60`}>
                                            {student.grade} • {student.course}
                                        </p>
                                    </div>
                                    <ChevronRight className={`transition-transform duration-500 ${selectedStudent?.id === student.id ? 'translate-x-1' : 'opacity-20 translate-x-0'}`} size={20} />
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Updates Detail View */}
                <div className="lg:col-span-8">
                    {selectedStudent ? (
                        <div className="space-y-6">
                            {/* Stats Ribbon */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { label: 'Total Logs', value: totalUpdates, icon: <History size={20} />, color: 'bg-indigo-500' },
                                    { label: 'Days Active', value: uniqueDays, icon: <Calendar size={20} />, color: 'bg-teal-500' },
                                    { label: 'Updates Today', value: dailyUpdates.filter(u => u.formatted_date === new Date().toLocaleDateString('en-GB').split('/').join('-')).length, icon: <CheckCircle2 size={20} />, color: 'bg-amber-500' }
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
                                        <div className={`w-12 h-12 ${stat.color} text-white rounded-2xl flex items-center justify-center shadow-lg`}>
                                            {stat.icon}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                            <p className="text-2xl font-black text-slate-900 tracking-tighter italic">{stat.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Main Content Card */}
                            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
                                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                                        <ClipboardList className="text-teal-500" />
                                        Daily Activity Streams
                                    </h3>
                                    <div className="flex gap-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">
                                            {selectedStudent.registration_number || 'UNOFFICIAL-NODE'}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-8">
                                    {updatesLoading ? (
                                        <div className="flex flex-col items-center justify-center h-64 space-y-4">
                                            <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Decrypting Logs...</p>
                                        </div>
                                    ) : dailyUpdates.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-80 text-center p-12 bg-slate-50/50 rounded-[32px] border border-slate-100">
                                            <TrendingUp className="text-slate-200 mb-6" size={64} />
                                            <h4 className="text-lg font-black text-slate-900 tracking-tighter uppercase italic mb-2">No activity recorded yet</h4>
                                            <p className="text-sm font-bold text-slate-400 max-w-xs">
                                                This student has not submitted any data through the gateway portal yet.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="relative space-y-6">
                                            {/* Vertical Timeline Line */}
                                            <div className="absolute left-[27px] top-4 bottom-4 w-1 bg-slate-100 rounded-full hidden md:block" />

                                            <div className="space-y-8">
                                                {dailyUpdates.map((update, idx) => (
                                                    <div key={update.id} className="relative flex flex-col md:flex-row gap-6 animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                                                        {/* Dot/Node */}
                                                        <div className="hidden md:flex w-14 h-14 bg-white rounded-2xl border-4 border-slate-50 items-center justify-center text-teal-500 shadow-sm relative z-10">
                                                            <Calendar size={20} />
                                                        </div>

                                                        {/* Content Card */}
                                                        <div className="flex-1 bg-slate-50/50 hover:bg-white transition-all border border-slate-100 p-8 rounded-[32px] group/item hover:shadow-xl hover:shadow-slate-200/50">
                                                            <div className="flex flex-col md:flex-row justify-between mb-4 gap-2">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="bg-slate-900 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest italic">
                                                                        {update.formatted_date}
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5 text-slate-400 font-bold text-xs bg-white px-4 py-1.5 rounded-xl border border-slate-100">
                                                                        <Clock size={14} className="text-teal-500" />
                                                                        {update.formatted_time}
                                                                    </div>
                                                                </div>
                                                                <div className="bg-teal-500/10 text-teal-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-teal-500/20">
                                                                    Verified Entry
                                                                </div>
                                                            </div>
                                                            <div className="prose prose-slate max-w-none">
                                                                <p className="text-slate-600 font-bold leading-relaxed whitespace-pre-wrap">
                                                                    {update.data_content}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm flex flex-col items-center justify-center h-[700px] p-12 text-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                            <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mb-8 relative z-10 transition-transform duration-700 group-hover:scale-110">
                                <Users className="text-slate-200" size={64} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic mb-4 relative z-10">Select a Student Identity</h3>
                            <p className="text-sm font-bold text-slate-400 max-w-sm leading-relaxed relative z-10">
                                Choose a student from the sidebar to visualize their daily activity stream and tracking metrics.
                            </p>
                            <div className="mt-8 flex gap-3 relative z-10 opacity-30">
                                <div className="w-2 h-2 bg-[#008080] rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-[#008080] rounded-full animate-bounce delay-100" />
                                <div className="w-2 h-2 bg-[#008080] rounded-full animate-bounce delay-200" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentsData;
