import React, { useState, useEffect } from 'react';
import axios from '../../services/api';
import {
    Calendar,
    Plus,
    Clock,
    Users,
    CheckCircle,
    MoreVertical,
    Search,
    ChevronDown,
    MapPin,
    ArrowRight,
    Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

const FacultySessions = () => {
    const [sessions, setSessions] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);
    const [attendanceMap, setAttendanceMap] = useState({}); // { student_id: 'Present' | 'Absent' | 'Late' }
    const [submittingAttendance, setSubmittingAttendance] = useState(false);

    // New Session Form
    const [formData, setFormData] = useState({
        topic: '',
        date: '',
        studentIds: []
    });

    useEffect(() => {
        fetchSessions();
        fetchStudents();
    }, []);

    const fetchSessions = async () => {
        try {
            const res = await axios.get('/faculty/sessions');
            if (res.data.success) setSessions(res.data.data);
        } catch (error) {
            toast.error("Failed to load sessions");
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const res = await axios.get('/faculty/students');
            if (res.data.success) setStudents(res.data.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/faculty/sessions', formData);
            if (res.data.success) {
                toast.success("Session scheduled successfully");
                setIsModalOpen(false);
                fetchSessions();
                setFormData({ topic: '', date: '', studentIds: [] });
            }
        } catch (error) {
            toast.error("Failed to create session");
        }
    };

    const handleCompleteSession = async (session) => {
        setSelectedSession(session);
        // Initialize attendance map with 'Present' for all students by default
        try {
            const res = await axios.get(`/faculty/sessions/${session.id}/students`);
            const sessionStudents = res.data.data;
            const initialMap = {};
            sessionStudents.forEach(s => {
                initialMap[s.id] = 'Present';
            });
            setAttendanceMap(initialMap);
            setIsAttendanceModalOpen(true);
        } catch (error) {
            toast.error("Failed to load session students");
        }
    };

    const submitAttendance = async () => {
        setSubmittingAttendance(true);
        try {
            const attendance_data = Object.entries(attendanceMap).map(([student_id, status]) => ({
                student_id: parseInt(student_id),
                status
            }));

            const res = await axios.post('/attendance/mark', {
                session_id: selectedSession.id,
                attendance_data
            });

            if (res.data.success) {
                // Now mark the session as completed
                await axios.put(`/faculty/sessions/${selectedSession.id}/complete`, {
                    attendance: attendance_data
                });
                
                toast.success("Attendance marked and session completed!");
                setIsAttendanceModalOpen(false);
                fetchSessions();
            }
        } catch (error) {
            toast.error("Failed to sync attendance");
        } finally {
            setSubmittingAttendance(false);
        }
    };

    const toggleStudent = (id) => {
        setFormData(prev => ({
            ...prev,
            studentIds: prev.studentIds.includes(id)
                ? prev.studentIds.filter(s => s !== id)
                : [...prev.studentIds, id]
        }));
    };

    return (
        <div className="space-y-12 pb-20">
            {/* Page Header */}
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Faculty Sessions</h2>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                        <Calendar size={14} className="text-[#008080]" />
                        Schedule and manage academic sessions with assigned students
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-3 px-10 py-5 bg-[#008080] text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-[#008080] transition-all shadow-2xl shadow-[#008080]/30"
                >
                    <Plus size={18} />
                    Schedule New Class
                </button>
            </div>

            {/* Sessions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-100 rounded-[3rem] animate-pulse"></div>)
                ) : sessions.length > 0 ? (
                    sessions.map((session) => (
                        <div key={session.id} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-700 group relative">
                            <div className="flex justify-between items-start mb-8">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${session.status === 'Completed' ? 'bg-emerald-50 text-emerald-500' : 'bg-[#008080]/10 text-[#008080]'
                                    }`}>
                                    {session.status === 'Completed' ? <CheckCircle size={28} /> : <Clock size={28} />}
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${session.status === 'Completed' ? 'bg-emerald-500 text-white' : 'bg-[#008080] text-white'
                                    } shadow-xl shadow-[#008080]/20`}>
                                    {session.status}
                                </span>
                            </div>

                            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-4 group-hover:text-[#008080] transition-colors uppercase">{session.topic}</h3>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-3 text-slate-500">
                                    <Calendar size={16} className="text-[#008080]" />
                                    <span className="text-xs font-bold">{new Date(session.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-500">
                                    <Users size={16} className="text-[#008080]" />
                                    <span className="text-xs font-bold">{session.student_count || 0} Students Enrolled</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {session.status === 'Scheduled' ? (
                                    <button
                                        onClick={() => handleCompleteSession(session)}
                                        className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group/btn"
                                    >
                                        Mark Attendance
                                        <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                ) : (
                                    <button className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest cursor-default">
                                        Session Concluded
                                    </button>
                                )}
                                <button className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all">
                                    <MoreVertical size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-32 text-center bg-white rounded-[4rem] border border-slate-100 shadow-sm">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mx-auto mb-8">
                            <Calendar size={48} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight italic">No sessions scheduled</h3>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Use the "Schedule" button to create your first class</p>
                    </div>
                )}
            </div>

            {/* Schedule Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 backdrop-blur-3xl bg-slate-900/10 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-3xl rounded-[3.5rem] border border-slate-100 shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-10 duration-500">
                        <div className="p-10 border-b border-slate-50 flex justify-between items-center text-white bg-slate-900 relative">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-[#008080]/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                            <div className="relative">
                                <h3 className="text-2xl font-black tracking-tight italic">Plan Session</h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Academic Planning Engine</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors relative">
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-12 space-y-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Topic / Subject</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Advanced Mathematics"
                                        className="w-full px-10 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-xs font-bold focus:outline-none focus:ring-4 focus:ring-[#008080]/5 focus:border-[#008080] transition-all shadow-sm"
                                        value={formData.topic}
                                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Schedule Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-10 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-xs font-bold focus:outline-none focus:ring-4 focus:ring-[#008080]/5 focus:border-[#008080] transition-all shadow-sm"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between ml-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enroll Students ({formData.studentIds.length})</label>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, studentIds: students.map(s => s.id) })}
                                        className="text-[9px] font-black text-[#008080] uppercase tracking-widest hover:underline"
                                    >
                                        Select All Assigned
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-64 overflow-y-auto p-2 custom-scrollbar border-2 border-dashed border-slate-100 rounded-3xl">
                                    {students.map(student => (
                                        <button
                                            key={student.id}
                                            type="button"
                                            onClick={() => toggleStudent(student.id)}
                                            className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 text-left border ${formData.studentIds.includes(student.id)
                                                ? 'bg-[#008080] border-[#008080] text-white shadow-lg shadow-[#008080]/30'
                                                : 'bg-white border-slate-100 text-slate-600 hover:border-[#008080]'
                                                }`}
                                        >
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${formData.studentIds.includes(student.id) ? 'bg-white/20' : 'bg-slate-100'
                                                }`}>
                                                {student.name.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold truncate">{student.name}</p>
                                                <p className={`text-[9px] font-black uppercase tracking-tighter ${formData.studentIds.includes(student.id) ? 'text-[#008080]' : 'text-slate-400'
                                                    }`}>{student.roll_number || 'ID UNKNOWN'}</p>
                                            </div>
                                            {formData.studentIds.includes(student.id) && <CheckCircle size={14} className="animate-in zoom-in" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-5 bg-slate-100 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200"
                                >
                                    Broadcast & Schedule
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>

            {/* Attendance Modal */}
            {isAttendanceModalOpen && selectedSession && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 backdrop-blur-3xl bg-slate-900/40 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                        <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black italic">Mark Session Attendance</h3>
                                <p className="text-[9px] font-black uppercase tracking-widest opacity-50">{selectedSession.topic}</p>
                            </div>
                            <button onClick={() => setIsAttendanceModalOpen(false)} className="text-white/50 hover:text-white">
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>
                        <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            <div className="space-y-4">
                                {Object.keys(attendanceMap).map(studentId => {
                                    const studentIdInt = parseInt(studentId);
                                    const student = students.find(s => s.id === studentIdInt);
                                    return (
                                        <div key={studentId} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-700/50 rounded-3xl border border-slate-100 dark:border-white/5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-[#008080] text-white rounded-xl flex items-center justify-center font-black">
                                                    {student?.name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-900 dark:text-white">{student?.name || 'Unknown'}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase">{student?.roll_number}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-white/10">
                                                {['Present', 'Absent', 'Late'].map(status => (
                                                    <button
                                                        key={status}
                                                        onClick={() => setAttendanceMap(prev => ({ ...prev, [studentId]: status }))}
                                                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all
                                                            ${attendanceMap[studentId] === status 
                                                                ? (status === 'Present' ? 'bg-emerald-500 text-white' : status === 'Absent' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white')
                                                                : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900'}
                                                        `}
                                                    >
                                                        {status}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="p-8 border-t border-slate-50 dark:border-white/5 flex gap-4">
                            <button 
                                onClick={() => setIsAttendanceModalOpen(false)}
                                className="flex-1 py-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={submitAttendance}
                                disabled={submittingAttendance}
                                className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"
                            >
                                {submittingAttendance ? <Loader2 className="animate-spin" size={16} /> : "Submit & Finalize Session"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultySessions;
