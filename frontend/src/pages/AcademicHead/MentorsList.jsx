import React, { useState, useEffect } from 'react';
import {
    Users, Search, Edit2, Trash2, X, Save,
    ShieldCheck, Activity, MapPin, Phone, Mail, Calendar
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { premiumConfirm } from '../../utils/premiumConfirm';

const MentorsList = () => {
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Edit Modal States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingMentor, setEditingMentor] = useState(null);

    // Inline Student View States
    const [expandedMentorId, setExpandedMentorId] = useState(null);
    const [mentorStudents, setMentorStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    useEffect(() => {
        fetchMentors();
    }, []);

    const fetchMentors = async () => {
        try {
            const res = await api.get('/academic-head/mentors-all');
            if (res.data.success) {
                setMentors(res.data.data);
            }
        } catch (error) {
            toast.error("Failed to load mentor directory");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (mentor) => {
        setEditingMentor({ ...mentor });
        setIsEditModalOpen(true);
    };

    const handleUpdate = async () => {
        try {
            const res = await api.put(`/academic-head/mentors/${editingMentor.id}`, editingMentor);
            if (res.data.success) {
                toast.success("Mentor profile updated");
                setIsEditModalOpen(false);
                fetchMentors();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Update failed");
        }
    };

    const handleDelete = async (id, name) => {
        premiumConfirm(async () => {
            try {
                const res = await api.delete(`/academic-head/mentors/${id}`);
                if (res.data.success) {
                    toast.success("Mentor profile deleted");
                    fetchMentors();
                }
            } catch (error) {
                toast.error(error.response?.data?.message || "Delete failed");
            }
        }, { 
            name: name,
            title: 'Delete Mentor Faculty', 
            message: `You are about to purge ${name} from the academic faculty records. This action is irreversible.`,
            type: 'danger'
        });
    };

    const handleViewStudents = async (mentor) => {
        if (expandedMentorId === mentor.id) {
            setExpandedMentorId(null);
            setMentorStudents([]);
            return;
        }

        setExpandedMentorId(mentor.id);
        setLoadingStudents(true);
        try {
            const res = await api.get(`/academic-head/students?mentor_id=${mentor.id}`);
            if (res.data.success) {
                setMentorStudents(res.data.data);
            }
        } catch (error) {
            toast.error("Failed to fetch assigned students");
        } finally {
            setLoadingStudents(false);
        }
    };

    const filteredMentors = mentors.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.place?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-20 text-center font-black text-slate-400 animate-pulse">SYNCING MENTOR DIRECTORY...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Mentor Faculty</h2>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                        <Users size={14} className="text-[#008080]" />
                        Academic Head level management of all mentor profiles and assignments
                    </p>
                </div>

                <div className="relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#008080] transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="FILTER BY NAME OR LOCATION..."
                        className="pl-14 pr-8 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold uppercase tracking-[0.1em] focus:ring-4 ring-[#008080]/10 w-full md:w-96 shadow-sm transition-all outline-none focus:bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* List Layout */}
            <div className="flex flex-col gap-4">
                {filteredMentors.length > 0 ? filteredMentors.map((mentor) => (
                    <div key={mentor.id} className="bg-white group rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                        <div className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-6 flex-1">
                                    <div className="w-14 h-14 bg-gradient-to-br from-[#008080] to-purple-600 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-[#008080] shrink-0 group-hover:scale-105 transition-transform">
                                        {mentor.name.charAt(0)}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-black text-slate-900 group-hover:text-[#008080] transition-colors uppercase italic truncate">{mentor.name}</h3>
                                            <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${mentor.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                                {mentor.status}
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                                            <div className="flex items-center gap-1.5">
                                                <MapPin size={10} className="text-slate-400" />
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{mentor.place || 'Unknown'}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Mail size={10} className="text-slate-400" />
                                                <span className="text-[9px] font-bold text-slate-400">{mentor.email}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Phone size={10} className="text-slate-400" />
                                                <span className="text-[9px] font-bold text-slate-400">{mentor.phone_number}</span>
                                            </div>
                                        </div>

                                        {/* Expand Option Below Name Section */}
                                        <button 
                                            onClick={() => handleViewStudents(mentor)}
                                            className="flex items-center gap-2 mt-3 w-fit group/btn"
                                        >
                                            <div className="flex flex-col items-start">
                                                <span className="text-[10px] font-black text-[#008080] uppercase tracking-widest flex items-center gap-2">
                                                    View {mentor.studentCount} Assigned Students
                                                    <ShieldCheck size={12} className={`transition-all duration-300 ${expandedMentorId === mentor.id ? 'rotate-180 text-purple-600' : 'text-[#008080]'}`} />
                                                </span>
                                                <div className="h-0.5 w-0 group-hover/btn:w-full bg-[#008080] transition-all duration-300"></div>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                                    <button
                                        onClick={() => handleEdit(mentor)}
                                        className="p-3 bg-slate-50 text-white rounded-xl hover:bg-[#008080] hover:text-white transition-all shadow-sm flex items-center gap-2"
                                    >
                                        <Edit2 size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest md:hidden">Edit</span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(mentor.id, mentor.name)}
                                        className="p-3 bg-slate-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm flex items-center gap-2"
                                    >
                                        <Trash2 size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest md:hidden">Delete</span>
                                    </button>
                                </div>
                            </div>

                            {/* Inline Student List Section */}
                            {expandedMentorId === mentor.id && (
                                <div className="mt-8 pt-6 border-t border-slate-50 animate-in slide-in-from-top-4 duration-500">
                                    <div className="flex items-center justify-between mb-4 pl-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-4 bg-[#008080] rounded-full"></div>
                                            <h5 className="text-[11px] font-black text-slate-900 uppercase italic tracking-wider">Assigned Students Registry</h5>
                                        </div>
                                    </div>
                                    
                                    {loadingStudents ? (
                                        <div className="py-10 text-center">
                                            <div className="inline-block w-5 h-5 border-2 border-[#008080]/30 border-t-[#008080] rounded-full animate-spin mb-2"></div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic animate-pulse">Synchronizing student records...</div>
                                        </div>
                                    ) : mentorStudents.length > 0 ? (
                                        <div className="space-y-3">
                                            {/* Table Header for the inline list */}
                                            <div className="hidden lg:grid grid-cols-5 gap-4 px-6 mb-2">
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Student / ID</span>
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center">Faculty</span>
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center">Mentor</span>
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center invisible">Metadata</span>
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-right">Performance Status</span>
                                            </div>
                                            {mentorStudents.map((student) => (
                                                <div key={student.id} className="p-4 bg-slate-50 border border-slate-100 rounded-[2rem] hover:bg-white hover:border-[#008080] hover:shadow-xl transition-all duration-300 group/student">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 items-center gap-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-slate-500 font-black shadow-sm group-hover/student:bg-[#008080] group-hover/student:text-white transition-all shrink-0">
                                                                {student.name.charAt(0)}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="text-[12px] font-black text-slate-900 uppercase italic truncate">{student.name}</h4>
                                                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{student.registration_number || 'REG-PENDING'}</span>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex flex-col lg:items-center">
                                                            <span className="text-[10px] font-black text-slate-900 uppercase truncate">{student.faculty_name || 'Unassigned'}</span>
                                                            <span className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter">Academic Faculty</span>
                                                        </div>

                                                        <div className="flex flex-col lg:items-center">
                                                            <span className="text-[10px] font-black text-slate-900 uppercase truncate">{student.mentor_name || mentor.name}</span>
                                                            <span className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter">Assigned Mentor</span>
                                                        </div>

                                                        <div className="flex flex-col lg:items-center">
                                                            <span className="text-[10px] font-black text-[#008080] uppercase">{student.course}</span>
                                                            <span className="text-[7px] font-bold text-slate-400 uppercase">{student.grade}</span>
                                                        </div>

                                                        <div className="flex flex-col items-end">
                                                            <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm 
                                                                ${student.performance === 'Excellent' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                                                                  student.performance === 'Very Good' ? 'bg-[#008080]/10 text-[#008080] border border-[#008080]' :
                                                                  student.performance === 'Good' ? 'bg-[#008080]/10 text-[#008080] border border-[#008080]' :
                                                                  student.performance === 'Average' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                                  student.performance === 'Needs Improvement' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                                                  'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                                                                {student.performance}
                                                            </div>
                                                            <span className="text-[7px] font-bold text-slate-400 uppercase mt-1 tracking-[0.2em]">Live Analytics: {student.avg_score}%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-10 bg-slate-50/50 rounded-2xl text-center border border-dashed border-slate-200">
                                            <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] italic">No students currently assigned to this mentor</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )) : (
                    <div className="py-20 bg-white rounded-[3rem] border border-slate-100 text-center shadow-sm">
                        <Users size={40} className="mx-auto text-slate-200 mb-4" />
                        <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em]">No mentors matching your search parameters</p>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && editingMentor && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h2 className="text-lg font-black text-slate-900 flex items-center gap-3 italic">
                                <Edit2 size={20} className="text-[#008080]" /> Edit Mentor Profile
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
                                    value={editingMentor.name}
                                    onChange={(e) => setEditingMentor(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-[#008080] focus:border-[#008080] transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                                <input
                                    type="email"
                                    value={editingMentor.email}
                                    onChange={(e) => setEditingMentor(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-[#008080] focus:border-[#008080] transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
                                    <input
                                        type="text"
                                        value={editingMentor.phone_number}
                                        onChange={(e) => setEditingMentor(prev => ({ ...prev, phone_number: e.target.value }))}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-[#008080] focus:border-[#008080] transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Place / Location</label>
                                    <input
                                        type="text"
                                        value={editingMentor.place || ''}
                                        onChange={(e) => setEditingMentor(prev => ({ ...prev, place: e.target.value }))}
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
                                onClick={handleUpdate}
                                className="px-8 py-3.5 bg-[#008080] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#008080]/30 hover:bg-[#008080] hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-2"
                            >
                                <Save size={16} /> Update Profile
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default MentorsList;
