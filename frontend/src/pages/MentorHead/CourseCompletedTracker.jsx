import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GraduationCap, CheckCircle2, RotateCcw, Search, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

const CourseCompletedTracker = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/mentor-head/students-all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setStudents(res.data.data);
            }
        } catch (error) {
            toast.error("Failed to load students list");
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (studentId, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            const newStatus = !currentStatus;

            await axios.put(`/api/mentor-head/students/${studentId}/course-complete`,
                { isCompleted: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setStudents(prev => prev.map(s => {
                if (s.id === studentId) {
                    return { ...s, course_completed: newStatus ? 1 : 0 };
                }
                return s;
            }));

            toast.success(newStatus ? 'Marked as Course Completed' : 'Unmarked Course Completed');
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.course?.toLowerCase().includes(searchTerm.toLowerCase());

        if (filter === 'completed') return matchesSearch && student.course_completed === 1;
        if (filter === 'pending') return matchesSearch && student.course_completed !== 1;
        return matchesSearch;
    });

    if (loading) return <div className="p-8 text-center text-slate-400 font-bold">Loading records...</div>;

    const completedCount = students.filter(s => s.course_completed === 1).length;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Page Title & Stats */}
            <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-sm mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 rotate-3">
                            <GraduationCap size={28} />
                        </div>
                        Course Completions
                    </h2>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-3 flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-500" />
                        Manage and track students who have successfully completed their courses
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="bg-slate-50 px-6 py-4 rounded-3xl border border-slate-100 text-center">
                        <p className="text-3xl font-black text-slate-900">{students.length}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Total</p>
                    </div>
                    <div className="bg-emerald-50 px-6 py-4 rounded-3xl border border-emerald-100 text-center">
                        <p className="text-3xl font-black text-emerald-600">{completedCount}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mt-1">Completed</p>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search student or course..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-[#008080] focus:ring-4 focus:ring-[#008080]/10 transition-all placeholder:text-slate-400 placeholder:font-medium"
                    />
                </div>
                <div className="flex gap-2">
                    {['all', 'completed', 'pending'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${filter === f
                                    ? 'bg-[#008080] text-white shadow-lg shadow-[#008080]/30 -translate-y-0.5'
                                    : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            {f.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                                <th className="p-4 rounded-tl-xl text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Course & Grade</th>
                                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned To</th>
                                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="p-4 rounded-tr-xl text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.length > 0 ? filteredStudents.map(student => {
                                const isCompleted = student.course_completed === 1;

                                return (
                                    <tr key={student.id} className="border-b border-slate-50 transition-colors group hover:bg-slate-50/50">
                                        <td className="p-4">
                                            <p className="text-sm font-bold text-slate-900">{student.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">ID: {student.id}</p>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-xs font-bold text-slate-700">{student.course || 'N/A'}</p>
                                            <p className="text-[10px] font-black text-[#008080] uppercase tracking-widest mt-0.5">{student.grade || 'N/A'}</p>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-xs font-bold text-slate-700 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#008080]"></span> {student.mentor_name || 'Unassigned Mentor'}</p>
                                            <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1 mt-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> {student.faculty_name || 'Unassigned Faculty'}</p>
                                        </td>
                                        <td className="p-4">
                                            {isCompleted ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                                    <CheckCircle2 size={12} />
                                                    Completed
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest border border-slate-200">
                                                    <RotateCcw size={12} />
                                                    Ongoing
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => toggleStatus(student.id, isCompleted)}
                                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black transition-all shadow-sm hover:scale-105 active:scale-95 uppercase tracking-widest ${isCompleted
                                                        ? 'bg-white border border-rose-200 text-rose-500 hover:bg-rose-50'
                                                        : 'bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-100 hover:border-emerald-300'
                                                    }`}
                                            >
                                                {isCompleted ? (
                                                    <>
                                                        <RotateCcw size={14} />
                                                        Undo Completion
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle2 size={14} />
                                                        Mark Completed
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-400 font-bold">
                                        No students found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CourseCompletedTracker;
