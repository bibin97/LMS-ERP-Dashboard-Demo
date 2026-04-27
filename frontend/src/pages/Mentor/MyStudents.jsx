import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { User, Users, ChevronRight, Search, CheckCircle2, Calendar, Clock, Plus, Trash2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import StudentListFilterDropdown, { sortStudentsByOption } from '../../components/StudentListFilterDropdown';

const StudentCard = ({ student, navigate, viewMode, handleToggleConnection, handleCompleteOnboarding, handleLogHoursClick }) => (
    <div
        key={student.id}
        onClick={() => navigate(`/mentor/students/${student.id}`)}
        className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 group cursor-pointer hover:-translate-y-2 transition-all duration-500 relative overflow-hidden flex flex-col justify-between"
    >
        <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div className="w-14 h-14 bg-[#14B8A6] rounded-[22px] flex items-center justify-center text-white shadow-2xl shadow-[#14B8A6]/30">
                <ChevronRight size={24} strokeWidth={3} />
            </div>
        </div>

        <div className="flex flex-col gap-6">
            <div className="w-20 h-20 bg-slate-50/50 rounded-[28px] border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-[#14B8A6] group-hover:bg-[#14B8A6]/5 group-hover:border-[#14B8A6]/10 transition-all duration-500">
                <User size={36} strokeWidth={2.5} />
            </div>

            <div>
                <h3 className="text-xl font-black text-slate-900 leading-tight mb-2 group-hover:text-[#008080] transition-colors flex flex-wrap items-center gap-2">
                    {student.name}
                    
                    {/* Student Badge System */}
                    {student.badge === 'Gold' && <span title="Mentorship Plan" className="cursor-help text-lg">🥇</span>}
                    {student.badge === 'Silver' && <span title="Tuition Plan" className="cursor-help text-lg">🥈</span>}
                    {student.badge === 'Diamond' && <span title="Mentorship & Tuition Plan" className="cursor-help text-lg">💎</span>}

                    {student.is_shifted ? (
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-500 text-[8px] font-black uppercase tracking-widest border border-rose-100 rounded-lg">
                            Shifted: {student.shifted_from}
                        </span>
                    ) : null}
                    {student.course_completed === 1 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200 text-[9px] font-black uppercase tracking-widest whitespace-nowrap">
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                            Course Completed
                        </span>
                    )}
                </h3>
                <div className="flex flex-wrap gap-3">
                    <span className="px-5 py-2 bg-[#14B8A6]/10 text-[#14B8A6] text-[10px] font-black uppercase tracking-[0.2em] rounded-[14px] border border-[#14B8A6]/20">
                        {student.grade}
                    </span>
                    <span className="px-5 py-2 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-[14px] border border-slate-100">
                        {student.subject}
                    </span>
                </div>
            </div>

            <div className="pt-6 border-t border-slate-50 grid grid-cols-2 gap-4">
                <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Weekly Hours</p>
                    <p className="text-sm font-bold text-slate-700">{student.hour} Hrs</p>
                </div>
                <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Next Payment</p>
                    <p className="text-sm font-bold text-[#008080]">{student.next_installment_date ? new Date(student.next_installment_date).toLocaleDateString() : 'N/A'}</p>
                </div>
            </div>
        </div>

        {/* Action Area */}
        <div
            className="mt-6 pt-6 border-t border-slate-50 flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
        >
            {viewMode === 'active' ? (
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">Connected Today</span>
                        <button
                            onClick={(e) => handleToggleConnection(student.id, student.connected_today, e)}
                            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-black transition-all ${student.connected_today ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 border border-slate-100'}`}
                        >
                            <CheckCircle2 size={16} className={student.connected_today ? 'text-emerald-500' : 'text-slate-300'} />
                            {student.connected_today ? 'YES' : 'NO'}
                        </button>
                    </div>
                    {/* Log Hours Button */}
                    <button
                        onClick={(e) => handleLogHoursClick(student, e)}
                        className="w-full flex items-center justify-center gap-4 py-4 bg-slate-900 text-white rounded-[20px] text-[11px] font-black uppercase tracking-[0.25em] transition-all border border-slate-800 hover:shadow-2xl hover:shadow-slate-900/20 active:scale-95 group/btn"
                    >
                        <Clock size={16} strokeWidth={3} className="text-[#14B8A6] group-hover/btn:scale-110 transition-transform" />
                        Log Node Access
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    <span className="text-[10px] uppercase font-black tracking-widest text-amber-500">Action Required</span>
                    <button
                        onClick={(e) => handleCompleteOnboarding(student, e)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-emerald-200"
                    >
                        <Calendar size={16} />
                        Setup Timetable & Finish
                    </button>
                    <p className="text-[10px] text-slate-400 text-center font-bold">Create a one-month schedule to activate this student.</p>
                </div>
            )}
        </div>
    </div>
);

const MyStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [viewMode, setViewMode] = useState('active'); // 'active' or 'new'
    const [isTimetableModalOpen, setIsTimetableModalOpen] = useState(false);
    const [isHoursModalOpen, setIsHoursModalOpen] = useState(false);
    const [hoursFormData, setHoursFormData] = useState({ date: new Date().toISOString().split('T')[0], hours: '' });
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [batchSessions, setBatchSessions] = useState([
        { date: '', start_time: '10:00', end_time: '11:00', chapter: '', session_type: 'Regular Class' }
    ]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const res = await api.get('/mentor/students');
            setStudents(res.data.data);
        } catch (error) {
            toast.error("Failed to load students");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleConnection = async (studentId, currentStatus, e) => {
        e.stopPropagation(); // prevent navigation
        try {
            await api.put(`/mentor/students/${studentId}/connection`, {
                connected_today: !currentStatus
            });
            // update UI locally
            setStudents(prev => prev.map(s => s.id === studentId ? { ...s, connected_today: !currentStatus ? 1 : 0 } : s));
            toast.success(!currentStatus ? 'Marked as connected today!' : 'Connection marked as incomplete.');
        } catch (error) {
            toast.error("Failed to update connection status");
        }
    };

    const handleCompleteOnboarding = (student, e) => {
        e.stopPropagation();
        setSelectedStudent(student);
        setBatchSessions([{ date: '', start_time: '10:00', end_time: '11:00', chapter: '', session_type: 'Regular Class' }]);
        setIsTimetableModalOpen(true);
    };

    const handleLogHoursClick = (student, e) => {
        e.stopPropagation();
        setSelectedStudent(student);
        setHoursFormData({ date: new Date().toISOString().split('T')[0], hours: '' });
        setIsHoursModalOpen(true);
    };

    const handleHoursSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/mentor/daily-hours', {
                student_id: selectedStudent.id,
                hours: hoursFormData.hours,
                date: hoursFormData.date
            });
            toast.success('Daily hours logged successfully');
            setIsHoursModalOpen(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to log hours');
        }
    };

    const addBatchRow = () => {
        setBatchSessions([...batchSessions, { date: '', start_time: '10:00', end_time: '11:00', chapter: '', session_type: 'Regular Class' }]);
    };

    const removeBatchRow = (index) => {
        if (batchSessions.length === 1) return;
        setBatchSessions(batchSessions.filter((_, i) => i !== index));
    };

    const updateBatchRow = (index, field, value) => {
        const updated = [...batchSessions];
        updated[index][field] = value;
        setBatchSessions(updated);
    };

    const handleBatchSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/mentor/timetable/batch', {
                student_id: selectedStudent.id,
                sessions: batchSessions
            });
            setStudents(prev => prev.map(s => s.id === selectedStudent.id ? { ...s, onboarding_status: 'completed' } : s));
            setIsTimetableModalOpen(false);
            toast.success("Timetable created and student activated!");
            setViewMode('active');
        } catch (error) {
            toast.error(error.response?.data?.message || "Batch update failed");
        }
    };

    const filteredStudents = useMemo(() => {
        const filtered = students.filter(s => {
            const isNew = s.onboarding_status === 'pending';
            if (viewMode === 'new' && !isNew) return false;
            if (viewMode === 'active' && isNew) return false;
            return s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (s.subject || '').toLowerCase().includes(searchTerm.toLowerCase());
        });
        return sortStudentsByOption(filtered, sortBy);
    }, [students, viewMode, searchTerm, sortBy]);

    return (
        <div className="space-y-12 pb-20">
            {/* Page Header */}
            <div className="bg-white/70 backdrop-blur-xl p-12 rounded-[40px] border border-white/60 shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="text-center md:text-left">
                    <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none mb-3 italic">Student Fleet</h2>
                    <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.25em] flex items-center justify-center md:justify-start gap-3 mt-1">
                        <div className="w-2 h-2 rounded-full bg-[#14B8A6] animate-pulse"></div>
                        Direct assignments & operational node management
                    </p>
                </div>
                <div className="w-20 h-20 bg-[#14B8A6] rounded-[28px] shadow-2xl shadow-[#14B8A6]/30 flex items-center justify-center text-white">
                    <Users size={36} strokeWidth={2.5} />
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                <div className="relative w-full md:w-96">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search student or subject..."
                        className="w-full p-4 pl-12 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:bg-white focus:ring-4 focus:ring-[#008080] transition-all font-semibold"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <StudentListFilterDropdown value={sortBy} onChange={setSortBy} />
                    <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-2xl border border-slate-100">
                        <button
                            onClick={() => setViewMode('active')}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'active' ? 'bg-white text-[#008080] shadow-sm' : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            Active Students
                        </button>
                        <button
                            onClick={() => setViewMode('new')}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'new' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            New (Onboarding)
                            {students.filter(s => s.onboarding_status === 'pending').length > 0 && (
                                <span className="ml-2 px-1.5 py-0.5 bg-rose-500 text-white rounded-full text-[10px]">
                                    {students.filter(s => s.onboarding_status === 'pending').length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center p-20 text-slate-400 font-bold animate-pulse">Scanning Student Database...</div>
            ) : (
                <div className="space-y-12">
                    {/* Direct Assignments */}
                    {filteredStudents.filter(s => !s.is_shifted).length > 0 && (
                        <div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-[#008080]"></div>
                                Direct Assignments
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredStudents.filter(s => !s.is_shifted).map((student) => (
                                    <StudentCard key={student.id} student={student} navigate={navigate} viewMode={viewMode} handleToggleConnection={handleToggleConnection} handleCompleteOnboarding={handleCompleteOnboarding} handleLogHoursClick={handleLogHoursClick} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Shifted Assignments */}
                    {filteredStudents.filter(s => s.is_shifted).length > 0 && (
                        <div>
                            <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-6 flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                                Shifted from Other Mentors
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredStudents.filter(s => s.is_shifted).map((student) => (
                                    <StudentCard key={student.id} student={student} navigate={navigate} viewMode={viewMode} handleToggleConnection={handleToggleConnection} handleCompleteOnboarding={handleCompleteOnboarding} handleLogHoursClick={handleLogHoursClick} />
                                ))}
                            </div>
                        </div>
                    )}

                    {filteredStudents.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                            <p className="text-slate-400 font-bold">No students matched your search criteria.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Batch Timetable Modal */}
            {isTimetableModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-white">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic">Onboarding Workflow</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Setup Timetable for {selectedStudent?.name}</p>
                            </div>
                            <button onClick={() => setIsTimetableModalOpen(false)} className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleBatchSubmit} className="flex-1 overflow-y-auto p-10">
                            <div className="space-y-4">
                                {batchSessions.map((session, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100 relative group">
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-1">Date</label>
                                            <input
                                                type="date"
                                                required
                                                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                                                value={session.date}
                                                onChange={(e) => updateBatchRow(index, 'date', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-1">Start Time</label>
                                            <input
                                                type="time"
                                                required
                                                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                                                value={session.start_time}
                                                onChange={(e) => updateBatchRow(index, 'start_time', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-1">End Time</label>
                                            <input
                                                type="time"
                                                required
                                                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                                                value={session.end_time}
                                                onChange={(e) => updateBatchRow(index, 'end_time', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-1">Chapter/Topic</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Calculus Intro"
                                                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                                                value={session.chapter}
                                                onChange={(e) => updateBatchRow(index, 'chapter', e.target.value)}
                                            />
                                        </div>
                                        <div className="flex items-end gap-2">
                                            <div className="flex-1 space-y-1">
                                                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-1">Type</label>
                                                <select
                                                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                                                    value={session.session_type}
                                                    onChange={(e) => updateBatchRow(index, 'session_type', e.target.value)}
                                                >
                                                    <option>Regular Class</option>
                                                    <option>Revision</option>
                                                    <option>Test</option>
                                                </select>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeBatchRow(index)}
                                                className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={addBatchRow}
                                    className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-50 hover:border-[#008080] hover:text-[#008080] transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus size={16} /> Add Session To Schedule
                                </button>
                            </div>
                        </form>

                        <div className="px-10 py-8 border-t border-slate-100 bg-slate-50/50 flex gap-4">
                            <button
                                type="submit"
                                onClick={handleBatchSubmit}
                                className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-[#008080] transition-all flex items-center justify-center gap-3 italic"
                            >
                                <CheckCircle2 size={18} /> Initialize Activation
                            </button>
                            <button onClick={() => setIsTimetableModalOpen(false)} className="px-8 bg-white border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all">
                                Abort
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Log Hours Modal */}
            {isHoursModalOpen && selectedStudent && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsHoursModalOpen(false)}></div>
                    <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl overflow-hidden relative z-10 animate-in zoom-in duration-300">
                        <div className="px-10 py-8 bg-slate-900 text-white relative">
                            <div className="absolute top-0 right-0 p-6 opacity-20">
                                <Clock size={48} />
                            </div>
                            <h3 className="text-2xl font-black italic tracking-tighter uppercase relative z-10">Log Working Hours</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 relative z-10">Record time spent for {selectedStudent.name}</p>
                        </div>
                        <form onSubmit={handleHoursSubmit} className="p-10 space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-2 block">Date</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold shadow-sm outline-none focus:ring-4 focus:ring-[#008080]"
                                    value={hoursFormData.date}
                                    onChange={(e) => setHoursFormData({ ...hoursFormData, date: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-2 block">Total Hours</label>
                                <input
                                    type="number"
                                    step="0.5"
                                    min="0.5"
                                    required
                                    placeholder="e.g. 2.5"
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold shadow-sm outline-none focus:ring-4 focus:ring-[#008080]"
                                    value={hoursFormData.hours}
                                    onChange={(e) => setHoursFormData({ ...hoursFormData, hours: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-4 pt-4 border-t border-slate-50">
                                <button
                                    type="submit"
                                    className="flex-[2] bg-[#008080] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#008080]/30 hover:bg-[#008080] transition-all"
                                >
                                    Log Hours
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsHoursModalOpen(false)}
                                    className="flex-1 bg-white border border-slate-200 text-slate-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyStudents;
