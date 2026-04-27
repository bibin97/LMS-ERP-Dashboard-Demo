import React, { useState, useEffect } from 'react';
import { UserPlus, User, GraduationCap, MapPin, Mail, Phone, Lock, BookOpen, Clock, Calendar, CheckCircle, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Registrations = () => {
    const [activeTab, setActiveTab] = useState('student');
    const [loading, setLoading] = useState(false);

    // Dropdowns data
    const [mentors, setMentors] = useState([]);
    const [faculties, setFaculties] = useState([]);

    // Forms data
    const [studentForm, setStudentForm] = useState({
        name: '', 
        email: '',
        password: '',
        confirmPassword: '',
        grade: '', 
        mentorId: '', 
        course: '', 
        hour: '', 
        nextInstallmentDate: '', 
        admissionType: 'new',
        registrationNumber: '',
        meetingLink: '',
        facultyHourlyRate: '',
        enrollmentType: 'mentorship'
    });

    const [selectedSubjects, setSelectedSubjects] = useState([
        { subject: '', facultyId: '', facultyName: '' }
    ]);

    const addSubjectRow = () => {
        setSelectedSubjects([...selectedSubjects, { subject: '', facultyId: '', facultyName: '' }]);
    };

    const removeSubjectRow = (index) => {
        if (selectedSubjects.length > 1) {
            const newSubjects = [...selectedSubjects];
            newSubjects.splice(index, 1);
            setSelectedSubjects(newSubjects);
        }
    };

    const handleSubjectChange = (index, field, value) => {
        const newSubjects = [...selectedSubjects];
        if (field === 'facultyId') {
            const faculty = faculties.find(f => f.id.toString() === value);
            newSubjects[index].facultyId = value;
            newSubjects[index].facultyName = faculty ? faculty.name : '';
        } else {
            newSubjects[index][field] = value;
        }
        setSelectedSubjects(newSubjects);
    };

    const [facultyForm, setFacultyForm] = useState({
        name: '', email: '', phone_number: '', place: '', password: '', confirmPassword: ''
    });


    // Courses allowed
    const coursesList = ["Mission X", "Classmate", "Crash 45", "Bright Bridge", "Magic Revision"];

    useEffect(() => {
        fetchDropdowns();
    }, []);

    const fetchDropdowns = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await api.get('/academic-head/dropdowns', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setMentors(res.data.data.mentors || []);
                setFaculties(res.data.data.faculties || []);
            }
        } catch (error) {
            console.error("Failed to fetch dropdowns:", error);
        }
    };

    const handleStudentChange = (e) => setStudentForm({ ...studentForm, [e.target.name]: e.target.value });
    const handleFacultyChange = (e) => setFacultyForm({ ...facultyForm, [e.target.name]: e.target.value });

    const submitStudent = async (e) => {
        e.preventDefault();
        
        if (studentForm.password && studentForm.password !== studentForm.confirmPassword) {
            return toast.error("Passwords do not match!");
        }

        setLoading(true);
        try {
            const res = await api.post('/academic-head/register-student', {
                ...studentForm,
                selectedSubjects
            });
            if (res.data.success) {
                toast.success('Student Registered Successfully!');
                setStudentForm({ 
                    name: '', email: '', password: '', confirmPassword: '',
                    grade: '', mentorId: '', course: '', hour: '', 
                    nextInstallmentDate: '', admissionType: 'new',
                    registrationNumber: '', meetingLink: '', facultyHourlyRate: '', 
                    enrollmentType: 'mentorship'
                });
                setSelectedSubjects([{ subject: '', facultyId: '', facultyName: '' }]);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to register student');
        } finally {
            setLoading(false);
        }
    };

    const submitFaculty = async (e) => {
        e.preventDefault();
        if (facultyForm.password && facultyForm.password !== facultyForm.confirmPassword) {
            return toast.error("Passwords do not match!");
        }
        setLoading(true);
        try {
            const res = await api.post('/academic-head/register-faculty', facultyForm);
            if (res.data.success) {
                toast.success('Faculty Account Created Successfully!');
                setFacultyForm({ name: '', email: '', phone_number: '', place: '', password: '', confirmPassword: '' });
                fetchDropdowns();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to register faculty');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="max-w-4xl mx-auto px-4 md:px-0">
            {/* Header */}
            <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-slate-100 mb-6 md:mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase italic">Onboarding Gateway</h1>
                    <p className="text-slate-500 font-bold text-[9px] md:text-[10px] uppercase tracking-widest mt-1">Unified registration portal for students and faculty</p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-[#008080]/10 rounded-2xl flex items-center justify-center text-[#008080] rotate-3 shrink-0">
                    <UserPlus size={20} className="md:w-6 md:h-6" />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 bg-slate-200/50 p-1.5 rounded-2xl w-fit mx-auto shadow-inner">
                {[
                    { id: 'student', label: 'Student' },
                    { id: 'faculty', label: 'Faculty Signup' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === tab.id
                            ? 'bg-white text-[#008080] shadow-sm scale-100'
                            : 'text-slate-500 hover:text-slate-800 scale-95'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Formal Registration Container */}
            <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-[0_10px_40px_rgba(0,128,128,0.05)] border border-slate-100">
                {activeTab === 'student' && (
                    <form onSubmit={submitStudent} className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-6">
                            <div className="w-8 h-8 bg-[#008080] text-white rounded-lg flex items-center justify-center">
                                <GraduationCap size={18} />
                            </div>
                            <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest">Normal Registration</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Student Name</label>
                                <div className="relative group">
                                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#008080] transition-colors" />
                                    <input type="text" name="name" required value={studentForm.name} onChange={handleStudentChange} className="w-full p-3 pl-12 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#008080] font-bold" placeholder="Full Name" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address (Optional)</label>
                                <div className="relative group">
                                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#008080] transition-colors" />
                                    <input type="email" name="email" value={studentForm.email} onChange={handleStudentChange} className="w-full p-3 pl-12 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#008080] font-bold" placeholder="Email Address (Optional)" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Login Password (Optional)</label>
                                <div className="relative group">
                                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#008080] transition-colors" />
                                    <input type="password" name="password" value={studentForm.password} onChange={handleStudentChange} className="w-full p-3 pl-12 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#008080] font-bold" placeholder="••••••••" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Password (Optional)</label>
                                <div className="relative group">
                                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#008080] transition-colors" />
                                    <input type="password" name="confirmPassword" value={studentForm.confirmPassword} onChange={handleStudentChange} className="w-full p-3 pl-12 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#008080] font-bold" placeholder="••••••••" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Grade (1-12)</label>
                                <select name="grade" required value={studentForm.grade} onChange={handleStudentChange} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#008080] font-bold appearance-none">
                                    <option value="" disabled>Select Grade</option>
                                    {[...Array(12)].map((_, i) => (
                                        <option key={i + 1} value={`Class ${i + 1}`}>Class {i + 1}</option>
                                    ))}
                                </select>
                             </div>
                             <div className="flex flex-col gap-2">
                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Admission Type</label>
                                 <select name="admissionType" required value={studentForm.admissionType} onChange={handleStudentChange} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#008080] font-bold appearance-none">
                                     <option value="new">New Student (Requires Onboarding)</option>
                                     <option value="existing">Existing Student</option>
                                 </select>
                             </div>
                             <div className="flex flex-col gap-2">
                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Course</label>
                                 <select name="course" required value={studentForm.course} onChange={handleStudentChange} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#008080] font-bold appearance-none">
                                     <option value="" disabled>Select Course</option>
                                     {coursesList.map(c => <option key={c} value={c}>{c}</option>)}
                                 </select>
                             </div>
                             <div className="flex flex-col gap-2">
                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Mentor</label>
                                 <select name="mentorId" required value={studentForm.mentorId} onChange={handleStudentChange} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#008080] font-bold appearance-none">
                                     <option value="" disabled>Select Mentor</option>
                                     {mentors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                 </select>
                             </div>
                             <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reg Number</label>
                                <input type="text" name="registrationNumber" value={studentForm.registrationNumber} onChange={handleStudentChange} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#008080] font-bold" placeholder="E.g. REG-001" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Meeting Link</label>
                                <input type="text" name="meetingLink" value={studentForm.meetingLink} onChange={handleStudentChange} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#008080] font-bold" placeholder="Google Meet Link" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Faculty Payment (Per Hour)</label>
                                <input type="number" name="facultyHourlyRate" value={studentForm.facultyHourlyRate} onChange={handleStudentChange} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#008080] font-bold" placeholder="Rate in ₹" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Session Hour</label>
                                <input type="text" name="hour" required value={studentForm.hour} onChange={handleStudentChange} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#008080] font-bold" placeholder="e.g. 10:00 AM - 11:00 AM" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Next Installment Date</label>
                                <input type="date" name="nextInstallmentDate" value={studentForm.nextInstallmentDate} onChange={handleStudentChange} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#008080] font-bold" />
                            </div>

                            {/* Enrollment Type Selection */}
                            <div className="md:col-span-2 space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Enrollment Plan</label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {[
                                        { id: 'mentorship', label: 'Mentorship only', icon: '🥇' },
                                        { id: 'tuition', label: 'Tuition only', icon: '🥈' },
                                        { id: 'both', label: 'Mentorship and Tuition', icon: '💎' }
                                    ].map((plan) => (
                                        <button
                                            key={plan.id}
                                            type="button"
                                            onClick={() => setStudentForm(prev => ({ ...prev, enrollmentType: plan.id }))}
                                            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group ${studentForm.enrollmentType === plan.id
                                                ? 'border-[#008080] bg-[#008080]/5 shadow-lg scale-[1.02]'
                                                : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'
                                                }`}
                                        >
                                            <span className="text-2xl group-hover:scale-110 transition-transform">{plan.icon}</span>
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${studentForm.enrollmentType === plan.id ? 'text-[#008080]' : 'text-slate-500'}`}>
                                                {plan.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Multiple Subjects & Faculties */}
                            <div className="md:col-span-2 rounded-2xl border border-[#008080]/30 bg-[#008080]/5 p-4 sm:p-5 space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div>
                                        <label className="text-[10px] font-black text-[#0f172a] uppercase tracking-widest ml-1">Subjects & Assigned Faculties</label>
                                        <p className="text-[10px] font-bold text-slate-700 ml-1 mt-1">Add one or more subject-faculty pairs for this student.</p>
                                    </div>
                                    <button type="button" onClick={addSubjectRow} className="text-[10px] font-black text-[#008080] uppercase tracking-widest hover:text-[#0f172a] transition-colors bg-white px-3 py-2 rounded-lg border border-[#008080]/40 w-fit">
                                        + Add Subject
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {selectedSubjects.map((row, idx) => (
                                        <div key={idx} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 bg-white p-4 rounded-xl border border-slate-200 relative animate-in slide-in-from-right-2 duration-300">
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Subject</label>
                                                <select
                                                    required
                                                    value={row.subject}
                                                    onChange={(e) => handleSubjectChange(idx, 'subject', e.target.value)}
                                                    className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#008080] font-bold appearance-none text-black"
                                                >
                                                    <option value="" disabled>Select Subject</option>
                                                    <option value="Mathematics">Mathematics</option>
                                                    <option value="Physics">Physics</option>
                                                    <option value="Chemistry">Chemistry</option>
                                                    <option value="Biology">Biology</option>
                                                    <option value="Science">Science</option>
                                                    <option value="English">English</option>
                                                    <option value="All Subjects">All Subjects</option>
                                                </select>
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Assign Faculty</label>
                                                <select
                                                    required
                                                    value={row.facultyId}
                                                    onChange={(e) => handleSubjectChange(idx, 'facultyId', e.target.value)}
                                                    className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#008080] font-bold appearance-none text-black"
                                                >
                                                    <option value="" disabled>Select Faculty</option>
                                                    {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                                </select>
                                            </div>
                                            <div className="flex items-end">
                                                {selectedSubjects.length > 1 && (
                                                    <button type="button" onClick={() => removeSubjectRow(idx)} className="h-11 px-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-200 font-black text-xs hover:bg-rose-100 transition-colors">
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-white border border-slate-200 rounded-xl p-3">
                                    <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2">Current Mapping</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedSubjects.filter(item => item.subject && item.facultyName).length === 0 ? (
                                            <span className="text-xs font-bold text-slate-600">No subject-faculty pair selected yet.</span>
                                        ) : (
                                            selectedSubjects
                                                .filter(item => item.subject && item.facultyName)
                                                .map((item, index) => (
                                                    <span key={`${item.subject}-${item.facultyId}-${index}`} className="text-[11px] font-bold bg-[#008080]/10 text-[#0f172a] px-3 py-1.5 rounded-lg border border-[#008080]/20">
                                                        {item.subject} {'->'} {item.facultyName}
                                                    </span>
                                                ))
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="md:col-span-2 bg-[#008080]/10/50 p-4 rounded-xl border border-[#008080] flex items-start gap-4">
                                <Clock className="text-[#008080] flex-shrink-0 mt-0.5" size={20} />
                                <div>
                                    <h3 className="text-xs font-black text-[#008080] uppercase tracking-widest mb-1">Weekly Time Table</h3>
                                    <p className="text-[10px] font-bold text-[#008080] uppercase">Note: Timetable will be filled automatically after the first class is completed.</p>
                                </div>
                            </div>
                        </div>

                        <button disabled={loading} type="submit" className="w-full mt-8 bg-slate-900 text-white p-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-xl hover:shadow-[#008080] flex items-center justify-center gap-3">
                            {loading ? 'Processing...' : 'Register Student'}
                            {!loading && <CheckCircle size={16} />}
                        </button>
                    </form>
                )}

                {activeTab === 'faculty' && (
                    <form onSubmit={submitFaculty} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                                <ShieldCheck size={18} />
                            </div>
                            <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest">Faculty Onboarding System</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                <div className="relative group">
                                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                                    <input type="text" name="name" required value={facultyForm.name} onChange={handleFacultyChange} className="w-full p-3 pl-12 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-100 font-bold" placeholder="Faculty Name" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                                    <input type="email" name="email" required value={facultyForm.email} onChange={handleFacultyChange} className="w-full p-3 pl-12 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-100 font-bold" placeholder="Email Address" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                <div className="relative group">
                                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                                    <input type="tel" name="phone_number" required value={facultyForm.phone_number} onChange={handleFacultyChange} className="w-full p-3 pl-12 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-100 font-bold" placeholder="Phone Number" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Place / City</label>
                                <div className="relative group">
                                    <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                                    <input type="text" name="place" required value={facultyForm.place} onChange={handleFacultyChange} className="w-full p-3 pl-12 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-100 font-bold" placeholder="Location" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign Login Password</label>
                                <div className="relative group">
                                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                                    <input type="password" name="password" required value={facultyForm.password} onChange={handleFacultyChange} className="w-full p-3 pl-12 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-100 font-bold" placeholder="••••••••" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
                                <div className="relative group">
                                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                                    <input type="password" name="confirmPassword" required value={facultyForm.confirmPassword} onChange={handleFacultyChange} className="w-full p-3 pl-12 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-100 font-bold" placeholder="••••••••" />
                                </div>
                            </div>
                        </div>

                        <button disabled={loading} type="submit" className="w-full mt-8 bg-slate-900 text-white p-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-xl hover:shadow-emerald-100 flex items-center justify-center gap-3">
                            {loading ? 'Processing...' : 'Securely Onboard Faculty'}
                            {!loading && <CheckCircle size={16} />}
                        </button>
                    </form>
                )}

            </div>
        </div>
    );
};

export default Registrations;
