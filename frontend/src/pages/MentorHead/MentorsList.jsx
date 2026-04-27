import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Users,
    Search,
    MoreHorizontal,
    Phone,
    MapPin,
    Loader2,
    LayoutDashboard,
    CheckCircle2,
    ArrowUpDown,
    Edit2,
    Trash2,
    X,
    GraduationCap,
    BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { premiumConfirm } from '../../utils/premiumConfirm';

const MentorsList = () => {
    const navigate = useNavigate();
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingMentor, setEditingMentor] = useState({ id: '', name: '', email: '', phone_number: '', place: '', password: '' });
    
    // Student View Modal States
    const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
    const [selectedMentorForView, setSelectedMentorForView] = useState(null);
    const [mentorStudents, setMentorStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    useEffect(() => {
        const fetchMentors = async () => {
            try {
                const token = localStorage.getItem('token');
                // Fetching from the new activity dashboard endpoint which has progress logic
                const res = await axios.get('/api/mentor-head/mentor-activity', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.success) {
                    setMentors(res.data.data);
                }
            } catch (error) {
                console.error('Error fetching mentors:', error);
                toast.error("Failed to load mentors list");
            } finally {
                setLoading(false);
            }
        };

        fetchMentors();
    }, []);

    const filteredMentors = mentors.filter(m =>
        m.mentor_name?.toLowerCase().includes(searchTerm.toLowerCase()) || m.phone_number?.includes(searchTerm)
    );

    const handleEdit = (mentor) => {
        setEditingMentor({ id: mentor.mentor_id, name: mentor.mentor_name, email: mentor.email || '', phone_number: mentor.phone_number || '', place: mentor.place || '', password: '' });
        setIsEditModalOpen(true);
    };

    const handleUpdateMentor = async () => {
        try {
            const token = localStorage.getItem('token');
            // Using the actual server endpoint that handles edit
            const payload = { ...editingMentor };
            if (!payload.password) delete payload.password; // Don't send empty password

            const res = await axios.put(`/api/mentor-head/mentors/${editingMentor.id}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                toast.success('Mentor details updated successfully');
                setIsEditModalOpen(false);
                setMentors(mentors.map(m => m.mentor_id === editingMentor.id ? { ...m, mentor_name: editingMentor.name, email: editingMentor.email, phone_number: editingMentor.phone_number, place: editingMentor.place } : m));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update mentor');
        }
    };

    const handleDelete = async (mentorId, mentorName) => {
        premiumConfirm(async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.delete(`/api/mentor-head/mentors/${mentorId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.success) {
                    toast.success('Mentor deleted successfully');
                    setMentors(mentors.filter(m => m.mentor_id !== mentorId));
                }
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to delete mentor');
            }
        }, { 
            name: mentorName, 
            title: 'Delete Mentor Account', 
            message: `You are permanently removing ${mentorName}. This will unassign their students and archive records.`,
            type: 'danger'
        });
    };

    const handleViewStudents = async (mentor) => {
        setSelectedMentorForView(mentor);
        setIsStudentModalOpen(true);
        setLoadingStudents(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`/api/mentor-head/students-all?mentor_id=${mentor.mentor_id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setMentorStudents(res.data.data);
            }
        } catch (error) {
            toast.error("Failed to load assigned students");
        } finally {
            setLoadingStudents(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-[#008080] animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Page Title */}
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Mentor Registry</h2>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                        <Users size={14} className="text-[#008080]" />
                        Comprehensive database of all active mentors, their assigned students, and daily connection progress
                    </p>
                </div>

                <div className="relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#008080] transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="FILTER BY NAME, PHONE, OR LOCATION..."
                        className="pl-14 pr-8 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-xs font-bold uppercase tracking-[0.1em] focus:ring-4 ring-[#008080]/10 w-full md:w-96 shadow-sm transition-all outline-none focus:bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[200px]">Mentor</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Total Students</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Connected Today</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[250px]">Connection Progress</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredMentors.map((mentor) => {
                                const total = mentor.total_assigned_students || 0;
                                const connected = mentor.students_connected_today || 0;
                                const progress = total > 0 ? (connected / total) * 100 : 0;

                                return (
                                    <React.Fragment key={mentor.mentor_id}>
                                        <tr className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-[#008080] via-[#008080] to-purple-700 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-[#008080] group-hover:scale-110 transition-transform">
                                                        {mentor.mentor_name.charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-slate-900 group-hover:text-[#008080] transition-colors">{mentor.mentor_name}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6 text-center">
                                                <button 
                                                    onClick={() => handleViewStudents(mentor)}
                                                    className="text-sm font-black text-slate-600 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-200 hover:border-slate-300 transition-all cursor-pointer"
                                                >
                                                    {total}
                                                </button>
                                            </td>
                                            <td className="p-6 text-center">
                                                <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                                                    {connected}
                                                </span>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-emerald-400 to-[#008080] transition-all duration-1000"
                                                            style={{ width: `${progress}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-500 w-10 text-right">
                                                        {progress.toFixed(0)}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/mentor-head/mentors/${mentor.mentor_id}`);
                                                        }}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#008080] hover:bg-[#008080]/10 hover:border-[#008080] transition-all shadow-sm"
                                                        title="View Profile"
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEdit(mentor);
                                                        }}
                                                        className="p-2 border border-slate-200 bg-white rounded-xl text-[#008080] hover:bg-[#008080]/10 transition-colors shadow-sm"
                                                        title="Edit Mentor"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(mentor.mentor_id, mentor.mentor_name);
                                                        }}
                                                        className="p-2 border border-slate-200 bg-white rounded-xl text-rose-600 hover:bg-rose-50 transition-colors shadow-sm"
                                                        title="Delete Mentor"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {filteredMentors.length === 0 && (
                <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mx-auto mb-6">
                        <Users size={40} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">System Empty</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 max-w-xs mx-auto">
                        No mentors found matching your current filters. Try expanding your search.
                    </p>
                </div>
            )}

            {/* Edit Modal */}
            {/* ... already there ... */}

            {/* Student View Modal */}
            {isStudentModalOpen && selectedMentorForView && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h2 className="text-lg font-black text-slate-900 flex items-center gap-3 italic">
                                <Users size={20} className="text-[#008080]" /> Students: {selectedMentorForView.mentor_name.toUpperCase()}
                            </h2>
                            <button onClick={() => setIsStudentModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-8 max-h-[60vh] overflow-y-auto">
                            {loadingStudents ? (
                                <div className="text-center py-10 font-black text-slate-400 animate-pulse uppercase tracking-widest">Loading Mentor Registry...</div>
                            ) : mentorStudents.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {mentorStudents.map((student) => (
                                        <div key={student.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col gap-3 group hover:bg-white hover:border-[#008080] hover:shadow-lg transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-[#008080] text-white rounded-lg flex items-center justify-center text-xs font-black shadow-md uppercase">
                                                    {student.name.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-slate-900 uppercase italic">{student.name}</span>
                                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{student.registration_number || 'REG-PENDING'}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <span className="text-[8px] font-black bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-600 uppercase italic">{student.course}</span>
                                                <span className="text-[8px] font-black bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-600 uppercase">Grade {student.grade}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 text-slate-400 font-black text-[10px] uppercase tracking-widest">No students found</div>
                            )}
                        </div>
                        <div className="px-8 py-6 border-t border-slate-100 bg-slate-50 flex justify-end">
                            <button
                                onClick={() => setIsStudentModalOpen(false)}
                                className="px-10 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
                            >
                                Close Registry
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MentorsList;
