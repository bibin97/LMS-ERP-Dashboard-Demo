import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    Users, User, Mail, Phone, Calendar,
    Clock, List, ChevronDown, ChevronUp, Search,
    Briefcase, GraduationCap, ArrowRight, ExternalLink,
    Filter, Activity, Edit2, Trash2, X, Save
} from 'lucide-react';
import toast from 'react-hot-toast';
import { premiumConfirm } from '../../utils/premiumConfirm';

const FacultyDirectory = () => {
    const [faculties, setFaculties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedFaculty, setExpandedFaculty] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingFaculty, setEditingFaculty] = useState(null);
    const [sortBy, setSortBy] = useState('name');
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchFaculties();
    }, [sortBy, dateRange]);

    const fetchFaculties = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/academic-head/faculties?sortBy=${sortBy}&startDate=${dateRange.start}&endDate=${dateRange.end}`);
            setFaculties(res.data.data);
        } catch (error) {
            toast.error("Failed to load faculty directory");
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        const content = `
            <html>
                <head>
                    <title>Faculty Workforce Report - ${new Date().toLocaleDateString()}</title>
                    <style>
                        body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; font-size: 12px; }
                        th { background: #f8fafc; font-weight: bold; text-transform: uppercase; }
                        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1e293b; padding-bottom: 20px; }
                        .stats { margin: 20px 0; font-size: 14px; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>MISSION X - FACULTY DIRECTORY</h1>
                        <p>Range: ${dateRange.start} to ${dateRange.end}</p>
                    </div>
                    <div class="stats">TOTAL FACULTY: ${faculties.length}</div>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Students</th>
                                <th>Total Hours</th>
                                <th>Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${faculties.map(f => `
                                <tr>
                                    <td>${f.name}</td>
                                    <td>${f.email}</td>
                                    <td>${f.studentCount}</td>
                                    <td>${f.totalHours}h</td>
                                    <td>${new Date(f.created_at).toLocaleDateString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </body>
            </html>
        `;
        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.print();
    };

    const handleEditFaculty = (faculty) => {
        setEditingFaculty({ ...faculty });
        setIsEditModalOpen(true);
    };

    const handleUpdateFaculty = async () => {
        try {
            const res = await api.put(`/academic-head/faculties/${editingFaculty.id}`, editingFaculty);
            if (res.data.success) {
                toast.success("Faculty record updated successfully");
                setIsEditModalOpen(false);
                fetchFaculties();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Update operation failed");
        }
    };

    const handleDeleteFaculty = async (facultyParam) => {
        const id = typeof facultyParam === 'object' ? facultyParam.id : facultyParam;
        const name = typeof facultyParam === 'object' ? facultyParam.name : 'this faculty';

        premiumConfirm(async () => {
            try {
                const res = await api.delete(`/academic-head/faculties/${id}`);
                if (res.data.success) {
                    toast.success("Faculty record purged from system");
                    fetchFaculties();
                }
            } catch (error) {
                toast.error(error.response?.data?.message || "Failed to delete faculty");
            }
        }, {
            name: name,
            title: 'Delete Faculty Record',
            message: `Are you sure you want to permanently delete the faculty record for ${name}?`,
            type: 'danger'
        });
    };

    const filteredFaculties = faculties.filter(f =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-10 pb-20 max-w-[1600px] mx-auto animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#008080]/10 rounded-full -mr-32 -mt-32 opacity-40"></div>
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 bg-[#008080] rounded-3xl flex items-center justify-center text-white shadow-xl shadow-[#008080]/30 rotate-6 group hover:rotate-0 transition-all duration-500">
                        <Users size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Faculty Directory</h1>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                            <Activity size={12} className="text-[#008080]" />
                            Comprehensive management of faculty profiles, assigned student cohorts, and live session timelines
                        </p>
                    </div>
                </div>

                <div className="relative z-10 w-full md:w-96">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#008080] transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Find by Name or Email..."
                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:bg-white focus:ring-8 ring-[#008080]/5 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Filter & Analysis Bar */}
            <div className="flex flex-col lg:flex-row gap-6 items-end lg:items-center justify-between px-2">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 bg-white p-2 border border-slate-100 rounded-2xl shadow-sm">
                        <button 
                            onClick={() => setSortBy('newest')}
                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${sortBy === 'newest' ? 'bg-[#008080] text-white shadow-lg shadow-[#008080]/30' : 'text-slate-400 hover:bg-slate-50'}`}
                        >Newest First</button>
                        <button 
                            onClick={() => setSortBy('oldest')}
                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${sortBy === 'oldest' ? 'bg-[#008080] text-white shadow-lg shadow-[#008080]/30' : 'text-slate-400 hover:bg-slate-50'}`}
                        >Oldest First</button>
                        <button 
                            onClick={() => setSortBy('most_students')}
                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${sortBy === 'most_students' ? 'bg-[#008080] text-white shadow-lg shadow-[#008080]/30' : 'text-slate-400 hover:bg-slate-50'}`}
                        >Top Load</button>
                        <button 
                            onClick={() => setSortBy('most_hours')}
                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${sortBy === 'most_hours' ? 'bg-[#008080] text-white shadow-lg shadow-[#008080]/30' : 'text-slate-400 hover:bg-slate-50'}`}
                        >Most Hours</button>
                    </div>

                    <div className="flex items-center gap-3 bg-white p-2 border border-slate-100 rounded-2xl shadow-sm">
                        <div className="flex flex-col gap-0.5 px-2">
                            <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Audit Start</span>
                            <input 
                                type="date" 
                                className="text-[10px] font-black text-slate-700 outline-none" 
                                value={dateRange.start}
                                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            />
                        </div>
                        <div className="w-px h-6 bg-slate-100"></div>
                        <div className="flex flex-col gap-0.5 px-2">
                            <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Audit End</span>
                            <input 
                                type="date" 
                                className="text-[10px] font-black text-slate-700 outline-none" 
                                value={dateRange.end}
                                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            />
                        </div>
                    </div>
                </div>

                <button 
                    onClick={handlePrint}
                    className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#008080] transition-all shadow-xl shadow-slate-100 active:scale-95"
                >
                    <Activity size={16} /> Print Analytics Registry
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center p-32 space-y-4">
                    <div className="w-14 h-14 border-4 border-[#008080] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Syncing Faculty Database...</p>
                </div>
            ) : filteredFaculties.length === 0 ? (
                <div className="bg-white p-20 rounded-[4rem] text-center border-2 border-dashed border-slate-100">
                    <Users size={64} className="text-slate-100 mx-auto mb-6" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No matching faculty profiles found</p>
                </div>
            ) : (
                <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Faculty Expert</th>
                                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact Details</th>
                                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Metrics</th>
                                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timeline</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredFaculties.map((faculty) => (
                                    <React.Fragment key={faculty.id}>
                                        <tr className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-[#008080]/10 rounded-2xl flex items-center justify-center text-[#008080] font-black shadow-sm group-hover:scale-110 transition-transform">
                                                        {faculty.name[0]}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-black text-slate-900 uppercase italic tracking-tight">{faculty.name}</h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[8px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-widest border border-emerald-100">
                                                                {faculty.status}
                                                            </span>
                                                            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
                                                                ID:#{faculty.id.toString().padStart(4, '0')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-slate-500">
                                                        <Mail size={12} className="text-slate-300" />
                                                        <span className="text-[10px] font-bold lowercase">{faculty.email}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-slate-500">
                                                        <Phone size={12} className="text-slate-300" />
                                                        <span className="text-[10px] font-bold">{faculty.phone_number || "N/A"}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex gap-2">
                                                    <div className="text-center bg-[#008080]/10/50 px-3 py-1.5 rounded-xl border border-[#008080]/50">
                                                        <p className="text-[7px] font-black text-[#008080] uppercase tracking-tighter">Students</p>
                                                        <p className="text-xs font-black text-[#008080]">{faculty.studentCount}</p>
                                                    </div>
                                                    <div className="text-center bg-emerald-50/50 px-3 py-1.5 rounded-xl border border-emerald-100/50">
                                                        <p className="text-[7px] font-black text-emerald-400 uppercase tracking-tighter">Hours</p>
                                                        <p className="text-xs font-black text-emerald-700">{faculty.totalHours}h</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-slate-600 uppercase italic tracking-tight">Active Duty</span>
                                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                                                        Joined {new Date(faculty.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => setExpandedFaculty(expandedFaculty === faculty.id ? null : faculty.id)}
                                                        className={`p-2 rounded-xl transition-all ${expandedFaculty === faculty.id ? 'bg-slate-900 text-white shadow-xl' : 'bg-slate-100 text-slate-400 hover:text-slate-600'}`}
                                                        title="Schedule View"
                                                    >
                                                        <Calendar size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleEditFaculty(faculty)}
                                                        className="p-2 bg-[#008080]/10 text-white rounded-xl hover:bg-[#008080] hover:text-white transition-all shadow-sm"
                                                        title="Edit Profile"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteFaculty(faculty)}
                                                        className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                                        title="Delete Faculty"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {expandedFaculty === faculty.id && (
                                            <tr>
                                                <td colSpan="5" className="px-8 py-0">
                                                    <div className="bg-slate-50 p-8 rounded-b-[2.5rem] mb-6 animate-in slide-in-from-top-2 duration-300">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                            {/* Student Cohort */}
                                                            <div className="space-y-4">
                                                                <div className="flex items-center gap-2">
                                                                    <GraduationCap size={16} className="text-[#008080]" />
                                                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest italic">Assigned Student Cohort</span>
                                                                </div>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {faculty.assignedStudents.map(student => (
                                                                        <div key={student.id} className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 group/student cursor-default">
                                                                            <span className="w-5 h-5 bg-[#008080]/10 text-[#008080] rounded text-[8px] font-black flex items-center justify-center">
                                                                                {student.grade}
                                                                            </span>
                                                                            <span className="text-[10px] font-black text-slate-600 uppercase italic transition-colors group-hover/student:text-[#008080]">{student.name}</span>
                                                                        </div>
                                                                    ))}
                                                                    {faculty.assignedStudents.length === 0 && <span className="text-[10px] font-bold text-slate-400 italic">No assigned students.</span>}
                                                                </div>
                                                            </div>
                                                            {/* Daily Timeline */}
                                                            <div className="space-y-4">
                                                                <div className="flex items-center gap-2">
                                                                    <Clock size={16} className="text-emerald-600" />
                                                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest italic">Today's Academic Timeline</span>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    {faculty.todaySchedule.map((session, idx) => (
                                                                        <div key={idx} className="bg-white px-4 py-3 rounded-xl border border-slate-200 flex justify-between items-center group/session">
                                                                            <div className="flex items-center gap-4">
                                                                                <span className="text-[9px] font-black text-emerald-600 italic bg-emerald-50 px-2 py-1 rounded-lg">
                                                                                    {session.start_time} - {session.end_time}
                                                                                </span>
                                                                                <span className="text-[10px] font-black text-slate-800 uppercase italic tracking-tight">{session.chapter}</span>
                                                                            </div>
                                                                            <ArrowRight size={14} className="text-slate-200 group-hover/session:text-[#008080] transition-colors" />
                                                                        </div>
                                                                    ))}
                                                                    {faculty.todaySchedule.length === 0 && <div className="bg-white p-4 rounded-xl border border-dashed border-slate-200 text-center text-[10px] font-bold text-slate-400 italic">No scheduled sessions for today.</div>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}


            {/* Faculty Edit Modal */}
            {isEditModalOpen && editingFaculty && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in slide-in-from-bottom-4 duration-300 border border-white/20">
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h2 className="text-lg font-black text-slate-900 flex items-center gap-3 italic">
                                <Edit2 size={20} className="text-[#008080]" /> Edit Faculty Profile
                            </h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-white rounded-xl text-slate-400 hover:text-slate-600 hover:shadow-md transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                                <input
                                    type="text"
                                    value={editingFaculty.name}
                                    onChange={(e) => setEditingFaculty(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-[#008080] focus:border-[#008080] transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                                <input
                                    type="email"
                                    value={editingFaculty.email}
                                    onChange={(e) => setEditingFaculty(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-[#008080] focus:border-[#008080] transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
                                    <input
                                        type="text"
                                        value={editingFaculty.phone_number || ''}
                                        onChange={(e) => setEditingFaculty(prev => ({ ...prev, phone_number: e.target.value }))}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-[#008080] focus:border-[#008080] transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Place / City</label>
                                    <input
                                        type="text"
                                        value={editingFaculty.place || ''}
                                        onChange={(e) => setEditingFaculty(prev => ({ ...prev, place: e.target.value }))}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-[#008080] focus:border-[#008080] transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                            >
                                Discard
                            </button>
                            <button
                                onClick={handleUpdateFaculty}
                                className="px-8 py-3.5 bg-[#008080] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#008080]/30 hover:bg-[#008080] hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-2"
                            >
                                <Save size={16} /> Update Faculty
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultyDirectory;
