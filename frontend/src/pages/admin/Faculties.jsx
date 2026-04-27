import React, { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { premiumConfirm } from '../../utils/premiumConfirm';
import { Eye, Edit2, Ban, Trash2, Filter, Download, UserPlus, Search, UserSquare2, GraduationCap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Faculties = () => {
    const { user } = useAuth();
    const isSuperAdmin = user?.role === 'super_admin';
    const [faculties, setFaculties] = useState([]);
    const [filteredFaculties, setFilteredFaculties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFaculty, setSelectedFaculty] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({
        name: '',
        email: '',
        phone_number: '',
        status: '',
        role: 'faculty'
    });

    useEffect(() => {
        fetchFaculties();
    }, []);

    const fetchFaculties = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/faculties');
            const realFaculties = response.data.data;

            setFaculties(realFaculties);
            setFilteredFaculties(realFaculties);
            setLoading(false);
        } catch (error) {
            toast.error("Failed to fetch faculties");
            setLoading(false);
        }
    };

    const handleSearch = (query) => {
        const filtered = faculties.filter(f =>
            f.name?.toLowerCase().includes(query.toLowerCase()) ||
            f.email?.toLowerCase().includes(query.toLowerCase()) ||
            f.phone?.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredFaculties(filtered);
    };

    const handleView = (faculty) => {
        setSelectedFaculty(faculty);
        setIsModalOpen(true);
    };

    const handleEdit = (faculty) => {
        setSelectedFaculty(faculty);
        setEditFormData({
            name: faculty.name,
            email: faculty.email,
            phone_number: faculty.phone || '',
            status: faculty.status,
            role: 'faculty'
        });
        setIsEditModalOpen(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/admin/users/${selectedFaculty.id}`, editFormData);
            toast.success("Faculty updated successfully");
            setIsEditModalOpen(false);
            fetchFaculties();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update faculty");
        }
    };

    const handleApprove = async (faculty) => {
        try {
            await api.put(`/admin/approve/${faculty.id}`);
            toast.success(`Faculty ${faculty.name} approved`);
            fetchFaculties();
        } catch (error) {
            toast.error("Failed to approve faculty");
        }
    };

    const handleBlock = async (faculty) => {
        premiumConfirm(async () => {
            try {
                await api.put(`/admin/block/${faculty.id}`);
                toast.success(`${faculty.name} blocked successfully`);
                fetchFaculties();
            } catch (error) {
                toast.error("Failed to block faculty");
            }
        }, { 
            name: faculty.name, 
            title: 'Block Faculty', 
            message: `Suspending faculty ${faculty.name} will disable their access to students and logs.`,
            type: 'standard'
        });
    };

    const handleDelete = async (faculty) => {
        premiumConfirm(async () => {
            try {
                await api.delete(`/admin/delete/${faculty.id}`);
                toast.success(`Faculty ${faculty.name} deleted`);
                fetchFaculties();
            } catch (error) {
                toast.error("Failed to delete faculty");
            }
        }, { 
            name: faculty.name, 
            title: 'Permanent Deletion', 
            message: `Permanently deleting ${faculty.name}. This will clear their assignment profile.`,
            type: 'danger'
        });
    };

    const columns = [
        { header: 'Faculty Lead', accessor: 'name' },
        { header: 'Email Address', accessor: 'email' },
        { header: 'Direct Contact', accessor: 'phone' },
        { header: 'Mentors Group', accessor: 'mentorsUnder' },
        { header: 'Total Students', accessor: 'studentsUnder' },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => (
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${row.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                    {row.status}
                </span>
            )
        },
    ];

    return (
        <div className="flex flex-col gap-10">
            <div className="flex flex-col mb-4">
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-3 italic">Faculty Administration</h2>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">High-level academic lead governance</p>
            </div>

            <DataTable
                columns={columns}
                data={filteredFaculties}
                loading={loading}
                onSearch={handleSearch}
                onApprove={isSuperAdmin ? handleApprove : undefined}
                onBlock={isSuperAdmin ? handleBlock : undefined}
                searchPlaceholder="Search leads by name or email..."
            />

            {/* Edit Faculty Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Faculty Lead Profile"
                size="md"
            >
                <form onSubmit={handleUpdate} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Full Name</label>
                        <input
                            type="text"
                            className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-[#14B8A6]/5 transition-all"
                            value={editFormData.name}
                            onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                        <input
                            type="email"
                            className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-[#008080] transition-all"
                            value={editFormData.email}
                            onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Phone Number</label>
                        <input
                            type="text"
                            className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-[#008080] transition-all"
                            value={editFormData.phone_number}
                            onChange={(e) => setEditFormData({ ...editFormData, phone_number: e.target.value })}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Account Status</label>
                        <select
                            className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-[#14B8A6]/10 transition-all"
                            value={editFormData.status}
                            onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 mt-8">
                        <button type="button" className="px-8 py-3.5 rounded-2xl border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all" onClick={() => setIsEditModalOpen(false)}>Discard</button>
                        <button type="submit" className="px-10 py-3.5 rounded-2xl bg-gradient-to-br from-[#0F766E] to-[#14B8A6] text-white text-[10px] font-black uppercase tracking-[0.2em] hover:shadow-lg hover:shadow-[#14B8A6]/30 hover:-translate-y-1 transition-all shadow-md shadow-[#14B8A6]/20">Update Leadership Data</button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Academic Leadership Profile"
                size="lg"
            >
                {selectedFaculty && (
                    <div className="flex flex-col gap-10">
                        <div className="flex items-center gap-8 p-8 bg-[#14B8A6]/5 rounded-[32px] border border-[#14B8A6]/10 shadow-[0_10px_30px_rgba(20,184,166,0.05)]">
                            <div className="w-24 h-24 bg-gradient-to-br from-[#0F766E] to-[#14B8A6] text-white rounded-[28px] flex items-center justify-center text-4xl font-black shadow-xl shadow-[#14B8A6]/20">
                                {selectedFaculty.name.charAt(0)}
                            </div>
                            <div className="flex flex-col gap-2">
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none italic">{selectedFaculty.name}</h3>
                                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">{selectedFaculty.email}</p>
                                <div className="mt-3 flex gap-2">
                                    <span className="px-4 py-1.5 bg-[#F59E0B]/10 rounded-xl text-[9px] font-bold text-[#F59E0B] border border-[#F59E0B]/20 uppercase tracking-[0.15em]">
                                        Head Faculty Lead
                                    </span>
                                    <span className="px-4 py-1.5 bg-[#14B8A6]/10 rounded-xl text-[9px] font-bold text-[#14B8A6] border border-[#14B8A6]/20 uppercase tracking-[0.15em]">
                                        Exp: Senior Lead
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                            <div className="p-8 bg-white border border-slate-100 rounded-[32px] flex items-center gap-6 hover:border-[#14B8A6]/20 hover:shadow-lg transition-all group overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-[#14B8A6]/5 rounded-bl-[48px] -mr-8 -mt-8 group-hover:scale-125 transition-transform duration-500"></div>
                                <div className="p-4 bg-[#14B8A6]/5 text-[#14B8A6] rounded-[20px] shadow-sm relative z-10 border border-[#14B8A6]/10">
                                    <UserSquare2 size={24} />
                                </div>
                                <div className="relative z-10">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-2">Mentors Managed</p>
                                    <h4 className="text-3xl font-black text-slate-800 tracking-tighter leading-none">{selectedFaculty.mentorsUnder}</h4>
                                </div>
                            </div>
                            <div className="p-8 bg-white border border-slate-100 rounded-[32px] flex items-center gap-6 hover:border-[#F59E0B]/20 hover:shadow-lg transition-all group overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-[#F59E0B]/5 rounded-bl-[48px] -mr-8 -mt-8 group-hover:scale-125 transition-transform duration-500"></div>
                                <div className="p-4 bg-[#F59E0B]/5 text-[#F59E0B] rounded-[20px] shadow-sm relative z-10 border border-[#F59E0B]/10">
                                    <GraduationCap size={24} />
                                </div>
                                <div className="relative z-10">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-2">Enrolled Students</p>
                                    <h4 className="text-3xl font-black text-slate-800 tracking-tighter leading-none">{selectedFaculty.studentsUnder}</h4>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Assignment Roster</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[...Array(selectedFaculty.mentorsUnder)].map((_, i) => (
                                    <div key={i} className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-2xl hover:border-[#008080] transition-all group">
                                        <span className="text-sm font-bold text-slate-700 group-hover:text-[#008080]">Mentor {String.fromCharCode(65 + i)}</span>
                                        <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-md">Assigned</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-10 border-t border-slate-100/50">
                            <button className="px-8 py-4 rounded-[20px] border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all font-sans" onClick={() => setIsModalOpen(false)}>Exit Dashboard</button>
                            <button className="px-10 py-4 rounded-[20px] bg-gradient-to-br from-[#0F766E] to-[#14B8A6] text-white text-[10px] font-black uppercase tracking-[0.2em] hover:shadow-lg hover:shadow-[#14B8A6]/30 hover:-translate-y-1 transition-all shadow-md shadow-[#14B8A6]/20 font-sans">Allocate Resources</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Faculties;
