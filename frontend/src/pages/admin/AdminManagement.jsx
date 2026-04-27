import React, { useState, useEffect } from 'react';
import {
    Shield,
    UserPlus,
    Search,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    Loader2,
    ShieldCheck,
    Mail,
    Phone,
    Lock,
    User
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';
import { premiumConfirm } from '../../utils/premiumConfirm';

const AdminManagement = () => {
    const [subAdmins, setSubAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone_number: '',
        password: '',
        status: 'active',
        permissions: {}
    });
    const [fullControl, setFullControl] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const permissionOptions = [
        { key: 'dashboard', label: 'Global Dashboard' },
        { key: 'admins', label: 'Sub-Admin Management' },
        { key: 'approvals', label: 'Registration Approvals' },
        { key: 'students', label: 'Student Management' },
        { key: 'mentors', label: 'Mentor Management' },
        { key: 'faculties', label: 'Faculty Management' },
        { key: 'tasks', label: 'Task Management System' },
        { key: 'logs', label: 'System Interaction Logs' },
        { key: 'monitoring', label: 'Live Monitoring' }
    ];

    useEffect(() => {
        fetchSubAdmins();
    }, []);

    const fetchSubAdmins = async () => {
        try {
            const res = await api.get('/admin/sub-admins');
            if (res.data.success) {
                setSubAdmins(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching sub-admins:', error);
            toast.error("Failed to load admin accounts");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setEditingAdmin(null);
        setFormData({
            name: '',
            email: '',
            phone_number: '',
            password: '',
            status: 'active',
            permissions: {}
        });
        setFullControl(false);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (admin) => {
        setEditingAdmin(admin);
        const perms = admin.permissions ? (typeof admin.permissions === 'string' ? JSON.parse(admin.permissions) : admin.permissions) : {};
        setFormData({
            name: admin.name,
            email: admin.email,
            phone_number: admin.phone_number || '',
            password: '', 
            status: admin.status,
            permissions: perms
        });
        
        // Check if all permissions are true
        const isFull = permissionOptions.every(opt => perms[opt.key]);
        setFullControl(isFull);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingAdmin) {
                await api.put(`/admin/sub-admins/${editingAdmin.id}`, formData);
                toast.success("Sub Admin updated successfully");
            } else {
                await api.post('/admin/sub-admins', formData);
                toast.success("Sub Admin created successfully");
            }
            setIsModalOpen(false);
            fetchSubAdmins();
        } catch (error) {
            toast.error(error.response?.data?.message || "Operation failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id, name) => {
        premiumConfirm(async () => {
            try {
                await api.delete(`/admin/sub-admins/${id}`);
                toast.success("Sub Admin deleted successfully");
                fetchSubAdmins();
            } catch (error) {
                toast.error("Failed to delete account");
            }
        }, { 
            name: name,
            title: 'Delete Admin Account', 
            message: `You are about to permanently delete the admin account for ${name}. This will revoke all their management privileges.`,
            type: 'danger'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-[#008080] animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-10 pb-10">
            <div className="bg-white/70 backdrop-blur-xl p-12 rounded-[40px] border border-white/60 shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="w-20 h-20 bg-[#14B8A6] rounded-[28px] shadow-2xl shadow-[#14B8A6]/30 flex items-center justify-center group hover:rotate-12 transition-transform duration-700">
                            <ShieldCheck className="text-white" size={36} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none mb-3 italic">Administrative Authority</h2>
                            <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.25em] flex items-center justify-center md:justify-start gap-3 mt-1">
                                <div className="w-2 h-2 rounded-full bg-[#14B8A6] animate-pulse"></div>
                                System Access Control & Protocol Management
                            </p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="bg-gradient-to-br from-slate-800 to-slate-900 text-[#14B8A6] px-10 py-6 rounded-[24px] font-black text-[11px] uppercase tracking-[0.3em] flex items-center gap-4 hover:shadow-2xl hover:shadow-slate-900/20 hover:-translate-y-1 transition-all group"
                >
                    <UserPlus size={20} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
                    <span>Authorize Sub-Admin</span>
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                                <tr className="bg-slate-50/40 border-b border-slate-100/50">
                                    <th className="p-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Authority Profile</th>
                                    <th className="p-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Contact Vector</th>
                                    <th className="p-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Access State</th>
                                    <th className="p-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Activation Epoch</th>
                                    <th className="p-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] italic text-right">Verification Protocol</th>
                                </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {subAdmins.map((admin) => (
                                <tr key={admin.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="p-8">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 bg-gradient-to-br from-[#14B8A6] to-slate-900 rounded-[20px] flex items-center justify-center text-white font-black shadow-xl shadow-[#14B8A6]/20 transition-transform group-hover:scale-110 group-hover:rotate-6">
                                                {admin.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <span className="text-lg font-black text-slate-800 block tracking-tighter leading-none italic uppercase group-hover:text-[#14B8A6] transition-colors mb-2">{admin.name}</span>
                                                <div className="flex items-center gap-2">
                                                    <Lock size={12} className="text-[#14B8A6] opacity-60" />
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Management Node</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-bold text-slate-600">{admin.email}</span>
                                            <span className="text-xs font-bold text-slate-400">{admin.phone_number || 'No Phone'}</span>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <span className={`px-6 py-2.5 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm transition-all group-hover:scale-105 ${admin.status === 'active'
                                                ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20'
                                                : 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20'
                                            }`}>
                                            {admin.status}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <span className="text-xs font-bold text-slate-500">
                                            {admin.created_at ? new Date(admin.created_at).toLocaleDateString('en-GB') : 'N/A'}
                                        </span>
                                    </td>
                                    <td className="p-8 text-right">
                                        <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                                            <button
                                                onClick={() => handleOpenEdit(admin)}
                                                className="w-12 h-12 rounded-[18px] flex items-center justify-center text-slate-300 hover:text-[#14B8A6] hover:bg-[#14B8A6]/10 transition-all border border-transparent hover:border-[#14B8A6]/20 active:scale-90"
                                            >
                                                <Edit size={22} strokeWidth={2.5} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(admin.id, admin.name)}
                                                className="w-12 h-12 rounded-[18px] flex items-center justify-center text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all border border-transparent hover:border-rose-100 active:scale-95"
                                            >
                                                <Trash2 size={22} strokeWidth={2.5} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {subAdmins.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                                <Shield size={32} />
                                            </div>
                                            <h3 className="text-lg font-black text-slate-900">No Sub Admins Found</h3>
                                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Create your first sub admin to start delegating work.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingAdmin ? "Edit Sub Admin" : "Create New Sub Admin"}
            >
                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 w-full max-w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                            <div className="relative group">
                                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#008080] transition-colors" />
                                <input
                                    type="text"
                                    required
                                    className="w-full p-4 pl-12 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#008080] focus:border-[#008080] transition-all font-bold tracking-wide"
                                    placeholder="Enter full name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#008080] transition-colors" />
                                <input
                                    type="email"
                                    required
                                    disabled={!!editingAdmin}
                                    className="w-full p-4 pl-12 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#008080] focus:border-[#008080] transition-all font-bold tracking-wide disabled:opacity-50"
                                    placeholder="email@mashmagic.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                            <div className="relative group">
                                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#008080] transition-colors" />
                                <input
                                    type="tel"
                                    className="w-full p-4 pl-12 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#008080] focus:border-[#008080] transition-all font-bold tracking-wide"
                                    placeholder="Enter mobile number"
                                    value={formData.phone_number}
                                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Status</label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, status: 'active' })}
                                    className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${formData.status === 'active'
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100'
                                        : 'bg-slate-50 text-slate-400 border border-slate-100'
                                        }`}
                                >
                                    <CheckCircle size={14} />
                                    Active
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, status: 'inactive' })}
                                    className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${formData.status === 'inactive'
                                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-100'
                                        : 'bg-slate-50 text-slate-400 border border-slate-100'
                                        }`}
                                >
                                    <XCircle size={14} />
                                    Inactive
                                </button>
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                {editingAdmin ? "Reset Password (Leave blank to keep)" : "Password"}
                            </label>
                            <div className="relative group">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#008080] transition-colors" />
                                <input
                                    type="password"
                                    required={!editingAdmin}
                                    className="w-full p-4 pl-12 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#008080] focus:border-[#008080] transition-all font-bold tracking-wide"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Permissions Header */}
                        <div className="md:col-span-2 pt-4 border-t border-slate-100 italic flex items-center justify-between">
                            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Authority Delegation & Permissions</h4>
                            <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Full Access Control</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newVal = !fullControl;
                                        setFullControl(newVal);
                                        const newPerms = {};
                                        permissionOptions.forEach(opt => newPerms[opt.key] = newVal);
                                        setFormData({ ...formData, permissions: newPerms });
                                    }}
                                    className={`w-10 h-5 rounded-full relative transition-all duration-300 ${fullControl ? 'bg-[#008080]' : 'bg-slate-300'}`}
                                >
                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${fullControl ? 'left-6' : 'left-1'}`}></div>
                                </button>
                            </div>
                        </div>

                        {/* Permissions Grid */}
                        <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {permissionOptions.map((opt) => (
                                <button
                                    key={opt.key}
                                    type="button"
                                    onClick={() => {
                                        const newPerms = { ...formData.permissions, [opt.key]: !formData.permissions[opt.key] };
                                        setFormData({ ...formData, permissions: newPerms });
                                        // Update general full control toggle check
                                        setFullControl(permissionOptions.every(o => newPerms[o.key]));
                                    }}
                                    className={`p-3 rounded-xl border text-[10px] font-bold text-left transition-all flex items-center gap-3 ${formData.permissions[opt.key]
                                            ? 'bg-[#008080]/10 border-[#008080]/20 text-[#008080]'
                                            : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                                        }`}
                                >
                                    <div className={`w-3 h-3 rounded-full border-2 transition-all ${formData.permissions[opt.key] ? 'bg-[#008080] border-[#008080]' : 'border-slate-200'}`}></div>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 p-5 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-[2] p-5 bg-[#008080] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#008080] transition-all shadow-xl shadow-[#008080]/30 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <span>{editingAdmin ? "Update Admin" : "Authorize Creation"}</span>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AdminManagement;
