import React, { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { premiumConfirm } from '../../utils/premiumConfirm';
import { useAuth } from '../../context/AuthContext';
import { Plus, Calendar, Clock, AlertTriangle } from 'lucide-react';

import FilterDropdown from '../../components/FilterDropdown';

const Tasks = () => {
    const { user } = useAuth();
    const isSuperAdmin = user?.role === 'super_admin';
    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [assignees, setAssignees] = useState([]);
    const [filterPriority, setFilterPriority] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        mentor_id: '',
        deadline: '',
        priority: 'Medium'
    });

    useEffect(() => {
        fetchTasks();
        fetchAssignees();
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await api.get('/tasks');
            setTasks(response.data.data);
            setFilteredTasks(response.data.data);
            setLoading(false);
        } catch (error) {
            toast.error("Failed to load tasks");
            setLoading(false);
        }
    };

    const handleSearch = (query) => {
        const filtered = tasks.filter(t =>
            t.title?.toLowerCase().includes(query.toLowerCase()) ||
            t.description?.toLowerCase().includes(query.toLowerCase()) ||
            t.mentor_name?.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredTasks(filtered);
    };

    const handleFilterChange = (priority) => {
        setFilterPriority(priority);
        if (!priority) {
            setFilteredTasks(tasks);
        } else {
            setFilteredTasks(tasks.filter(t => t.priority === priority));
        }
    };

    const priorityOptions = [
        { value: '', label: 'All Priorities' },
        { value: 'High', label: 'High Priority' },
        { value: 'Medium', label: 'Medium Priority' },
        { value: 'Low', label: 'Low Priority' }
    ];

    const handleExport = () => {
        if (filteredTasks.length === 0) {
            toast.error("No data to export");
            return;
        }

        const headers = ['Objective', 'Description', 'Mentor', 'Deadline', 'Priority', 'Status'];
        const csvContent = [
            headers.join(','),
            ...filteredTasks.map(t => [
                `"${t.title}"`,
                `"${t.description}"`,
                `"${t.mentor_name || 'Unassigned'}"`,
                t.deadline,
                t.priority,
                t.status
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `tasks_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Tasks exported as CSV");
    };

    const fetchAssignees = async () => {
        try {
            const response = await api.get('/admin/users');
            const targetRoles = ['mentor', 'faculty', 'mentor_head'];
            const filteredUsers = response.data.data.filter(u => targetRoles.includes(u.role));
            setAssignees(filteredUsers);
        } catch (error) {
            console.error("Failed to fetch users for task assignment");
        }
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
            title: 'Delete Task', 
            message: `Are you sure you want to remove the task: "${task.title}"?`,
            type: 'danger'
        });
    };

    const columns = [
        {
            header: 'Task Objective', accessor: 'title', render: (row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-900">{row.title}</span>
                    <span className="text-xs text-slate-400 font-medium truncate max-w-[200px]">{row.description}</span>
                </div>
            )
        },
        {
            header: 'Assigned To', accessor: 'mentor_name', render: (row) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-500 border border-slate-200 uppercase shrink-0">
                            {row.mentor_name?.charAt(0) || 'U'}
                        </div>
                        <span className="text-slate-600 font-semibold text-xs truncate max-w-[120px]">{row.mentor_name || 'Unassigned'}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Assigned By', accessor: 'assigner_name', render: (row) => (
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700">{row.assigner_name || 'System Admin'}</span>
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{row.assigner_role?.replace('_', ' ') || 'admin'}</span>
                </div>
            )
        },
        {
            header: 'Deadline', accessor: 'deadline', render: (row) => (
                <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
                    <Calendar size={14} className="text-slate-300" />
                    {new Date(row.deadline).toLocaleDateString()}
                </div>
            )
        },
        {
            header: 'Priority', accessor: 'priority', render: (row) => (
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${row.priority === 'High' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                    row.priority === 'Medium' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                        'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}>
                    {row.priority}
                </span>
            )
        },
        {
            header: 'Phase', accessor: 'status', render: (row) => (
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${row.status === 'Completed' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
                    <span className={`text-[11px] font-black uppercase tracking-widest ${row.status === 'Completed' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {row.status}
                    </span>
                </div>
            )
        },
    ];

    return (
        <div className="flex flex-col gap-10 pb-10">
            <div className="bg-white/70 backdrop-blur-xl p-10 rounded-[32px] border border-white/60 shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="text-center md:text-left">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-3 italic">Operations Hub</h2>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center md:justify-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#14B8A6] animate-pulse"></div>
                        Coordinate and track educational tasks for the mentor network
                    </p>
                </div>
                {isSuperAdmin && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-gradient-to-br from-[#0F766E] to-[#14B8A6] text-white px-8 py-5 rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] hover:shadow-xl hover:shadow-[#14B8A6]/40 hover:-translate-y-1 transition-all flex items-center gap-3"
                    >
                        <Plus size={18} strokeWidth={3} />
                        <span>Issue New Mission</span>
                    </button>
                )}
            </div>

            <DataTable
                columns={columns}
                data={filteredTasks}
                loading={loading}
                onSearch={handleSearch}
                onFilter={
                    <FilterDropdown
                        value={filterPriority}
                        onChange={handleFilterChange}
                        options={priorityOptions}
                        placeholder="Priority"
                    />
                }
                onExport={handleExport}
                onDelete={isSuperAdmin ? handleDelete : undefined}
                searchPlaceholder="Filter tasks by objective or mentor..."
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create New Task"
                size="md"
            >
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Mission Objective</label>
                        <input
                            type="text"
                            required
                            className="p-5 bg-slate-50/50 border border-slate-100/50 rounded-2xl text-[13px] outline-none focus:bg-white focus:ring-4 focus:ring-[#14B8A6]/5 focus:border-[#14B8A6] transition-all font-black uppercase tracking-widest text-slate-700 placeholder:text-slate-300 shadow-inner"
                            placeholder="OBJECTIVE IDENTIFIER..."
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Strategic Parameters</label>
                        <textarea
                            rows="4"
                            required
                            className="p-5 bg-slate-50/50 border border-slate-100/50 rounded-2xl text-[13px] outline-none focus:bg-white focus:ring-4 focus:ring-[#14B8A6]/5 focus:border-[#14B8A6] transition-all font-bold text-slate-600 placeholder:text-slate-300 shadow-inner resize-none italic"
                            placeholder="Specify detailed engagement protocols..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Designated Personnel</label>
                            <select
                                required
                                className="p-5 bg-slate-50/50 border border-slate-100/50 rounded-2xl text-[10px] outline-none focus:bg-white focus:ring-4 focus:ring-[#14B8A6]/5 focus:border-[#14B8A6] transition-all font-black uppercase tracking-[0.1em] appearance-none cursor-pointer shadow-inner"
                                value={formData.mentor_id}
                                onChange={(e) => setFormData({ ...formData, mentor_id: e.target.value })}
                            >
                                <option value="">SELECT TARGET ANALYST</option>
                                <optgroup label="MENTORS">
                                    {assignees.filter(a => a.role === 'mentor').map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </optgroup>
                                <optgroup label="FACULTIES">
                                    {assignees.filter(a => a.role === 'faculty').map(f => (
                                        <option key={f.id} value={f.id}>{f.name}</option>
                                    ))}
                                </optgroup>
                                <optgroup label="OPERATIONAL HEADS">
                                    {assignees.filter(a => a.role === 'mentor_head').map(mh => (
                                        <option key={mh.id} value={mh.id}>{mh.name}</option>
                                    ))}
                                </optgroup>
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Temporal Deadline</label>
                            <div className="relative">
                                <Calendar size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#14B8A6] opacity-50" />
                                <input
                                    type="date"
                                    required
                                    className="w-full p-5 pl-14 bg-slate-50/50 border border-slate-100/50 rounded-2xl text-[11px] outline-none focus:bg-white focus:ring-4 focus:ring-[#14B8A6]/5 focus:border-[#14B8A6] transition-all font-black uppercase tracking-[0.2em] shadow-inner"
                                    value={formData.deadline}
                                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Priority Categorization</label>
                        <div className="grid grid-cols-3 gap-4">
                            {['Low', 'Medium', 'High'].map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, priority: p })}
                                    className={`
                                        p-4 rounded-2xl border-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500
                                        ${formData.priority === p
                                            ? 'bg-slate-900 border-slate-900 text-[#14B8A6] shadow-2xl scale-[1.02]'
                                            : 'bg-white border-slate-100 text-slate-300 hover:border-slate-200'}
                                    `}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-slate-900 text-white p-6 rounded-[24px] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-slate-800 transition-all shadow-2xl shadow-slate-900/10 mt-4 flex items-center justify-center gap-4 group italic"
                    >
                        <span>Authorize and Issue Mission Protocol</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#14B8A6] group-hover:animate-ping"></div>
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default Tasks;
