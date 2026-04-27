import React, { useState, useEffect, useMemo } from 'react';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { premiumConfirm } from '../../utils/premiumConfirm';
import { Eye, Edit2, Ban, Trash2, Filter, Download, Search, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { sortStudentsByOption } from '../../components/StudentListFilterDropdown';

const Students = () => {
    const { user } = useAuth();
    const isSuperAdmin = user?.role === 'super_admin';
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest'); // 'newest' or 'oldest'

    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({
        name: '',
        grade: '',
        subject: '',
        timetable: '',
        nextInstallment: '',
        status: ''
    });
    const [dailyHours, setDailyHours] = useState([]);

    useEffect(() => {
        fetchStudents();
    }, [searchTerm, sortBy]);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/students?search=${searchTerm}&sortBy=${sortBy}`);
            const realStudents = response.data.data;

            setStudents(realStudents);
            setFilteredStudents(realStudents);
            setLoading(false);
        } catch (error) {
            toast.error("Failed to fetch students");
            setLoading(false);
        }
    };

    const handleSearch = (query) => {
        setSearchTerm(query);
    };

    const handleView = async (student) => {
        setSelectedStudent(student);
        setDailyHours([]);
        setIsModalOpen(true);
        try {
            const res = await api.get(`/admin/daily-hours/${student.id}`);
            if (res.data.success) {
                setDailyHours(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch daily hours");
        }
    };

    const handleEdit = (student) => {
        setSelectedStudent(student);
        setEditFormData({
            name: student.name,
            grade: student.grade,
            subject: student.subject,
            timetable: student.timetable,
            nextInstallment: student.nextInstallment ? student.nextInstallment.split('T')[0] : '',
            status: student.status
        });
        setIsEditModalOpen(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put(`/admin/students/${selectedStudent.id}`, editFormData);
            if (res.data.success) {
                toast.success("Student updated successfully");
                setIsEditModalOpen(false);
                fetchStudents();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update student");
        }
    };

    const handleApprove = async (student) => {
        try {
            await api.put(`/admin/approve/${student.id}`, { role: 'student' });
            toast.success(`${student.name} approved successfully`);
            fetchStudents(); // Refresh list
        } catch (error) {
            toast.error("Failed to approve student");
        }
    };

    const handleBlock = async (student) => {
        premiumConfirm(async () => {
            try {
                await api.put(`/admin/block/${student.id}`, { role: 'student' });
                toast.success(`${student.name} blocked successfully`);
                fetchStudents();
            } catch (error) {
                toast.error("Failed to block student");
            }
        }, { 
            name: student.name, 
            title: 'Block Access', 
            message: `Suspending ${student.name} will restrict their dashboard access. Continue?`,
            type: 'standard'
        });
    };

    const handleDelete = async (student) => {
        premiumConfirm(async () => {
            try {
                await api.delete(`/admin/delete/${student.id}?role=student`);
                toast.success(`${student.name} deleted successfully`);
                fetchStudents();
            } catch (error) {
                toast.error("Failed to delete student");
            }
        }, { 
            name: student.name, 
            title: 'Permanent Deletion', 
            message: `Deleting student ${student.name} is a permanent action. All profile data will legacy.`,
            type: 'danger'
        });
    };

    const columns = [
        {
            header: 'Reg #',
            accessor: 'registration_number',
            render: (row) => <span className="font-mono text-[10px] font-black">{row.registration_number || '---'}</span>
        },
        {
            header: 'Name',
            accessor: 'name',
            render: (row) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <span className="font-bold">{row.name}</span>
                        {/* Student Badge Display */}
                        {row.badge === 'Gold' && <span title="Mentorship Plan" className="cursor-help">🥇</span>}
                        {row.badge === 'Silver' && <span title="Tuition Plan" className="cursor-help">🥈</span>}
                        {row.badge === 'Diamond' && <span title="Mentorship & Tuition Plan" className="cursor-help">💎</span>}
                        
                        {row.course_completed === 1 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200 text-[9px] font-black uppercase tracking-widest whitespace-nowrap">
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                Course Completed
                            </span>
                        )}
                    </div>
                </div>
            )
        },
        { header: 'Email', accessor: 'email' },
        { header: 'Grade', accessor: 'grade' },
        { header: 'Mentor', accessor: 'mentor' },
        { header: 'Faculty', accessor: 'faculty' },
        {
            header: 'Status Pulse', accessor: 'status', render: (row) => (
                <span className={`px-6 py-2.5 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] shadow-sm border transition-all hover:scale-105 active:scale-95 ${row.status === 'active' 
                    ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20' 
                    : 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20 animate-pulse'}`}>
                    {row.status}
                </span>
            )
        },
    ];

    return (
        <div className="flex flex-col gap-10 pb-10">
            <div className="bg-white/70 backdrop-blur-xl p-12 rounded-[40px] border border-white/60 shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="text-center md:text-left">
                    <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none mb-3 italic">Student Enrollment</h2>
                    <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.25em] flex items-center justify-center md:justify-start gap-3 mt-1">
                        <span className="w-2 h-2 rounded-full bg-[#14B8A6] animate-pulse shadow-[0_0_10px_rgba(20,184,166,0.5)]"></span>
                        Cross-functional Academic Database Nexus
                    </p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-5">
                    <div className="flex items-center gap-4 bg-slate-50/50 px-8 py-5 rounded-[24px] border border-slate-100/50 shadow-inner group">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic leading-none whitespace-nowrap">Sort Engine</span>
                        <div className="w-px h-10 bg-slate-200"></div>
                        <select 
                            value={sortBy} 
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-transparent border-none text-xs font-black uppercase tracking-[0.1em] text-slate-800 outline-none focus:ring-0 cursor-pointer italic"
                        >
                            <option value="newest">Latest Optimized</option>
                            <option value="oldest">Legacy Priority</option>
                        </select>
                    </div>
            </div>
            </div>

            <DataTable
                columns={columns}
                data={useMemo(() => sortStudentsByOption(filteredStudents, sortBy), [filteredStudents, sortBy])}
                loading={loading}
                onSearch={handleSearch}
                onApprove={isSuperAdmin ? handleApprove : undefined}
                onBlock={isSuperAdmin ? handleBlock : undefined}
                searchPlaceholder="Search by name, email or reg #"
            />

            {/* Edit Student Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Student Information"
                size="lg"
            >
                <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Full Name</label>
                        <input
                            type="text"
                            className="p-5 bg-slate-50/50 border border-slate-100 rounded-[20px] text-sm font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-[#14B8A6]/5 focus:border-[#14B8A6]/20 transition-all"
                            value={editFormData.name}
                            onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Grade</label>
                        <input
                            type="text"
                            className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-[#008080] transition-all"
                            value={editFormData.grade}
                            onChange={(e) => setEditFormData({ ...editFormData, grade: e.target.value })}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Subject</label>
                        <input
                            type="text"
                            className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-[#008080] transition-all"
                            value={editFormData.subject}
                            onChange={(e) => setEditFormData({ ...editFormData, subject: e.target.value })}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Next Installment</label>
                        <input
                            type="date"
                            className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-[#008080] transition-all"
                            value={editFormData.nextInstallment}
                            onChange={(e) => setEditFormData({ ...editFormData, nextInstallment: e.target.value })}
                        />
                    </div>
                    <div className="col-span-2 flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Status</label>
                        <select
                            className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-[#008080] transition-all"
                            value={editFormData.status}
                            onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="pending">Pending</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                    <div className="col-span-2 flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Timetable Summary</label>
                        <textarea
                            className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-[#008080] transition-all min-h-[100px]"
                            value={editFormData.timetable}
                            onChange={(e) => setEditFormData({ ...editFormData, timetable: e.target.value })}
                        />
                    </div>
                    <div className="col-span-2 flex justify-end gap-3 pt-8 pb-4">
                        <button type="button" className="px-8 py-4 rounded-[18px] border border-slate-100 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all font-sans" onClick={() => setIsEditModalOpen(false)}>Abort Change</button>
                        <button type="submit" className="px-10 py-4 rounded-[18px] bg-gradient-to-br from-[#0F766E] to-[#14B8A6] text-white text-[11px] font-black uppercase tracking-[0.2em] hover:shadow-lg hover:shadow-[#14B8A6]/30 hover:-translate-y-1 transition-all shadow-md shadow-[#14B8A6]/20 font-sans">Commit Data Refresh</button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Student Academic Profile"
                size="lg"
            >
                {selectedStudent && (
                    <div className="flex flex-col gap-10">
                        <div className="flex items-center gap-8 p-8 bg-[#14B8A6]/5 rounded-[32px] border border-[#14B8A6]/10 shadow-[0_10px_30px_rgba(20,184,166,0.05)]">
                            <div className="w-24 h-24 bg-gradient-to-br from-[#0F766E] to-[#14B8A6] text-white rounded-[28px] flex items-center justify-center text-4xl font-black shadow-xl shadow-[#14B8A6]/20 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                                <span className="relative z-10">{selectedStudent.name.charAt(0)}</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{selectedStudent.name}</h3>
                                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{selectedStudent.email || 'System user without email'}</p>
                                <div className="mt-3 flex items-center gap-3">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest border-2 ${selectedStudent.status === 'active' ? 'border-emerald-100/50 bg-emerald-100/30 text-emerald-600' : 'border-rose-100/50 bg-rose-100/30 text-rose-600'}`}>
                                        PROTOCOL: {selectedStudent.status.toUpperCase()}
                                    </span>
                                    <span className="w-2 h-2 rounded-full bg-slate-200"></span>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedStudent.registration_number}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <InfoGroup label="Current Grade" value={selectedStudent.grade} />
                            <InfoGroup label="Subject Focus" value={selectedStudent.subject} />
                            <InfoGroup label="Academic Mentor" value={selectedStudent.mentor} />
                            <InfoGroup label="Lead Faculty" value={selectedStudent.faculty} />
                            <InfoGroup label="Learning Timetable" value={selectedStudent.timetable} />
                            <InfoGroup label="Next Payment Due" value={selectedStudent.nextInstallment} highlight />
                        </div>

                        <div className="mt-2 border-t border-slate-100 pt-6">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Daily Logged Hours (Mentor)</h4>
                            <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                                {dailyHours.length > 0 ? dailyHours.map((log) => (
                                    <div key={log.id} className="flex justify-between items-center bg-white p-4 rounded-[18px] border border-slate-100/50 shadow-sm hover:border-[#14B8A6]/20 transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#14B8A6]"></div>
                                            <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
                                        <span className="text-sm font-black text-[#14B8A6] bg-[#14B8A6]/5 px-3 py-1 rounded-full">{log.hours} <span className="text-[10px] uppercase ml-0.5">Hrs</span></span>
                                    </div>
                                )) : (
                                    <p className="text-sm text-slate-400 font-medium italic">No hours logged yet.</p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-10 border-t border-slate-100/50">
                            <button className="px-8 py-4 rounded-[18px] border border-slate-100 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all" onClick={() => setIsModalOpen(false)}>Exit Dashboard</button>
                            <button 
                                className="px-10 py-4 rounded-[18px] bg-gradient-to-br from-[#0F766E] to-[#14B8A6] text-white text-[11px] font-black uppercase tracking-[0.2em] hover:shadow-lg hover:shadow-[#14B8A6]/30 hover:-translate-y-1 transition-all shadow-md shadow-[#14B8A6]/20"
                                onClick={() => handleEdit(selectedStudent)}
                            >
                                Reconfigure Profile
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

const InfoGroup = ({ label, value, highlight }) => (
    <div className="flex flex-col gap-2 p-6 bg-slate-50/50 rounded-[24px] border border-slate-100 hover:border-[#14B8A6]/30 hover:bg-white hover:shadow-[0_10px_20px_rgba(0,0,0,0.03)] transition-all group overflow-hidden relative">
        <div className={`absolute top-0 right-0 w-12 h-12 bg-[#14B8A6]/5 rounded-bl-[24px] transition-all duration-500 scale-0 group-hover:scale-100`}></div>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-[#14B8A6] transition-colors">{label}</label>
        <p className={`text-sm font-bold leading-relaxed ${highlight ? 'text-[#14B8A6]' : 'text-slate-800'}`}>{value || '---'}</p>
    </div>
);

export default Students;
