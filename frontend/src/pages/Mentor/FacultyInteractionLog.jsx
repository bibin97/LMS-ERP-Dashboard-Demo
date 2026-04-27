import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
    Layers, Plus, Edit2, Trash2, Camera,
    Filter, Download, ChevronRight, X,
    CheckCircle2, AlertTriangle, MessageSquare,
    Search, Calendar, BookOpen, User,
    TrendingUp, ShieldAlert, AlertCircle, Loader2,
    Upload, FileText, Image as ImageIcon, Link as LinkIcon, Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import { premiumConfirm } from '../../utils/premiumConfirm';

const FacultyInteractionLog = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isNewEntryPage = location.pathname.endsWith('/faculty-log/new');
    const [logs, setLogs] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewingLog, setViewingLog] = useState(null);
    const [editingLogId, setEditingLogId] = useState(null);
    const [formData, setFormData] = useState({
        student_id: '',
        date: new Date().toISOString().split('T')[0],
        session_number: '',
        chapter: '',
        session_type: 'Regular Class',
        topics_covered: '',
        student_performance: '3',
        engagement_level: 'Medium',
        homework_given: '',
        homework_status: 'Not Done',
        issues_reported: '',
        risk_level: 'Low',
        remedial_plan: '',
        parent_update_needed: 'No',
        faculty_intervention_required: 'No',
        notes: '',
        screenshot_url: '',
        test_score: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        setIsModalOpen(isNewEntryPage);
    }, [isNewEntryPage]);

    const fetchData = async () => {
        try {
            const [logsRes, studentsRes] = await Promise.all([
                api.get('/mentor/faculty-logs'),
                api.get('/mentor/students')
            ]);
            setLogs(logsRes.data.data || []);
            setStudents(studentsRes.data.data || []);
        } catch (error) {
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file size (5MB limit)
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

    const handleOpenModal = (log = null) => {
        if (!log) {
            navigate('/mentor/faculty-log/new');
            return;
        }

        if (log) {
            setEditingLogId(log.id);
            setFormData({
                student_id: log.student_id,
                date: new Date(log.date).toISOString().split('T')[0],
                session_number: log.session_number || '',
                chapter: log.chapter || '',
                session_type: log.session_type || 'Regular Class',
                topics_covered: log.topics_covered || '',
                student_performance: (log.student_performance || '3').toString(),
                engagement_level: log.engagement_level || 'Medium',
                homework_given: log.homework_given || '',
                homework_status: log.homework_status || 'Not Done',
                issues_reported: log.issues_reported || '',
                risk_level: log.risk_level || 'Low',
                remedial_plan: log.remedial_plan || '',
                parent_update_needed: log.parent_update_needed || 'No',
                faculty_intervention_required: log.faculty_intervention_required || 'No',
                notes: log.notes || '',
                screenshot_url: log.screenshot_url || '',
                test_score: log.test_score || ''
            });
        } else {
            setEditingLogId(null);
            setFormData({
                student_id: '',
                date: new Date().toISOString().split('T')[0],
                session_number: '',
                chapter: '',
                session_type: 'Regular Class',
                topics_covered: '',
                student_performance: '3',
                engagement_level: 'Medium',
                homework_given: '',
                homework_status: 'Not Done',
                issues_reported: '',
                risk_level: 'Low',
                remedial_plan: '',
                parent_update_needed: 'No',
                faculty_intervention_required: 'No',
                notes: '',
                screenshot_url: '',
                test_score: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseEntryForm = () => {
        if (isNewEntryPage) {
            navigate('/mentor/faculty-log');
            return;
        }
        setIsModalOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingLogId) {
                await api.put(`/mentor/faculty-log/${editingLogId}`, formData);
                toast.success("Log updated successfully");
            } else {
                await api.post('/mentor/faculty-log', formData);
                toast.success("Faculty log added successfully");
            }
            if (isNewEntryPage) navigate('/mentor/faculty-log');
            else setIsModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Operation failed");
        }
    };

    const handleDelete = async (logParam) => {
        const id = typeof logParam === 'object' ? logParam.id : logParam;
        const name = typeof logParam === 'object' ? logParam.student_name : 'this student';
        
        premiumConfirm(async () => {
            try {
                await api.delete(`/mentor/faculty-log/${id}`);
                toast.success("Log deleted successfully");
                fetchData();
            } catch (error) {
                toast.error("Failed to delete log");
            }
        }, {
            name: `${name}'s Log`,
            title: 'Delete Faculty Interaction Log',
            message: `Are you sure you want to permanently delete this interaction log?`,
            type: 'danger'
        });
    };

    const filteredLogs = logs.filter(log =>
    (log.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.chapter?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const stats = {
        total: logs.length,
        highRisk: logs.filter(l => l.risk_level === 'High').length,
        parentUpdate: logs.filter(l => l.parent_update_needed === 'Yes').length
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Loader2 className="animate-spin text-[#008080]" size={40} />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading Intelligence...</p>
        </div>
    );

    const getFileIcon = (url) => {
        if (!url) return <Camera size={14} />;
        const ext = url.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return <ImageIcon size={14} />;
        if (['pdf', 'doc', 'docx'].includes(ext)) return <FileText size={14} />;
        return <LinkIcon size={14} />;
    };

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
                <div className="text-center md:text-left">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Faculty Interaction Log</h1>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2 flex items-center gap-2 justify-center md:justify-start">
                        <Layers size={14} className="text-[#008080]" />
                        Audit of daily faculty reporting and session registry
                    </p>
                </div>
                <div className="w-16 h-16 bg-[#008080] rounded-3xl flex items-center justify-center text-white shadow-xl shadow-[#008080]/30 rotate-6">
                    <BookOpen size={28} />
                </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="relative group flex-1 sm:flex-none">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#008080] transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Search logs..."
                        className="w-full sm:w-64 pl-12 pr-6 py-3 bg-white border border-slate-100 rounded-2xl text-xs font-bold uppercase tracking-widest focus:ring-4 ring-[#008080]/10 shadow-sm outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => navigate('/mentor/faculty-log/new')}
                    className="bg-[#008080] text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-[#008080]/30 hover:bg-[#008080] active:scale-95 transition-all flex items-center justify-center gap-2 group italic"
                >
                    <Plus size={16} className="group-hover:rotate-90 transition-transform" /> Add New Entry
                </button>
            </div>

            {isModalOpen && (
                <div className="bg-slate-50 rounded-[2rem] border border-slate-200 p-3 sm:p-4">
                    <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden mb-6">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#008080] rounded-full -mr-32 -mt-32 opacity-10"></div>
                        <button onClick={handleCloseEntryForm} className="absolute top-5 right-5 w-10 h-10 bg-white text-slate-500 rounded-full flex items-center justify-center hover:bg-slate-100 hover:text-slate-700 transition-all active:scale-90 z-10">
                            <X size={20} />
                        </button>
                        <div className="relative z-10 flex items-center gap-4">
                            <div className="w-14 h-14 bg-[#008080] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-[#008080]/30">
                                <BookOpen size={26} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white tracking-tight italic">
                                    {editingLogId ? 'Modify Faculty Session' : 'Log Faculty Session'}
                                </h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
                                    Date: {formData.date} | Student: {students.find(s => String(s.id) === String(formData.student_id))?.name || 'Not Selected'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden relative">
                {/* Mobile scroll indicator */}
                <div className="md:hidden flex items-center justify-center gap-2 p-3 bg-[#008080]/10/50 border-b border-slate-100 italic">
                    <Filter size={12} className="text-[#008080] animate-pulse" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Swipe left to view full table</span>
                    <ChevronRight size={12} className="text-[#008080] animate-bounce-x" />
                </div>
                <div className="overflow-x-auto scrollbar-hide md:scrollbar-default">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 font-black text-[10px] text-slate-400 uppercase tracking-widest italic text-center">
                                <th className="p-5 border-r border-slate-100 sticky left-0 bg-white z-20 text-left">Student Name</th>
                                <th className="p-5 border-r border-slate-100">Date</th>
                                <th className="p-5 border-r border-slate-100">SN #</th>
                                <th className="p-5 border-r border-slate-100">Chapter</th>
                                <th className="p-5 border-r border-slate-100">Performance (1-5)</th>
                                <th className="p-5 sticky right-0 bg-white z-20">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredLogs.map(log => (
                                <tr key={log.id} className="group hover:bg-[#008080]/10/30 transition-colors text-center">
                                    <td className="p-5 border-r border-slate-50 sticky left-0 bg-white group-hover:bg-[#008080]/10/30 transition-colors z-10 text-xs font-black text-slate-900 text-left">{log.student_name}</td>
                                    <td className="p-5 border-r border-slate-50 text-xs font-bold text-slate-500">{new Date(log.date).toLocaleDateString()}</td>
                                    <td className="p-5 border-r border-slate-50 text-xs font-black text-slate-400">#{log.session_number}</td>
                                    <td className="p-5 border-r border-slate-50 text-xs font-bold text-slate-700">{log.chapter}</td>
                                    <td className="p-5 border-r border-slate-50">
                                        <div className="flex gap-1 justify-center">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <div key={star} className={`w-2 h-2 rounded-full ${star <= (log.student_performance || 0) ? 'bg-amber-400' : 'bg-slate-100'}`}></div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-5 sticky right-0 bg-white group-hover:bg-[#008080]/10/30 transition-colors shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.05)]">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => setViewingLog(log)} className="p-2 text-slate-400 hover:bg-slate-50 hover:text-[#008080] rounded-lg transition-all active:scale-90"><Eye size={14} /></button>
                                            <button onClick={() => handleOpenModal(log)} className="p-2 text-[#008080] hover:bg-[#008080]/10 rounded-lg transition-colors"><Edit2 size={14} /></button>
                                            <button onClick={() => handleDelete(log)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all duration-500">
                    <div className="w-16 h-16 bg-[#008080]/10 rounded-2xl flex items-center justify-center text-[#008080] group-hover:scale-110 transition-transform">
                        <TrendingUp size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Sessions</p>
                        <h4 className="text-3xl font-black text-slate-900 tracking-tight">{stats.total}</h4>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all duration-500">
                    <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
                        <ShieldAlert size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">High Risk Sessions</p>
                        <h4 className="text-3xl font-black text-rose-600 tracking-tight">{stats.highRisk}</h4>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all duration-500">
                    <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                        <AlertCircle size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">P. Update Required</p>
                        <h4 className="text-3xl font-black text-amber-600 tracking-tight">{stats.parentUpdate}</h4>
                    </div>
                </div>
            </div>

            {
                isModalOpen && (
                    <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100 space-y-10">
                        <form onSubmit={handleSubmit} className="space-y-10">
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] border-l-4 border-[#008080] pl-4 flex items-center gap-2">
                                        <Calendar size={16} className="text-[#008080]" /> Section 1: Session Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start bg-slate-50/60 p-6 rounded-3xl border border-slate-100">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 min-h-[22px] flex items-center">Select Student *</label>
                                        <select
                                            name="student_id"
                                            required
                                            className="w-full h-14 px-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:bg-white focus:ring-4 ring-[#008080]/10 transition-all outline-none"
                                            value={formData.student_id}
                                            onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                                        >
                                            <option value="">Choose Student</option>
                                            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 min-h-[22px] flex items-center">Date *</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full h-14 px-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:bg-white focus:ring-4 ring-[#008080]/10 transition-all outline-none"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 min-h-[22px] flex items-center">Session Type</label>
                                        <select
                                            className="w-full h-14 px-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:bg-white focus:ring-4 ring-[#008080]/10 transition-all outline-none"
                                            value={formData.session_type}
                                            onChange={(e) => setFormData({ ...formData, session_type: e.target.value })}
                                        >
                                            {['Regular Class', 'Revision', 'Test Discussion', 'Doubt Clearing', 'PYQ Practice'].map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <p className="text-[9px] font-bold text-[#008080] normal-case italic -mt-4 ml-1">Date supports multiple classes/day</p>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] border-l-4 border-emerald-600 pl-4 flex items-center gap-2">
                                        <BookOpen size={16} className="text-emerald-600" /> Section 2: Chapter & Classroom Signals
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50/60 p-6 rounded-3xl border border-slate-100">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 min-h-[22px] flex items-center">Chapter Name *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Integration, Photosynthesis..."
                                            className="w-full h-14 px-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:bg-white focus:ring-4 ring-[#008080]/10 transition-all outline-none"
                                            value={formData.chapter}
                                            onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 min-h-[22px] flex items-center">Performance (1-5)</label>
                                            <select
                                                className="w-full h-14 px-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:bg-white focus:ring-4 ring-[#008080]/10 transition-all outline-none"
                                                value={formData.student_performance}
                                                onChange={(e) => setFormData({ ...formData, student_performance: e.target.value })}
                                            >
                                                <option value="1">1 - Poor</option>
                                                <option value="2">2 - Below Average</option>
                                                <option value="3">3 - Average</option>
                                                <option value="4">4 - Good</option>
                                                <option value="5">5 - Excellent</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 min-h-[22px] flex items-center">Engagement</label>
                                            <select
                                                className="w-full h-14 px-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:bg-white focus:ring-4 ring-[#008080]/10 transition-all outline-none"
                                                value={formData.engagement_level}
                                                onChange={(e) => setFormData({ ...formData, engagement_level: e.target.value })}
                                            >
                                                <option value="Low">Low</option>
                                                <option value="Medium">Medium</option>
                                                <option value="High">High</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] border-l-4 border-amber-500 pl-4 flex items-center gap-2">
                                        <MessageSquare size={16} className="text-amber-500" /> Section 3: Coverage Summary
                                    </h3>
                                    <div className="space-y-2 bg-slate-50/60 p-6 rounded-3xl border border-slate-100">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Topics Covered *</label>
                                        <textarea
                                            required
                                            rows="2"
                                            className="w-full p-6 bg-white border border-slate-100 rounded-[2rem] text-xs font-semibold focus:bg-white focus:ring-8 focus:ring-[#008080]/5 transition-all outline-none"
                                            value={formData.topics_covered}
                                            onChange={(e) => setFormData({ ...formData, topics_covered: e.target.value })}
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] border-l-4 border-rose-500 pl-4 flex items-center gap-2">
                                        <AlertTriangle size={16} className="text-rose-500" /> Section 4: Homework & Risk
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50/60 p-6 rounded-3xl border border-slate-100">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Homework Given</label>
                                        <input
                                            type="text"
                                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none"
                                            value={formData.homework_given}
                                            onChange={(e) => setFormData({ ...formData, homework_given: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Homework Status</label>
                                        <select
                                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none"
                                            value={formData.homework_status}
                                            onChange={(e) => setFormData({ ...formData, homework_status: e.target.value })}
                                        >
                                            <option value="Completed">Completed</option>
                                            <option value="Partially Completed">Partially Completed</option>
                                            <option value="Not Done">Not Done</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Test Score (Optional)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 18/20 or N/A"
                                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none"
                                            value={formData.test_score}
                                            onChange={(e) => setFormData({ ...formData, test_score: e.target.value })}
                                        />
                                    </div>
                                </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Risk Level</label>
                                        <select
                                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none"
                                            value={formData.risk_level}
                                            onChange={(e) => setFormData({ ...formData, risk_level: e.target.value })}
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Parent Update Required?</label>
                                        <select
                                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none"
                                            value={formData.parent_update_needed}
                                            onChange={(e) => setFormData({ ...formData, parent_update_needed: e.target.value })}
                                        >
                                            <option value="No">No</option>
                                            <option value="Yes">Yes</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-rose-500">Faculty Intervention?</label>
                                        <select
                                            className="w-full p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-bold outline-none text-rose-700"
                                            value={formData.faculty_intervention_required}
                                            onChange={(e) => setFormData({ ...formData, faculty_intervention_required: e.target.value })}
                                        >
                                            <option value="No">No</option>
                                            <option value="Yes">Yes</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Issues Reported</label>
                                        <textarea
                                            rows="2"
                                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none"
                                            value={formData.issues_reported}
                                            onChange={(e) => setFormData({ ...formData, issues_reported: e.target.value })}
                                        ></textarea>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Remedial Plan</label>
                                        <textarea
                                            rows="2"
                                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none"
                                            value={formData.remedial_plan}
                                            onChange={(e) => setFormData({ ...formData, remedial_plan: e.target.value })}
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mentor Notes</label>
                                    <textarea
                                        rows="2"
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none"
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    ></textarea>
                                </div>

                                <div className="space-y-4 bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <Upload size={14} className="text-[#008080]" /> Session Proof (Image/PDF/Docs)
                                    </label>

                                    <div className="flex flex-col md:flex-row items-center gap-6">
                                        <div className="relative group w-full md:w-auto">
                                            <input
                                                type="file"
                                                id="proof-upload"
                                                className="hidden"
                                                onChange={handleFileUpload}
                                                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
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
                                                    <CheckCircle2 size={18} />
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
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-400 italic">Max size: 5MB. Supports JPG, PNG, PDF, Word</p>
                                </div>

                                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="w-full sm:w-auto px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        className={`w-full sm:w-auto px-10 py-4 bg-[#008080] text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-[#008080]/30 hover:bg-[#008080] active:scale-95 transition-all flex items-center justify-center gap-2 italic ${uploading ? 'opacity-50' : ''}`}
                                    >
                                        {editingLogId ? 'Update Report' : 'Submit Log'} <ChevronRight size={16} />
                                    </button>
                                </div>
                        </form>
                    </div>
                )
            }

            {/* View Details Modal */}
            {
                viewingLog && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
                        <div className="bg-white rounded-t-[2.5rem] sm:rounded-[3rem] shadow-2xl w-full max-w-4xl h-[95vh] sm:h-auto sm:max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-8 duration-500">
                            <div className="sticky top-0 bg-white/80 backdrop-blur-xl px-6 sm:px-10 py-5 sm:py-6 border-b border-slate-100 flex justify-between items-center z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-[#008080]/10 rounded-2xl flex items-center justify-center text-[#008080]">
                                        <BookOpen size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight italic">Session Intelligence Report</h2>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{viewingLog.student_name} • Session #{viewingLog.session_number}</p>
                                    </div>
                                </div>
                                <button onClick={() => setViewingLog(null)} className="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-100 hover:text-slate-600 transition-all active:scale-90">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 sm:p-10 space-y-12">
                                {/* Key Stats Row */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Risk Status</p>
                                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${viewingLog.risk_level === 'High' ? 'bg-rose-100 text-rose-600' : viewingLog.risk_level === 'Medium' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                            {viewingLog.risk_level} Risk
                                        </span>
                                    </div>
                                    <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Performance</p>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <div key={star} className={`w-2 h-2 rounded-full ${star <= (viewingLog.student_performance || 0) ? 'bg-amber-400' : 'bg-slate-200'}`}></div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Engagement</p>
                                        <p className="text-xs font-black text-slate-900 italic uppercase">{viewingLog.engagement_level}</p>
                                    </div>
                                    <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</p>
                                        <p className="text-xs font-black text-slate-900 italic">{new Date(viewingLog.date).toLocaleDateString()}</p>
                                    </div>
                                    <div className="bg-[#008080]/10 p-5 rounded-3xl border border-[#008080]">
                                        <p className="text-[9px] font-black text-[#008080] uppercase tracking-widest mb-1">Test Score</p>
                                        <p className="text-xs font-black text-[#008080] italic">{viewingLog.test_score || 'N/A'}</p>
                                    </div>
                                </div>

                                {/* Main Content Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-[#008080]/10 rounded-2xl flex items-center justify-center text-[#008080] shrink-0">
                                                <BookOpen size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Chapter & Topics</p>
                                                <h4 className="text-sm font-black text-slate-900 italic mb-2">{viewingLog.chapter}</h4>
                                                <p className="text-xs text-slate-500 font-bold leading-relaxed">{viewingLog.topics_covered}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
                                                <CheckCircle2 size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Homework Assessment</p>
                                                <p className="text-xs font-black text-slate-900 italic mb-2">Status: {viewingLog.homework_status}</p>
                                                <p className="text-xs text-slate-500 font-bold leading-relaxed">{viewingLog.homework_given || 'No homework assigned'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 shrink-0">
                                                <AlertTriangle size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Issues & Roadblocks</p>
                                                <p className="text-xs text-slate-500 font-bold leading-relaxed italic">{viewingLog.issues_reported || 'No issues reported during session'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
                                                <ShieldAlert size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Strategy & Action Plan</p>
                                                <p className="text-xs text-slate-500 font-bold leading-relaxed italic">{viewingLog.remedial_plan || 'Standard path continuation'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Note & Critical Indicators */}
                                <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="text-center">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Parent Update</p>
                                            <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full ${viewingLog.parent_update_needed === 'Yes' ? 'bg-[#008080] text-white shadow-lg shadow-[#008080]/30' : 'bg-slate-200 text-slate-500'}`}>
                                                {viewingLog.parent_update_needed}
                                            </span>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fac Interv.</p>
                                            <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full ${viewingLog.faculty_intervention_required === 'Yes' ? 'bg-rose-600 text-white shadow-lg shadow-rose-200' : 'bg-slate-200 text-slate-500'}`}>
                                                {viewingLog.faculty_intervention_required}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex-1 max-w-md">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mentor Private Notes</p>
                                        <p className="text-xs text-slate-500 font-italic italic leading-relaxed">{viewingLog.notes || 'No private notes'}</p>
                                    </div>

                                    {viewingLog.screenshot_url && (
                                        <a
                                            href={viewingLog.screenshot_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-2 bg-white px-5 py-3 rounded-2xl border border-slate-200 text-[10px] font-black uppercase tracking-widest text-[#008080] hover:shadow-lg transition-all active:scale-95"
                                        >
                                            <ImageIcon size={14} /> View Proof
                                        </a>
                                    )}
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        onClick={() => {
                                            setViewingLog(null);
                                            handleOpenModal(viewingLog);
                                        }}
                                        className="flex items-center gap-2 bg-slate-900 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all italic"
                                    >
                                        <Edit2 size={14} /> Edit This Intelligence
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default FacultyInteractionLog;
