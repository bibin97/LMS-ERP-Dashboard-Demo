import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ListTodo, CheckCircle, Clock, AlertCircle, Plus, Calendar, AlertTriangle, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { premiumConfirm } from '../../utils/premiumConfirm';
import Modal from '../../components/Modal';

const MentorHeadTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mentors, setMentors] = useState([]);
    const [filterMentor, setFilterMentor] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        mentor_id: '',
        deadline: '',
        priority: 'Medium'
    });

    useEffect(() => {
        fetchTasks();
        fetchMentors();
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const res = await api.get('/tasks');
            setTasks(res.data.data);
        } catch (error) {
            toast.error("Failed to load tasks");
        } finally {
            setLoading(false);
        }
    };

    const fetchMentors = async () => {
        try {
            const res = await api.get('/mentor-head/mentors-all');
            if (res.data.success) {
                setMentors(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch mentors for task assignment", error);
        }
    };

    const handleComplete = async (taskId) => {
        try {
            await api.put(`/tasks/${taskId}/status`, { status: 'Completed' });
            toast.success("Task completed!");
            fetchTasks();
        } catch (error) {
            toast.error("Action failed");
        }
    };

    const handleDelete = async (task) => {
        premiumConfirm(async () => {
            try {
                await api.delete(`/tasks/${task.id}`);
                toast.success("Task removed");
                fetchTasks();
            } catch (error) {
                toast.error("Failed to delete task");
            }
        }, { 
            name: task.title,
            title: 'Delete Assigned Task', 
            message: `Are you sure you want to permanently remove the task "${task.title}"?`,
            type: 'danger'
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/tasks', formData);
            toast.success("Task assigned successfully");
            setIsModalOpen(false);
            setFormData({ title: '', description: '', mentor_id: '', deadline: '', priority: 'Medium' });
            fetchTasks();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create task");
        }
    };

    const getStatusStyles = (status, deadline) => {
        if (status === 'Completed') return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', icon: <CheckCircle size={16} /> };

        const isOverdue = new Date(deadline) < new Date() && status !== 'Completed';
        if (isOverdue) return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100', icon: <AlertCircle size={16} /> };

        return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', icon: <Clock size={16} /> };
    };

    // Consolidated filtering logic
    const filteredTasks = tasks.filter(task => {
        const matchesMentor = !filterMentor || task.mentor_name === filterMentor;
        const matchesStatus = statusFilter === 'All' 
            || (statusFilter === 'Pending' && task.status !== 'Completed')
            || (statusFilter === 'Completed' && task.status === 'Completed');
        const matchesSearch = !searchQuery 
            || task.title?.toLowerCase().includes(searchQuery.toLowerCase())
            || task.description?.toLowerCase().includes(searchQuery.toLowerCase());
        
        return matchesMentor && matchesStatus && matchesSearch;
    });

    // Get unique mentor names for filter dropdown
    const availableMentors = [...new Set(tasks.map(t => t.mentor_name).filter(Boolean))];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#008080] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#008080]/30 rotate-3">
                        <ListTodo size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">Assigned Protocols</h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Operational directiives and tasks for Mentors</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    {availableMentors.length > 0 && (
                        <select
                            className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-600 outline-none focus:ring-2 focus:ring-[#008080]"
                            value={filterMentor}
                            onChange={(e) => setFilterMentor(e.target.value)}
                        >
                            <option value="">All Mentors</option>
                            {availableMentors.map((name, i) => (
                                <option key={i} value={name}>{name}</option>
                            ))}
                        </select>
                    )}

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center gap-2 bg-[#008080] text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-[#008080]/30 hover:-translate-y-0.5"
                    >
                        <Plus size={16} />
                        Assign Task
                    </button>
                </div>
            </header>

            {loading ? (
                <div className="text-center p-20 text-slate-400 font-bold animate-pulse">Synchronizing Workforce Tasks...</div>
            ) : (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                <div className="flex flex-col sm:flex-row justify-between items-center p-8 border-b border-slate-100 gap-4">
                    <div className="relative w-full sm:w-80 group">
                        <AlertTriangle size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#008080] transition-colors" />
                        <input
                            type="text"
                            placeholder="Scan protocols by title..."
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold outline-none focus:bg-white focus:ring-4 focus:ring-[#008080]/50 focus:border-[#008080] transition-all placeholder:text-slate-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:block">Status:</span>
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            {['All', 'Pending', 'Completed'].map(s => (
                                <button 
                                    key={s} 
                                    onClick={() => setStatusFilter(s)}
                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === s ? 'bg-white text-[#008080] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Matrix</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Personnel Assigned</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Temporal Status</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Origin Authority</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="p-6"><div className="h-12 bg-slate-50 rounded-2xl w-full"></div></td>
                                    </tr>
                                ))
                            ) : filteredTasks.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-40">
                                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border-4 border-white shadow-inner">
                                                <ListTodo size={40} className="text-slate-300" />
                                            </div>
                                            <p className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">No active tasks detected in the sectors</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredTasks.map((task) => {
                                    const style = getStatusStyles(task.status, task.deadline);
                                    const isOverdue = new Date(task.deadline) < new Date() && task.status !== 'Completed';
                                    
                                    return (
                                        <tr key={task.id} className="hover:bg-slate-50/50 transition-all group">
                                            <td className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm transition-transform group-hover:rotate-3 ${style.bg} ${style.border} ${style.text}`}>
                                                        {style.icon}
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-black text-slate-900 block group-hover:text-[#008080] transition-colors uppercase tracking-tight">{task.title}</span>
                                                        <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${task.priority === 'High' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                                                            {task.priority || 'Standard'} Priority
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 border border-slate-200 uppercase font-black text-[10px]">
                                                        {task.mentor_name?.charAt(0) || 'M'}
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-700">{task.mentor_name || 'Unassigned'}</span>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-current w-fit ${style.text}`}>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                                        {task.status === 'Completed' ? 'Fulfilled' : (isOverdue ? 'Overdue' : 'Active')}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                                                        <Calendar size={10} />
                                                        {new Date(task.deadline).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter block">{task.assigner_name || 'ADMIN'}</span>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase opacity-60">System Authority</span>
                                            </td>
                                            <td className="p-6 text-right">
                                                <div className="flex items-center justify-end gap-2 opactiy-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleDelete(task)}
                                                        className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all border border-transparent hover:border-rose-100"
                                                        title="Erase Trace"
                                                    >
                                                        <AlertCircle size={18} />
                                                    </button>
                                                    {task.status !== 'Completed' && (
                                                        <button
                                                            onClick={() => handleComplete(task.id)}
                                                            className="h-10 px-4 rounded-xl flex items-center justify-center gap-2 bg-[#008080]/10 text-white hover:bg-[#008080] hover:text-white transition-all shadow-sm shadow-[#008080]/30 active:scale-95 font-black text-[10px] uppercase tracking-widest"
                                                        >
                                                            <CheckCircle size={14} />
                                                            Identify Solved
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center mt-auto">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sector Logged: {filteredTasks.length} Protocols Active</span>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 cursor-not-allowed">Previous</button>
                        <button className="px-4 py-2 bg-[#008080] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#008080]/30 italic">Page 01</button>
                        <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-sm hover:bg-slate-50">Next</button>
                    </div>
                </div>
            </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create New Task"
                size="md"
            >
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Task Title</label>
                        <input
                            type="text"
                            required
                            className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#008080] focus:border-[#008080] transition-all font-semibold"
                            placeholder="e.g., Weekly Student Review"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Detailed Description</label>
                        <textarea
                            rows="4"
                            required
                            className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#008080] focus:border-[#008080] transition-all font-semibold resize-none"
                            placeholder="Provide specific instructions for the mentor..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign User</label>
                            <select
                                required
                                className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#008080] focus:border-[#008080] transition-all font-semibold appearance-none"
                                value={formData.mentor_id}
                                onChange={(e) => setFormData({ ...formData, mentor_id: e.target.value })}
                            >
                                <option value="">Select Target Mentor</option>
                                {mentors.map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fulfillment Deadline</label>
                            <div className="relative">
                                <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="date"
                                    required
                                    className="w-full p-4 pl-12 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#008080] focus:border-[#008080] transition-all font-semibold"
                                    value={formData.deadline}
                                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority Categorization</label>
                        <div className="grid grid-cols-3 gap-3">
                            {['Low', 'Medium', 'High'].map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, priority: p })}
                                    className={`
                                        p-3 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all
                                        ${formData.priority === p
                                            ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200'
                                            : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}
                                    `}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-[#008080] text-white p-4 rounded-2xl font-black text-sm hover:bg-slate-900 transition-all shadow-xl shadow-[#008080]/30 mt-2 flex items-center justify-center gap-2 group"
                    >
                        <span>Authorize and Issue Task</span>
                        <AlertTriangle size={18} className="transition-transform group-hover:scale-110" />
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default MentorHeadTasks;
