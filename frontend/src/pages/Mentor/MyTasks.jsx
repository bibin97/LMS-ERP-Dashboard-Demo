import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ListTodo, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const MyTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await api.get('/mentor/tasks');
            setTasks(res.data.data);
        } catch (error) {
            toast.error("Failed to load tasks");
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async (taskId) => {
        try {
            await api.put(`/mentor/tasks/${taskId}/complete`);
            toast.success("Task completed!");
            fetchTasks();
        } catch (error) {
            toast.error("Action failed");
        }
    };

    const getStatusStyles = (status, deadline) => {
        if (status === 'Completed') return { bg: 'bg-emerald-50/50', text: 'text-emerald-700', border: 'border-emerald-100', icon: <CheckCircle size={20} className="text-emerald-500" /> };

        const isOverdue = new Date(deadline) < new Date() && status !== 'Completed';
        if (isOverdue) return { bg: 'bg-rose-50/50', text: 'text-rose-700', border: 'border-rose-100', icon: <AlertCircle size={20} className="text-rose-500" /> };

        return { bg: 'bg-amber-50/50', text: 'text-amber-700', border: 'border-amber-100', icon: <Clock size={20} className="text-amber-500" /> };
    };

    return (
        <div className="flex flex-col gap-10 pb-10">
            <header className="bg-white/70 backdrop-blur-xl p-12 rounded-[40px] border border-white/60 shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="flex items-center gap-8">
                    <div className="w-20 h-20 bg-[#14B8A6] rounded-[28px] shadow-2xl shadow-[#14B8A6]/30 flex items-center justify-center text-white group hover:rotate-12 transition-transform duration-700">
                        <ListTodo size={36} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-3">Task Protocol</h1>
                        <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-3 mt-1">
                            <div className="w-2 h-2 rounded-full bg-[#14B8A6] animate-pulse"></div>
                            Operational Directives & Action Items
                        </p>
                    </div>
                </div>
            </header>

            {loading ? (
                <div className="text-center p-20 text-slate-400 font-bold animate-pulse">Synchronizing Agent Tasks...</div>
            ) : (
                <div className="flex flex-col gap-4">
                    {tasks.map((task) => {
                        const style = getStatusStyles(task.status, task.deadline);
                        return (
                            <div key={task.id} className={`p-6 rounded-[2rem] border ${style.border} ${style.bg} transition-all duration-300 relative group flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-md`}>
                                {/* Left Side: Icon, Status, Title, Desc */}
                                <div className="flex items-start gap-5 flex-1 w-full">
                                    <div className={`mt-0.5 h-12 w-12 shrink-0 rounded-2xl flex items-center justify-center bg-white shadow-sm border ${style.border}`}>
                                        {style.icon}
                                    </div>
                                    <div className="flex flex-col gap-1.5 w-full">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <h3 className="text-base font-black text-slate-900 leading-tight">{task.title}</h3>
                                            <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-lg bg-white border ${style.border} ${style.text} shadow-sm`}>
                                                {task.status === 'Completed' ? 'Completed' : (new Date(task.deadline) < new Date() ? 'Overdue' : 'Pending')}
                                            </span>
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-md">
                                                {task.priority || 'Standard'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-3xl line-clamp-2 pr-4">{task.description}</p>
                                    </div>
                                </div>

                                {/* Right Side: Details & Action */}
                                <div className="flex items-center gap-6 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-200/50 justify-between md:justify-end shrink-0">
                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Assigned By</p>
                                            <p className="text-[10px] font-bold text-slate-700 uppercase truncate max-w-[100px]">
                                                {task.assigner_name || 'Admin'} <span className="opacity-50 lowercase">({task.assigner_role?.replace('_', ' ') || 'admin'})</span>
                                            </p>
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Deadline</p>
                                            <p className="text-[10px] font-bold text-slate-700">{new Date(task.deadline).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div className="w-[150px] flex justify-end">
                                        {task.status !== 'Completed' ? (
                                            <button
                                                onClick={() => handleComplete(task.id)}
                                                className="bg-slate-900 text-[#14B8A6] px-8 py-3.5 rounded-[18px] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:shadow-slate-900/20 hover:-translate-y-0.5 transition-all active:scale-95 border border-slate-800"
                                            >
                                                Mark Done
                                            </button>
                                        ) : (
                                            <div className="text-[10px] text-right font-black text-[#14B8A6] uppercase italic tracking-[0.1em] opacity-80">
                                                Verified: <br />{new Date(task.completed_at).toLocaleDateString('en-GB')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {tasks.length === 0 && (
                        <div className="py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200 flex flex-col items-center justify-center shadow-sm">
                            <CheckCircle size={40} className="text-emerald-100 mb-4" />
                            <p className="text-slate-400 font-bold">Protocol Clear. No active tasks detected.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MyTasks;
