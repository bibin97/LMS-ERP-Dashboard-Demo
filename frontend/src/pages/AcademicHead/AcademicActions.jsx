import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    AlertCircle, CheckCircle2, Clock, Calendar,
    User, BookOpen, ChevronRight, Activity,
    ShieldAlert, GraduationCap, ArrowRight, Filter,
    FileText, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';

const AcademicActions = () => {
    const [milestones, setMilestones] = useState([]);
    const [dailyLogs, setDailyLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMilestone, setSelectedMilestone] = useState(null);
    const [isExamModalOpen, setIsExamModalOpen] = useState(false);
    const [planData, setPlanData] = useState({
        chapter: '',
        portions: '',
        exam_type: 'MCQ',
        scheduled_date: ''
    });

    useEffect(() => {
        fetchActions();
    }, []);

    const fetchActions = async () => {
        try {
            const res = await api.get('/academic-head/actions');
            setMilestones(res.data.data.milestones);
            setDailyLogs(res.data.data.dailyLogs);
        } catch (error) {
            toast.error("Failed to load actions dashboard");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenExamModal = (milestone) => {
        setSelectedMilestone(milestone);
        setPlanData({
            chapter: milestone.chapter || '',
            portions: milestone.portions || '',
            exam_type: milestone.exam_type || 'MCQ',
            scheduled_date: milestone.scheduled_date ? new Date(milestone.scheduled_date).toISOString().split('T')[0] : ''
        });
        setIsExamModalOpen(true);
    };

    const handleSaveExamPlan = async (e) => {
        e.preventDefault();
        try {
            await api.post('/academic-head/exams/plan', {
                student_id: selectedMilestone.student_id,
                milestone_session: selectedMilestone.milestone,
                chapter: planData.chapter,
                portions: planData.portions,
                exam_type: planData.exam_type,
                scheduled_date: planData.scheduled_date
            });
            toast.success("Exam plan saved successfully");
            setIsExamModalOpen(false);
            fetchActions();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save exam plan");
        }
    };

    return (
        <div className="space-y-10 pb-20 max-w-[1600px] mx-auto animate-in fade-in duration-700">
            {/* Action Center Header */}
            <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50 rounded-full -mr-32 -mt-32 opacity-40"></div>
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 bg-rose-500 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-rose-100 -rotate-6 group hover:rotate-0 transition-all duration-500">
                        <Activity size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Action Center</h1>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                            <ShieldAlert size={12} className="text-rose-500" />
                            Monitor critical exam milestones and audit daily faculty session intake
                        </p>
                    </div>
                </div>

                <div className="relative z-10 flex items-center gap-4">
                    <div className="bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Pending Exam Alerts</span>
                        <span className="text-xl font-black text-rose-500 italic">{milestones.length}</span>
                    </div>
                    <div className="bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Today's Intake</span>
                        <span className="text-xl font-black text-[#008080] italic">{dailyLogs.length}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                {/* Milestone Alerts Section */}
                <div className="xl:col-span-1 space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-2">
                            <GraduationCap size={16} className="text-rose-500" /> Exam Milestones
                        </h3>
                        {milestones.length > 0 && (
                            <span className="bg-rose-100 text-rose-600 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Plan Required</span>
                        )}
                    </div>

                    {loading ? (
                        <div className="bg-white p-12 rounded-[3rem] border border-slate-100 flex items-center justify-center">
                            <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : milestones.length === 0 ? (
                        <div className="bg-white p-12 rounded-[3rem] border border-slate-100 text-center">
                            <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-4" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">All Milestones Clear</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {milestones.map((milestone, idx) => (
                                <div key={idx} 
                                    onClick={() => handleOpenExamModal(milestone)}
                                    className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-rose-200 transition-all group overflow-hidden relative cursor-pointer"
                                >
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-rose-50 rounded-full -mr-8 -mt-8 opacity-40"></div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="text-lg font-black text-slate-900 italic uppercase leading-none">{milestone.student_name}</h4>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Session Milestone: {milestone.milestone}</p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${milestone.portions ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                                            {milestone.portions ? 'Planned' : 'Set Portions'}
                                        </div>
                                    </div>

                                    {milestone.chapter && (
                                        <div className="mt-2 text-[10px] text-slate-900 font-black border-l-2 border-rose-500 pl-3 uppercase italic">
                                            Chapter: {milestone.chapter}
                                        </div>
                                    )}

                                    {milestone.portions && (
                                        <div className="mt-2 text-[10px] text-slate-500 font-bold border-l-2 border-slate-200 pl-3">
                                            Portions: {milestone.portions}
                                        </div>
                                    )}

                                    {milestone.exam_type && (
                                        <div className="mt-3 flex items-center gap-2">
                                            <span className="text-[8px] font-black px-2 py-0.5 bg-slate-900 text-white rounded-md uppercase tracking-tighter">
                                                {milestone.exam_type}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-50">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-[#008080]">
                                                <User size={14} />
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Mentor</p>
                                                <p className="text-[10px] font-bold text-slate-700 line-clamp-1">{milestone.mentor_name}</p>
                                            </div>
                                        </div>
                                        <div className="w-9 h-9 bg-slate-900 text-white rounded-xl flex items-center justify-center group-hover:bg-rose-500 transition-colors">
                                            <FileText size={16} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Daily Activity Section */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-2">
                            <BookOpen size={16} className="text-[#008080]" /> Today's Registry Update
                        </h3>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <Clock size={10} /> Live Stream
                        </span>
                    </div>

                    {loading ? (
                        <div className="bg-white p-20 rounded-[4rem] border border-slate-100 flex items-center justify-center flex-col gap-4">
                            <div className="w-12 h-12 border-4 border-[#008080] border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synchronizing Intra-Day Logs...</p>
                        </div>
                    ) : dailyLogs.length === 0 ? (
                        <div className="bg-white p-20 rounded-[4rem] border-2 border-dashed border-slate-100 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mx-auto mb-6">
                                <Activity size={40} />
                            </div>
                            <h4 className="text-xl font-black text-slate-900 italic uppercase">Registry Empty</h4>
                            <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-[0.2em]">No faculty submissions recorded today yet.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Faculty Unit</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Target Chapter</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Session Frame</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Status</th>
                                        <th className="px-8 py-6 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {dailyLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-[#008080]">
                                                        <User size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-slate-900 uppercase italic tracking-tighter">{log.faculty_name}</p>
                                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Faculty ID: {log.faculty_id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="bg-[#008080]/10 px-4 py-2 rounded-xl inline-block border border-[#008080]">
                                                    <span className="text-xs font-black text-[#008080] uppercase italic tracking-tighter line-clamp-1">{log.chapter}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <Clock size={12} />
                                                    <span className="text-[10px] font-bold italic">{log.start_time} - {log.end_time}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${log.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                    {log.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-[#008080] transition-all opacity-0 group-hover:opacity-100">
                                                    <ChevronRight size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Exam Planning Modal */}
            <Modal
                isOpen={isExamModalOpen}
                onClose={() => setIsExamModalOpen(false)}
                title="Schedule student Assessment"
                size="md"
            >
                <div className="p-2">
                    {selectedMilestone && (
                        <div className="mb-6 p-4 bg-slate-50 rounded-3xl border border-slate-100">
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight italic">
                                Setting exam plan for {selectedMilestone.student_name}
                            </h4>
                            <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">
                                Target Milestone: Session {selectedMilestone.milestone}
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleSaveExamPlan} className="space-y-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Chapter</label>
                            <input
                                type="text"
                                required
                                className="p-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm outline-none focus:bg-white focus:ring-4 focus:ring-rose-50 focus:border-rose-300 transition-all font-bold text-slate-700"
                                placeholder="E.g. Polynomials, Optics..."
                                value={planData.chapter}
                                onChange={(e) => setPlanData({ ...planData, chapter: e.target.value })}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Exam Portions / Details</label>
                            <textarea
                                rows="3"
                                required
                                className="p-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm outline-none focus:bg-white focus:ring-4 focus:ring-rose-50 focus:border-rose-300 transition-all font-bold text-slate-700 resize-none"
                                placeholder="Specify topics or pages to be covered..."
                                value={planData.portions}
                                onChange={(e) => setPlanData({ ...planData, portions: e.target.value })}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Exam Type</label>
                            <select
                                required
                                className="p-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm outline-none focus:bg-white focus:ring-4 focus:ring-rose-50 focus:border-rose-300 transition-all font-bold text-slate-700 cursor-pointer"
                                value={planData.exam_type}
                                onChange={(e) => setPlanData({ ...planData, exam_type: e.target.value })}
                            >
                                <option value="MCQ">MCQ (Multiple Choice Questions)</option>
                                <option value="Descriptive">Descriptive Test</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Scheduled Date</label>
                            <input
                                type="date"
                                required
                                className="p-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm outline-none focus:bg-white focus:ring-4 focus:ring-rose-50 focus:border-rose-300 transition-all font-bold text-slate-700"
                                value={planData.scheduled_date}
                                onChange={(e) => setPlanData({ ...planData, scheduled_date: e.target.value })}
                            />
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setIsExamModalOpen(false)}
                                className="flex-1 bg-slate-100 text-slate-600 p-4 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 bg-slate-900 text-white p-4 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 transition-all shadow-xl shadow-rose-100 flex items-center justify-center gap-2 group"
                            >
                                <span>Save Plan</span>
                                <GraduationCap size={18} />
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
};

export default AcademicActions;
