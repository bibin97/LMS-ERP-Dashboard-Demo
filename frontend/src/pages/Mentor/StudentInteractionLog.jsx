import React, { useState, useEffect } from 'react';
import { useLocation, useLocation as useLoc, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
    MessageSquare, CheckCircle, ArrowLeft, Target, AlertCircle, BarChart3,
    CloudLightning, FileText, Camera, Phone, UserCheck, HeartPulse, Brain,
    Clock, Activity, BookOpen, Smile, Plus, Frown, Meh, MoreHorizontal, Upload, ImageIcon, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';
import MentorshipQuestionsForm from '../../components/Mentor/MentorshipQuestionsForm';

const StudentInteractionLog = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Check if a student was passed via state (e.g. from My Students list)
    const studentFromState = location.state?.student;

    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(studentFromState || null);
    const [logs, setLogs] = useState([]);
    const [allLogs, setAllLogs] = useState([]);
    // State for viewing details
    const [viewLog, setViewLog] = useState(null);
    const [uploading, setUploading] = useState(false);

    const initialFormData = {
        date: new Date().toISOString().split('T')[0],
        connection_method: 'Call',
        self_clarity: '',
        confusing_topic: '',
        can_solve_independently: 'Yes',
        homework_status: 'Done',
        homework_difficulty: 'Medium',
        revision_quality: 'Good',
        confidence: 3,
        motivation_level: 'Medium',
        exam_anxiety: 'No',
        focus_level: 'Average',
        student_requests: '',
        parent_update_priority: 'Low',
        mentor_action_needed: 'No',
        mentor_notes: '',
        connected_today: true,
        screenshot_url: ''
    };

    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        if (!selectedStudent) {
            fetchStudents();
            fetchAllLogs();
        } else {
            fetchStudentLogs(selectedStudent.id);
        }
    }, [selectedStudent]);

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

    const fetchAllLogs = async () => {
        try {
            const res = await api.get('/mentor/student-logs');
            setAllLogs(res.data.data);
        } catch (error) {
            toast.error("Failed to load interaction history");
        }
    };

    const fetchStudentLogs = async (studentId) => {
        try {
            const res = await api.get(`/mentor/students/${studentId}`);
            const student = students.find(s => s.id === studentId) || selectedStudent;
            if (isMentorshipStudent(student)) {
                setLogs(res.data.data.mentorshipLogs || []);
            } else {
                setLogs(res.data.data.studentLogs || []);
            }
        } catch (error) {
            toast.error("Failed to load student logs");
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be less than 5MB");
            return;
        }

        const uploadData = new FormData();
        uploadData.append('file', file);

        setUploading(true);
        try {
            const res = await api.post('/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                setFormData({ ...formData, screenshot_url: res.data.url });
                toast.success("File uploaded successfully");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "File upload failed");
        } finally {
            setUploading(false);
        }
    };

    const isDiamondCategory = (s) => s.badge === 'Diamond' || (s.enrollment_type && s.enrollment_type.toLowerCase() === 'both');
    const isGoldCategory = (s) => (s.badge === 'Gold' || (s.enrollment_type && s.enrollment_type.toLowerCase() === 'mentorship')) && !isDiamondCategory(s);
    const isSilverCategory = (s) => !isDiamondCategory(s) && !isGoldCategory(s);

    const isMentorshipStudent = (student) => {
        return isDiamondCategory(student) || isGoldCategory(student);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Validate Self Clarity (0-100)
        if (name === 'self_clarity') {
            const num = parseInt(value);
            if (value !== '' && (isNaN(num) || num < 0 || num > 100)) return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const handleStudentSelect = (student) => {
        setSelectedStudent(student);
        setFormData(initialFormData); // Reset form data for the new student
        setSubmitted(false); // Reset submission state
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/mentor/student-log', {
                ...formData,
                student_id: selectedStudent.id,
                student_name: selectedStudent.name
            });

            toast.success("Interaction log submitted!");
            setFormData(initialFormData); // Clear form after submission
            setSubmitted(true);
            fetchStudentLogs(selectedStudent.id); // Refresh logs
        } catch (error) {
            toast.error(error.response?.data?.message || "Logging failed");
        } finally {
            setLoading(false);
        }
    };

    // Helper to render label-value pair
    const DetailRow = ({ label, value, highlight = false }) => (
        <div className="flex flex-col gap-2 p-5 bg-slate-50/50 rounded-[20px] border border-slate-100/50 group/detail hover:bg-white hover:border-[#14B8A6]/30 transition-all">
            <span className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] group-hover/detail:text-[#14B8A6] transition-colors">{label}</span>
            <span className={`text-[13px] font-black uppercase tracking-tighter ${highlight ? 'text-[#14B8A6]' : 'text-slate-700'}`}>{value || '—'}</span>
        </div>
    );

    if (!selectedStudent) {
        return (
        <div className="max-w-6xl mx-auto p-4 md:p-10 pb-20 space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <header className="bg-white/70 backdrop-blur-xl p-8 md:p-14 rounded-[40px] md:rounded-[48px] border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.06)] flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="text-center md:text-left">
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-4">Engagement Hub</h1>
                    <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.3em] mt-3 flex items-center gap-3 justify-center md:justify-start">
                        <div className="w-2 h-2 rounded-full bg-[#14B8A6] animate-ping"></div>
                        Student Performance Protocol
                    </p>
                </div>
                <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-slate-800 to-slate-900 rounded-[32px] flex items-center justify-center text-[#14B8A6] shadow-2xl shadow-slate-900/20 group hover:rotate-12 transition-transform duration-500">
                    <UserCheck size={40} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
                </div>
            </header>

                {/* Explicit Start Logging Action Bar */}
                <div className="bg-slate-900/95 backdrop-blur-2xl p-8 md:p-12 rounded-[40px] border border-slate-800 shadow-[0_30px_60px_rgba(0,0,0,0.15)] flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#14B8A6]/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-[#14B8A6]/10 transition-colors duration-1000"></div>
                    <div className="relative z-10 w-full md:w-auto text-center md:text-left">
                        <h3 className="text-2xl font-black text-white mb-2 flex items-center gap-4 justify-center md:justify-start italic tracking-tight">
                            <Plus size={28} className="text-[#14B8A6]" strokeWidth={3} /> Initialize Session Log
                        </h3>
                        <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.25em]">Select an active student node to begin documentation</p>
                    </div>
                    
                    <div className="relative w-full md:w-[450px] z-10">
                        {students.length > 0 ? (
                            <div className="relative">
                                <select
                                    onChange={(e) => {
                                        const student = students.find(s => s.id.toString() === e.target.value);
                                        if(student) handleStudentSelect(student);
                                    }}
                                    className="w-full p-6 bg-slate-800/50 border border-slate-700/50 rounded-[28px] text-[13px] font-black uppercase tracking-[0.1em] text-slate-300 outline-none focus:ring-4 focus:ring-[#14B8A6]/10 focus:border-[#14B8A6]/30 appearance-none cursor-pointer transition-all hover:bg-slate-800"
                                    defaultValue=""
                                >
                                    <option value="" disabled>Search Protocol Database...</option>
                                    {students.map(s => (
                                        <option key={s.id} value={s.id}>{s.name} • {s.course.toUpperCase()}</option>
                                    ))}
                                </select>
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-[#14B8A6] transition-colors">
                                    <ArrowLeft size={20} className="rotate-[-90deg]" strokeWidth={3} />
                                </div>
                            </div>
                        ) : (
                            <div className="w-full p-6 bg-rose-500/10 border border-rose-500/20 rounded-[28px] text-[11px] font-black uppercase tracking-widest text-rose-500 text-center animate-pulse">
                                Null Assigned Student Payload
                            </div>
                        )}
                    </div>
                </div>

                {/* Category 1: Mentorship & Tuition (Diamond / Both) */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 pl-2">
                        <div className="w-4 h-8 bg-purple-500 rounded-full"></div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                            Mentorship & Tuition (Diamond)
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {students.filter(isDiamondCategory).length > 0 ? (
                            students.filter(isDiamondCategory).map(student => (
                                <button
                                    key={student.id}
                                    onClick={() => handleStudentSelect(student)}
                                    className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-200 hover:scale-[1.02] transition-all cursor-pointer group text-left relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-full -mr-12 -mt-12 group-hover:bg-purple-100 group-hover:scale-150 transition-all duration-500 opacity-50"></div>
                                    <div className="flex items-center gap-2 mb-1 relative z-10">
                                        <h3 className="text-lg font-black text-slate-900">{student.name}</h3>
                                        <span>💎</span>
                                    </div>
                                    <p className="text-xs font-bold text-slate-500 mb-4 relative z-10">{student.course} • {student.grade}</p>
                                    <div className="flex items-center gap-2 text-purple-600 text-[10px] font-black uppercase tracking-widest relative z-10">
                                        <span>Log Interaction</span> <ArrowLeft size={12} className="rotate-180" />
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="col-span-full py-10 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">No students in this category.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Category 2: Mentorship Only (Gold) */}
                <div className="space-y-6 pt-6">
                    <div className="flex items-center gap-3 pl-2">
                        <div className="w-4 h-8 bg-amber-400 rounded-full"></div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest pl-2">
                            Mentorship Only (Gold)
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {students.filter(isGoldCategory).length > 0 ? (
                            students.filter(isGoldCategory).map(student => (
                                <button
                                    key={student.id}
                                    onClick={() => handleStudentSelect(student)}
                                    className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 hover:shadow-xl hover:shadow-amber-500/10 hover:border-amber-200 hover:scale-[1.02] transition-all cursor-pointer group text-left relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full -mr-12 -mt-12 group-hover:bg-amber-100 group-hover:scale-150 transition-all duration-500 opacity-50"></div>
                                    <div className="flex items-center gap-2 mb-1 relative z-10">
                                        <h3 className="text-lg font-black text-slate-900">{student.name}</h3>
                                        <span>🥇</span>
                                    </div>
                                    <p className="text-xs font-bold text-slate-500 mb-4 relative z-10">{student.course} • {student.grade}</p>
                                    <div className="flex items-center gap-2 text-amber-600 text-[10px] font-black uppercase tracking-widest relative z-10">
                                        <span>Log Interaction</span> <ArrowLeft size={12} className="rotate-180" />
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="col-span-full py-10 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">No students in this category.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Category 3: Tuition Only Phase 3 (Silver/Standard) */}
                <div className="space-y-6 pt-6">
                    <div className="flex items-center gap-3 pl-2">
                        <div className="w-4 h-8 bg-slate-400 rounded-full"></div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest pl-2">
                            Tuition Only
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {students.filter(isSilverCategory).length > 0 ? (
                            students.filter(isSilverCategory).map(student => (
                                <button
                                    key={student.id}
                                    onClick={() => handleStudentSelect(student)}
                                    className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 hover:shadow-xl hover:shadow-[#008080]/10 hover:border-[#008080]/30 hover:scale-[1.02] transition-all cursor-pointer group text-left relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 group-hover:bg-[#008080] group-hover:scale-150 transition-all duration-500 opacity-10"></div>
                                    <div className="flex items-center gap-2 mb-1 relative z-10">
                                        <h3 className="text-lg font-black text-slate-900">{student.name}</h3>
                                        {student.badge === 'Silver' && <span>🥈</span>}
                                    </div>
                                    <p className="text-xs font-bold text-slate-500 mb-4 relative z-10">{student.course} • {student.grade}</p>
                                    <div className="flex items-center gap-2 text-slate-400 group-hover:text-[#008080] text-[10px] font-black uppercase tracking-widest relative z-10">
                                        <span>Log Interaction</span> <ArrowLeft size={12} className="rotate-180" />
                                    </div>
                                </button>
                            ))
                        ) : (
                                <div className="col-span-full py-10 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">No students in this category.</p>
                                </div>
                        )}
                    </div>
                </div>

                {/* History Table for all students */}
                <div className="mt-12 bg-white/80 backdrop-blur-lg p-10 rounded-[44px] shadow-[0_30px_60px_rgba(0,0,0,0.04)] border border-white/60 group">
                    <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-4 italic tracking-tight">
                        <Activity className="text-[#14B8A6]" size={28} strokeWidth={2.5} />
                        Protocol History Feed
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50">
                                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Method</th>
                                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mentor Notes</th>
                                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allLogs.slice(0, 10).map(log => (
                                    <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-all group/row">
                                        <td className="p-6 text-[11px] font-black text-slate-500 uppercase tracking-widest">{new Date(log.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                        <td className="p-6 text-[13px] font-black text-slate-800 italic uppercase tracking-tighter group-hover/row:text-[#14B8A6] transition-colors">{log.student_name}</td>
                                        <td className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                            <span className="px-4 py-1.5 bg-slate-100/50 rounded-full border border-slate-200/50">
                                                {log.connection_method}
                                            </span>
                                        </td>
                                        <td className="p-6 text-[11px] font-black text-slate-500 max-w-[250px] truncate italic">{log.mentor_notes || '—'}</td>
                                        <td className="p-6 text-right">
                                            <button
                                                onClick={() => {
                                                    const stu = students.find(s => s.id === log.student_id);
                                                    setSelectedStudent(stu || { id: log.student_id, name: log.student_name });
                                                    setTimeout(() => {
                                                        setViewLog(log);
                                                        setSubmitted(true);
                                                    }, 100);
                                                }}
                                                className="w-12 h-12 rounded-[18px] bg-slate-50 flex items-center justify-center text-slate-400 hover:text-[#14B8A6] hover:bg-[#14B8A6]/10 transition-all border border-transparent hover:border-[#14B8A6]/20 active:scale-90"
                                            >
                                                <Target size={20} strokeWidth={2.5} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {allLogs.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-sm font-bold text-slate-400">No interaction logs found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-10 p-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button
                onClick={() => { setSelectedStudent(null); setSubmitted(false); }}
                className="flex items-center gap-2 text-slate-400 hover:text-[#008080] font-black text-[10px] uppercase tracking-widest transition-colors mb-4"
            >
                <ArrowLeft size={16} /> Select Different Student
            </button>

            <header className="bg-slate-900 border border-slate-800 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#008080] rounded-full -mr-40 -mt-40 opacity-10"></div>
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 bg-[#008080] rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-[#008080]/30/50">
                        <MessageSquare size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Log Interaction</h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Student: {selectedStudent.name} | Date: {formData.date}</p>
                    </div>
                </div>
            </header>

            {!submitted ? (
                isMentorshipStudent(selectedStudent) ? (
                    <MentorshipQuestionsForm 
                        selectedStudent={selectedStudent} 
                        setSubmitted={setSubmitted} 
                        fetchStudentLogs={fetchStudentLogs} 
                    />
                ) : (
                <form onSubmit={handleSubmit} className="bg-white p-6 md:p-12 rounded-[3.5rem] shadow-xl shadow-slate-100 border border-slate-50 space-y-12">

                    {/* Section 1: Session Information */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] border-l-4 border-[#008080] pl-4 flex items-center gap-2">
                            <Clock size={16} className="text-[#008080]" /> Section 1: Session Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-[#008080] outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Connection Method</label>
                                <select name="connection_method" value={formData.connection_method} onChange={handleChange} className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-[#008080] outline-none">
                                    {['Call', 'WhatsApp Chat', 'Zoom', 'Direct', 'Other'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Learning Evaluation */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] border-l-4 border-emerald-600 pl-4 flex items-center gap-2">
                            <Brain size={16} className="text-emerald-600" /> Section 2: Learning Evaluation
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Self Clarity (0-100)</label>
                                <input type="number" min="0" max="100" name="self_clarity" value={formData.self_clarity} onChange={handleChange} placeholder="e.g. 85" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Can Solve Independently?</label>
                                <select name="can_solve_independently" value={formData.can_solve_independently} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none">
                                    {['Yes', 'Partially', 'No'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confusing Topic</label>
                                <input type="text" name="confusing_topic" value={formData.confusing_topic} onChange={handleChange} placeholder="Any specific topic?" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Homework & Revision */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] border-l-4 border-amber-500 pl-4 flex items-center gap-2">
                            <BookOpen size={16} className="text-amber-500" /> Section 3: Homework & Revision
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Homework Status</label>
                                <select name="homework_status" value={formData.homework_status} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none">
                                    {['Done', 'Partial', 'Not Done'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Difficulty</label>
                                <select name="homework_difficulty" value={formData.homework_difficulty} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none">
                                    {['Easy', 'Medium', 'Hard'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Revision Quality</label>
                                <select name="revision_quality" value={formData.revision_quality} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none">
                                    {['Good', 'Rushed', 'Not Done'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Emotional & Performance */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] border-l-4 border-rose-500 pl-4 flex items-center gap-2">
                            <HeartPulse size={16} className="text-rose-500" /> Section 4: Emotional & Performance
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confidence (1-5)</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map(num => (
                                        <button
                                            key={num}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, confidence: num })}
                                            className={`flex-1 p-3 rounded-xl font-black text-sm transition-all ${formData.confidence === num ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Focus Level</label>
                                <select name="focus_level" value={formData.focus_level} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none">
                                    {['Good', 'Average', 'Poor'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Motivation</label>
                                <select name="motivation_level" value={formData.motivation_level} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none">
                                    {['High', 'Medium', 'Low'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Exam Anxiety?</label>
                                <select name="exam_anxiety" value={formData.exam_anxiety} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none">
                                    {['No', 'Yes'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 5: Requests & Actions */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] border-l-4 border-purple-500 pl-4 flex items-center gap-2">
                            <Activity size={16} className="text-purple-500" /> Section 5: Requests & Actions
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Student Requests</label>
                                <textarea name="student_requests" rows="2" value={formData.student_requests} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none"></textarea>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Parent Update Priority</label>
                                <select name="parent_update_priority" value={formData.parent_update_priority} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none">
                                    {['Low', 'Medium', 'High'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mentor Action Needed?</label>
                                <select name="mentor_action_needed" value={formData.mentor_action_needed} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none">
                                    {['Yes', 'No'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mentor Notes</label>
                                <textarea name="mentor_notes" rows="4" value={formData.mentor_notes} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none"></textarea>
                            </div>

                            <div className="md:col-span-2 pt-4 flex items-center gap-4">
                                <input
                                    type="checkbox"
                                    id="connected_today"
                                    name="connected_today"
                                    checked={formData.connected_today}
                                    onChange={handleCheckboxChange}
                                    className="w-6 h-6 rounded-lg text-[#008080] border-slate-300 focus:ring-[#008080]"
                                />
                                <label htmlFor="connected_today" className="text-sm font-black text-slate-900 uppercase tracking-widest cursor-pointer">
                                    [✓] Connected Today
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Section 6: Attachments */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] border-l-4 border-[#008080] pl-4 flex items-center gap-2">
                            <Camera size={16} className="text-[#008080]" /> Section 6: Attachments
                        </h3>

                        <div className="space-y-4 bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Upload size={14} className="text-[#008080]" /> Interaction Proof (Image/PDF)
                            </label>

                            <div className="flex flex-col md:flex-row items-center gap-6">
                                <div className="relative group w-full md:w-auto">
                                    <input
                                        type="file"
                                        id="proof-upload"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                        accept=".jpg,.jpeg,.png,.pdf"
                                    />
                                    <label
                                        htmlFor="proof-upload"
                                        className={`flex items-center justify-center gap-3 px-8 py-4 bg-white border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-[#008080] hover:bg-[#008080]/10/50 transition-all group ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                                    >
                                        {uploading ? (
                                            <Loader2 className="animate-spin text-[#008080]" size={20} />
                                        ) : (
                                            <ImageIcon className="text-slate-400 group-hover:text-[#008080]" size={20} />
                                        )}
                                        <span className="text-xs font-black text-slate-600 uppercase tracking-widest">
                                            {uploading ? 'Uploading...' : 'Choose File'}
                                        </span>
                                    </label>
                                </div>

                                {formData.screenshot_url && (
                                    <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border border-slate-200 animate-in zoom-in duration-300">
                                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                                            <CheckCircle size={18} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">File Attached</span>
                                            <a href={formData.screenshot_url} target="_blank" rel="noreferrer" className="text-xs font-bold text-[#008080] hover:underline truncate max-w-[150px]">View Document</a>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, screenshot_url: '' })}
                                            className="text-slate-300 hover:text-rose-500 transition-colors"
                                        >
                                            <MoreHorizontal size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <p className="text-[9px] font-bold text-slate-400 italic">Max size: 5MB. Supports JPG, PNG, PDF</p>
                        </div>
                    </div>

                    <div className="pt-8">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#008080] text-white p-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-[#008080]/30/50 hover:bg-[#008080] hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-4 italic active:scale-[0.98]"
                        >
                            {loading ? 'Submitting...' : 'Submit Log'}
                            {!loading && <CheckCircle size={20} />}
                        </button>
                    </div>

                </form>
                )
            ) : (
                <div className="space-y-8 animate-in fade-in zoom-in duration-300">
                    <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[3rem] text-center">
                        <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200">
                            <CheckCircle size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-emerald-900 mb-2">Log Submitted!</h2>
                        <button
                            onClick={() => setSubmitted(false)}
                            className="text-xs font-bold text-emerald-600 hover:text-emerald-800 underline uppercase tracking-widest"
                        >
                            Add Another Log
                        </button>
                    </div>

                    {/* Compact Table View */}
                    <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-50">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 ml-2">Recent Logs for {selectedStudent.name}</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sess #</th>
                                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Method</th>
                                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Clarity</th>
                                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Show More</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.slice(0, 5).map(log => (
                                        <tr
                                            key={log.id}
                                            onClick={() => setViewLog(log)}
                                            className="border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group"
                                        >
                                            <td className="p-4 text-xs font-bold text-slate-700">{new Date(log.date || log.session_date).toLocaleDateString()}</td>
                                            <td className="p-4 text-xs font-black text-slate-400">#{log.session_number || log.id}</td>
                                            <td className="p-4 text-xs font-bold text-slate-600">{log.connection_method || log.action_type}</td>
                                            <td className="p-4 text-xs font-bold text-[#008080]">{log.self_clarity ? `${log.self_clarity}%` : log.student_status}</td>
                                            <td className="p-4 text-xs font-bold text-slate-400 group-hover:text-[#008080] transition-colors">
                                                <MoreHorizontal size={16} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* View Log Modal */}
                    <Modal isOpen={!!viewLog} onClose={() => setViewLog(null)} title={viewLog?.main_issue ? `Mentorship Log #${viewLog?.id}` : `Interaction Log #${viewLog?.session_number}`} size="lg">
                        {viewLog && (
                            <div className="space-y-8 p-2">
                                {viewLog.main_issue ? (
                                    <>
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                            <DetailRow label="Date" value={new Date(viewLog.session_date).toLocaleDateString()} />
                                            <DetailRow label="Main Issue" value={viewLog.main_issue} />
                                            <DetailRow label="Student" value={selectedStudent.name} />
                                            <DetailRow label="Status" value={viewLog.student_status} highlight />
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.1em] border-l-4 border-[#008080] pl-3">Diagnosis & Behavior</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-3xl">
                                                <DetailRow label="Weak Subject" value={viewLog.weak_subject || 'None'} />
                                                <DetailRow label="Consistency (1-5)" value={viewLog.consistency_rating} />
                                                <DetailRow label="Focus (1-5)" value={viewLog.focus_rating} highlight />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.1em] border-l-4 border-amber-500 pl-3">Action & Follow-up</h4>
                                            <div className="bg-slate-50 p-6 rounded-3xl space-y-6">
                                                <DetailRow label="Homework" value={viewLog.homework_status} />
                                                <DetailRow label="Assigned Action" value={viewLog.action_type} />
                                                <DetailRow label="Action Details" value={viewLog.action_details || 'None'} />
                                                <div className="grid grid-cols-2 gap-6">
                                                    <DetailRow label="Follow-up Required" value={viewLog.follow_up_required ? 'Yes' : 'No'} />
                                                    {viewLog.follow_up_required && <DetailRow label="Date & Priority" value={`${new Date(viewLog.follow_up_date).toLocaleDateString()} (${viewLog.priority})`} />}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                            <DetailRow label="Date" value={new Date(viewLog.date).toLocaleDateString()} />
                                            <DetailRow label="Method" value={viewLog.connection_method} />
                                            <DetailRow label="Student" value={selectedStudent.name} />
                                            <DetailRow label="Status" value="Completed" highlight />
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.1em] border-l-4 border-[#008080] pl-3">Learning & Comprehension</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-3xl">
                                                <DetailRow label="Self Clarity" value={`${viewLog.self_clarity}%`} highlight />
                                                <DetailRow label="Can Solve Independently?" value={viewLog.can_solve_independently} />
                                                <DetailRow label="Confusing Topic" value={viewLog.confusing_topic || 'None'} />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.1em] border-l-4 border-amber-500 pl-3">Homework & Revision</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-3xl">
                                                <DetailRow label="Homework Status" value={viewLog.homework_status} />
                                                <DetailRow label="Difficulty" value={viewLog.homework_difficulty} />
                                                <DetailRow label="Revision Quality" value={viewLog.revision_quality} />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.1em] border-l-4 border-purple-500 pl-3">Performance & Emotion</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-3xl">
                                                <DetailRow label="Confidence" value={`${viewLog.confidence}/5`} />
                                                <DetailRow label="Motivation" value={viewLog.motivation_level} />
                                                <DetailRow label="Anxiety" value={viewLog.exam_anxiety} />
                                                <DetailRow label="Focus Level" value={viewLog.focus_level} />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.1em] border-l-4 border-rose-500 pl-3">Requests & Actions</h4>
                                            <div className="bg-slate-50 p-6 rounded-3xl space-y-6">
                                                <DetailRow label="Student Requests" value={viewLog.student_requests || 'None'} />
                                                <DetailRow label="Mentor Notes" value={viewLog.mentor_notes || 'None'} />
                                                <div className="grid grid-cols-2 gap-6">
                                                    <DetailRow label="Parent Priority" value={viewLog.parent_update_priority} />
                                                    <DetailRow label="Action Needed" value={viewLog.mentor_action_needed} />
                                                </div>
                                                {viewLog.screenshot_url && (
                                                    <div className="pt-4 border-t border-slate-200">
                                                        <DetailRow
                                                            label="Interaction Proof"
                                                            value={
                                                                <a href={viewLog.screenshot_url} target="_blank" rel="noreferrer" className="text-[#008080] hover:underline flex items-center gap-2">
                                                                    <ImageIcon size={14} /> View Document
                                                                </a>
                                                            }
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </Modal>
                </div>
            )}
        </div>
    );
};

export default StudentInteractionLog;
