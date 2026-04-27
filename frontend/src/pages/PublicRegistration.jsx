import React, { useState, useEffect } from 'react';
import { User, Users, GraduationCap, Phone, BookOpen, Clock, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const PublicRegistration = () => {
    const [role, setRole] = useState('student'); // student, mentor, faculty
    const [loading, setLoading] = useState(false);
    const [mentors, setMentors] = useState([]);
    const [faculties, setFaculties] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        phone_number: '',
        grade: '',
        subject: '',
        course: '',
        hour: '',
        mentor_id: '',
        faculty_id: '',
        next_installment_date: '',
        time_table: {
            mon: '', tue: '', wed: '', thu: '', fri: '', sat: '', sun: ''
        }
    });

    useEffect(() => {
        if (role === 'student') {
            fetchDropdownData();
        }
    }, [role]);

    const fetchDropdownData = async () => {
        try {
            const [mentorRes, facultyRes] = await Promise.all([
                api.get('/register/mentors'),
                api.get('/register/faculties')
            ]);
            setMentors(mentorRes.data.data);
            setFaculties(facultyRes.data.data);
        } catch (error) {
            console.error("Error fetching dropdowns:", error);
            toast.error("Failed to load mentor/faculty options");
        }
    };

    const handleRoleChange = (newRole) => {
        setRole(newRole);
        setFormData({
            name: '',
            phone_number: '',
            grade: '',
            subject: '',
            course: '',
            hour: '',
            mentor_id: '',
            faculty_id: '',
            next_installment_date: '',
            time_table: {
                mon: '', tue: '', wed: '', thu: '', fri: '', sat: '', sun: ''
            }
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTimetableChange = (day, value) => {
        setFormData(prev => ({
            ...prev,
            time_table: { ...prev.time_table, [day]: value }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let endpoint = `/register/${role}`;
            let payload = { ...formData };

            // Cleanup payload based on role
            if (role === 'mentor' || role === 'faculty') {
                payload = { name: formData.name, phone_number: formData.phone_number };
            }

            const response = await api.post(endpoint, payload);
            if (response.data.success) {
                toast.success(response.data.message);
                // Reset form
                setFormData({
                    name: '',
                    phone_number: '',
                    grade: '',
                    subject: '',
                    course: '',
                    hour: '',
                    mentor_id: '',
                    faculty_id: '',
                    next_installment_date: '',
                    time_table: {
                        mon: '', tue: '', wed: '', thu: '', fri: '', sat: '', sun: ''
                    }
                });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]">
            <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-8 md:p-12">
                <div className="flex flex-col items-center text-center mb-10">
                    <div className="w-16 h-16 bg-[#008080] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-[#008080]/30 mb-6 group transition-transform hover:scale-105">
                        <User size={32} className="group-hover:rotate-12 transition-transform" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Platform Enrollment</h1>
                    <p className="text-slate-500 font-medium">Join the MashMagic EduTech Ecosystem</p>
                </div>

                {/* Role Switcher */}
                <div className="grid grid-cols-3 gap-3 p-1.5 bg-slate-100 rounded-2xl mb-10">
                    {['student', 'mentor', 'faculty'].map((r) => (
                        <button
                            key={r}
                            onClick={() => handleRoleChange(r)}
                            className={`
                                py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all
                                ${role === r
                                    ? 'bg-white text-[#008080] shadow-sm'
                                    : 'text-slate-400 hover:text-slate-600'}
                            `}
                        >
                            {r}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                            <div className="relative">
                                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    className="w-full p-4 pl-12 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:bg-white focus:ring-4 focus:ring-[#008080] focus:border-[#008080] transition-all font-semibold"
                                    placeholder="Enter full name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        {(role === 'mentor' || role === 'faculty') && (
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                <div className="relative">
                                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <input
                                        type="text"
                                        name="phone_number"
                                        required
                                        className="w-full p-4 pl-12 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:bg-white focus:ring-4 focus:ring-[#008080] focus:border-[#008080] transition-all font-semibold"
                                        placeholder="Enter contact number"
                                        value={formData.phone_number}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Student Specific Fields */}
                    {role === 'student' && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Grade / Level</label>
                                    <input
                                        type="text"
                                        name="grade"
                                        required
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:bg-white focus:ring-4 focus:ring-[#008080] focus:border-[#008080] transition-all font-semibold"
                                        placeholder="e.g. 10th Grade"
                                        value={formData.grade}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Core Subject</label>
                                    <input
                                        type="text"
                                        name="subject"
                                        required
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:bg-white focus:ring-4 focus:ring-[#008080] focus:border-[#008080] transition-all font-semibold"
                                        placeholder="e.g. Mathematics"
                                        value={formData.subject}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Course Name</label>
                                    <input
                                        type="text"
                                        name="course"
                                        required
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:bg-white focus:ring-4 focus:ring-[#008080] focus:border-[#008080] transition-all font-semibold"
                                        placeholder="e.g. JEE Main"
                                        value={formData.course}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Allocated Hours</label>
                                    <div className="relative">
                                        <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                        <input
                                            type="text"
                                            name="hour"
                                            required
                                            className="w-full p-4 pl-12 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:bg-white focus:ring-4 focus:ring-[#008080] focus:border-[#008080] transition-all font-semibold"
                                            placeholder="e.g. 40 Hours"
                                            value={formData.hour}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Next Payment</label>
                                    <div className="relative">
                                        <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                        <input
                                            type="date"
                                            name="next_installment_date"
                                            className="w-full p-4 pl-12 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:bg-white focus:ring-4 focus:ring-[#008080] focus:border-[#008080] transition-all font-semibold"
                                            value={formData.next_installment_date}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Mentor</label>
                                    <select
                                        name="mentor_id"
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:bg-white focus:ring-4 focus:ring-[#008080] focus:border-[#008080] transition-all font-semibold"
                                        value={formData.mentor_id}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Choose Mentor</option>
                                        {mentors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Faculty</label>
                                    <select
                                        name="faculty_id"
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:bg-white focus:ring-4 focus:ring-[#008080] focus:border-[#008080] transition-all font-semibold"
                                        value={formData.faculty_id}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Choose Faculty</option>
                                        {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Weekly Time Table */}
                            <div className="flex flex-col gap-4 mt-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Clock size={12} /> Weekly Time Table Settings
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day) => (
                                        <div key={day} className="flex flex-col gap-1">
                                            <span className="text-[8px] font-bold text-slate-400 uppercase ml-1">{day}</span>
                                            <input
                                                type="text"
                                                placeholder="Time"
                                                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:bg-white focus:border-[#008080] font-bold"
                                                value={formData.time_table[day]}
                                                onChange={(e) => handleTimetableChange(day, e.target.value)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`
                            w-full bg-[#008080] text-white p-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest 
                            transition-all shadow-xl shadow-[#008080]/30 flex items-center justify-center gap-3
                            ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#008080] hover:-translate-y-1 active:scale-95'}
                        `}
                    >
                        {loading ? 'Processing...' : `Submit ${role} Registration`}
                        {!loading && <CheckCircle size={20} />}
                    </button>

                    <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        By registering, you agree to MashMagic Terms of Service
                    </p>
                </form>
            </div>
        </div>
    );
};

export default PublicRegistration;
