import React, { useState, useEffect, useMemo } from 'react';
import {
    Users, Search, Filter, Edit2, Trash2, X, Save,
    GraduationCap, BookOpen, Clock, Activity, Calendar
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import StudentListFilterDropdown, { sortStudentsByOption } from '../../components/StudentListFilterDropdown';
import { premiumConfirm } from '../../utils/premiumConfirm';

const StudentsList = ({ role = 'academic_head' }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCourse, setFilterCourse] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

    // Base API path based on role
    const apiPath = role === 'mentor_head' ? '/mentor-head' : '/academic-head';

    // Edit Modal States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);

    const coursesList = ["Mission X", "Classmate", "Crash 45", "Bright Bridge", "Magic Revision"];

    useEffect(() => {
        fetchStudents();
    }, [role, searchTerm, sortBy]);

    const fetchStudents = async () => {
        try {
            const res = await api.get(`${apiPath}/students-all?search=${searchTerm}&sortBy=${sortBy}`);
            if (res.data.success) {
                setStudents(res.data.data);
            }
        } catch (error) {
            toast.error("Failed to load students directory");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (student) => {
        setEditingStudent({ ...student });
        setIsEditModalOpen(true);
    };

    const handleUpdate = async () => {
        try {
            const res = await api.put(`${apiPath}/students/${editingStudent.id}`, editingStudent);
            if (res.data.success) {
                toast.success("Student profile updated");
                setIsEditModalOpen(false);
                fetchStudents();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Update failed");
        }
    };

    const handleDelete = async (studentParam) => {
        const id = typeof studentParam === 'object' ? studentParam.id : studentParam;
        const name = typeof studentParam === 'object' ? studentParam.name : 'this student';

        premiumConfirm(async () => {
            try {
                const res = await api.delete(`${apiPath}/students/${id}`);
                if (res.data.success) {
                    toast.success("Student record deleted");
                    fetchStudents();
                }
            } catch (error) {
                toast.error(error.response?.data?.message || "Delete failed");
            }
        }, {
            name: name,
            title: 'Delete Student Record',
            message: `Are you sure you want to permanently purge ${name}'s record from the system?`,
            type: 'danger'
        });
    };

    const filteredStudents = useMemo(() => {
        const filtered = students.filter(s => {
            const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (s.registration_number && s.registration_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
                s.grade.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCourse = filterCourse === 'all' || s.course === filterCourse;
            return matchesSearch && matchesCourse;
        });
        return sortStudentsByOption(filtered, sortBy);
    }, [students, searchTerm, filterCourse, sortBy]);

    if (loading) return <div className="p-20 text-center font-black text-slate-400 animate-pulse">SYNCING STUDENT RECORDS...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Student Directory</h2>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                        <GraduationCap size={14} className="text-[#008080]" />
                        Comprehensive database of all enrolled students across all courses and mentors
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
                    <div className="relative group flex-1 md:flex-none">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#008080] transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="SEARCH BY NAME OR REG #..."
                            className="pl-14 pr-8 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold uppercase tracking-[0.1em] focus:ring-4 ring-[#008080]/10 w-full md:w-80 shadow-sm transition-all outline-none focus:bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        value={filterCourse}
                        onChange={(e) => setFilterCourse(e.target.value)}
                        className="px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 outline-none focus:ring-4 ring-[#008080]/10 transition-all cursor-pointer shadow-sm"
                    >
                        <option value="all">All Courses</option>
                        {coursesList.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <StudentListFilterDropdown value={sortBy} onChange={setSortBy} />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Information</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Course & Grade</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mentor & Faculty</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                                <tr key={student.id} className="hover:bg-[#008080]/10/20 transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center text-slate-600 font-black shadow-inner group-hover:from-[#008080] group-hover:to-[#008080] group-hover:text-white transition-all transform group-hover:scale-110">
                                                {student.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <div className="text-sm font-black text-slate-900 group-hover:text-[#008080] transition-colors uppercase italic flex-shrink-0">{student.name}</div>
                                                    
                                                    {/* Student Badge System */}
                                                    {student.badge === 'Gold' && <span title="Mentorship Plan" className="text-lg cursor-help">🥇</span>}
                                                    {student.badge === 'Silver' && <span title="Tuition Plan" className="text-lg cursor-help">🥈</span>}
                                                    {student.badge === 'Diamond' && <span title="Mentorship & Tuition Plan" className="text-lg cursor-help">💎</span>}
                                                    
                                                    {student.course_completed === 1 && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200 text-[9px] font-black uppercase tracking-widest whitespace-nowrap">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                                            Course Completed
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                                    Joined {new Date(student.created_at).toLocaleDateString()}
                                                    {student.registration_number && <span className="ml-2 pl-2 border-l border-slate-200">Reg: <span className="text-slate-900 font-black">{student.registration_number}</span></span>}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-slate-700 uppercase tracking-widest">{student.course}</span>
                                            <span className="text-[10px] font-bold text-[#008080] uppercase mt-0.5">{student.grade}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#008080]"></div>
                                                <span className="text-[10px] font-black text-slate-500 uppercase">Mentor: {student.mentor_name || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                                <span className="text-[10px] font-black text-slate-500 uppercase">Faculty: {student.faculty_name || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(student)}
                                                className="p-2.5 bg-white border border-slate-200 rounded-xl text-[#008080] hover:bg-[#008080]/10 transition-all shadow-sm"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(student)}
                                                className="p-2.5 bg-white border border-slate-200 rounded-xl text-rose-600 hover:bg-rose-50 transition-all shadow-sm"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="px-8 py-20 text-center">
                                        <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em]">No students found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && editingStudent && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h2 className="text-lg font-black text-slate-900 flex items-center gap-3 italic">
                                <Edit2 size={20} className="text-[#008080]" /> Edit Student Record
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
                                    value={editingStudent.name}
                                    onChange={(e) => setEditingStudent(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-[#008080] focus:border-[#008080] transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Grade</label>
                                    <input
                                        type="text"
                                        value={editingStudent.grade}
                                        onChange={(e) => setEditingStudent(prev => ({ ...prev, grade: e.target.value }))}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-[#008080] focus:border-[#008080] transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Course</label>
                                    <select
                                        value={editingStudent.course}
                                        onChange={(e) => setEditingStudent(prev => ({ ...prev, course: e.target.value }))}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-[#008080] focus:border-[#008080] transition-all appearance-none"
                                    >
                                        {coursesList.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Subject</label>
                                <input
                                    type="text"
                                    value={editingStudent.subject || ''}
                                    onChange={(e) => setEditingStudent(prev => ({ ...prev, subject: e.target.value }))}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-[#008080] focus:border-[#008080] transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={editingStudent.email || ''}
                                        onChange={(e) => setEditingStudent(prev => ({ ...prev, email: e.target.value }))}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-[#008080] focus:border-[#008080] transition-all"
                                        placeholder="Add Email"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">New Password</label>
                                    <input
                                        type="password"
                                        value={editingStudent.password || ''}
                                        onChange={(e) => setEditingStudent(prev => ({ ...prev, password: e.target.value }))}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-[#008080] focus:border-[#008080] transition-all"
                                        placeholder="Update Password"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Google Meet Link</label>
                                <input
                                    type="url"
                                    value={editingStudent.meeting_link || ''}
                                    onChange={(e) => setEditingStudent(prev => ({ ...prev, meeting_link: e.target.value }))}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-[#008080] focus:border-[#008080] transition-all"
                                    placeholder="https://meet.google.com/..."
                                />
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
                                <Save size={16} /> Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentsList;
