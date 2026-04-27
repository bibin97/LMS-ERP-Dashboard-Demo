import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, CheckCircle2, ShieldAlert, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

const StudentCheckTracker = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('least_checked');

    useEffect(() => {
        fetchStudentChecks();
    }, []);

    const fetchStudentChecks = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/mentor-head/daily-student-checks', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setStudents(res.data.data);
            }
        } catch (error) {
            toast.error("Failed to load student checks");
        } finally {
            setLoading(false);
        }
    };

    const handleAddCheck = async (studentId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`/api/mentor-head/students/${studentId}/check`,
                {},
                { headers: { Authorization: `Bearer ${token}` } });

            setStudents(prev => prev.map(s => {
                if (s.student_id === studentId) {
                    return {
                        ...s,
                        total_check_count: s.total_check_count + 1
                    };
                }
                return s;
            }));
            toast.success('Marked student as checked');
        } catch (error) {
            toast.error("Failed to add check");
        }
    };

    const handleRemoveCheck = async (studentId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/mentor-head/students/${studentId}/uncheck`,
                { headers: { Authorization: `Bearer ${token}` } });

            setStudents(prev => prev.map(s => {
                if (s.student_id === studentId && s.total_check_count > 0) {
                    return {
                        ...s,
                        total_check_count: s.total_check_count - 1
                    };
                }
                return s;
            }));
            toast.success('Check removed');
        } catch (error) {
            toast.error("Failed to remove check");
        }
    };

    const getSortedStudents = () => {
        return [...students].sort((a, b) => {
            const countA = a.total_check_count || 0;
            const countB = b.total_check_count || 0;
            if (sortBy === 'least_checked') return countA - countB;
            if (sortBy === 'most_checked') return countB - countA;
            if (sortBy === 'name') return (a.student_name || '').localeCompare(b.student_name || '');
            return 0;
        });
    };

    if (loading) return <div className="p-8 text-center text-slate-400 font-bold">Loading tracker...</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Page Title */}
            <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-sm mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#008080] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#008080]/30 rotate-3">
                            <Target size={28} />
                        </div>
                        Verification Registry
                    </h2>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-3 flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-500" />
                        Internal audit of daily mentor-student interaction verification and accountability tracking
                    </p>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100 shrink-0">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Sort By:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-white border-none rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-[#008080]/20 shadow-sm"
                    >
                        <option value="least_checked">Least Checked First</option>
                        <option value="most_checked">Most Checked First</option>
                        <option value="name">Student Name (A-Z)</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Name</th>
                                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Mentor</th>
                                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Interaction Date</th>
                                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Interaction Count</th>
                                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Check Count</th>
                                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getSortedStudents().map(student => {
                                const checkCount = student.total_check_count || 0;

                                let rowClass = "border-b border-slate-50 transition-colors group bg-white hover:bg-slate-50/50";
                                let badge = null;

                                if (checkCount === 1) {
                                    rowClass = "border-b border-emerald-100 transition-colors group bg-emerald-50 hover:bg-emerald-100/50 text-emerald-900";
                                } else if (checkCount >= 2) {
                                    rowClass = "border-b border-rose-100 transition-colors group bg-rose-50 hover:bg-rose-100/50 text-rose-900";
                                    badge = (
                                        <span className="inline-flex items-center justify-center w-6 h-6 ml-2 rounded-full bg-rose-500 text-white text-[10px] font-black shadow-sm">
                                            {checkCount}
                                        </span>
                                    );
                                }

                                return (
                                    <tr key={student.student_id} className={rowClass}>
                                        <td className="p-4 text-sm font-bold flex items-center gap-2">
                                            {student.student_name}
                                            {student.onboarding_status === 'pending' && (
                                                <span className="px-2 py-0.5 bg-rose-50 rounded-md text-[8px] font-black text-rose-600 shadow-sm border border-rose-100 uppercase tracking-widest">
                                                    New
                                                </span>
                                            )}
                                            {badge}
                                        </td>
                                        <td className="p-4 text-xs font-bold">
                                            {student.mentor_name || 'Unassigned'}
                                        </td>
                                        <td className="p-4 text-xs font-bold opacity-80">
                                            {student.last_interaction_date ? new Date(student.last_interaction_date).toLocaleDateString() : 'Never'}
                                        </td>
                                        <td className="p-4 text-sm font-black opacity-80">
                                            {student.total_interaction_count || 0}
                                        </td>
                                        <td className="p-4 text-sm font-black opacity-80">
                                            {checkCount}
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleAddCheck(student.student_id)}
                                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black transition-all bg-white border border-slate-200 text-slate-600 shadow-sm hover:scale-105 active:scale-95 uppercase tracking-widest"
                                                >
                                                    <CheckCircle2 size={14} className={checkCount > 0 ? 'text-emerald-500' : 'text-slate-400'} />
                                                    Checked
                                                </button>
                                                {checkCount > 0 && (
                                                    <button
                                                        onClick={() => handleRemoveCheck(student.student_id)}
                                                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black transition-all bg-white border border-slate-200 text-slate-600 shadow-sm hover:scale-105 active:scale-95 uppercase tracking-widest text-rose-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50"
                                                        title="Undo Check"
                                                    >
                                                        <RotateCcw size={14} />
                                                        Undo
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StudentCheckTracker;
