import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, Search, ArrowRight, User } from 'lucide-react';
import toast from 'react-hot-toast';

const StudentShift = () => {
    const [students, setStudents] = useState([]);
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedMentor, setSelectedMentor] = useState('');
    const [shifting, setShifting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [studentsRes, mentorsRes] = await Promise.all([
                axios.get('/api/mentor-head/all-students', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('/api/mentor-head/dashboard', { headers: { Authorization: `Bearer ${token}` } })
            ]);

            if (studentsRes.data.success) {
                setStudents(studentsRes.data.data);
            }
            if (mentorsRes.data.success) {
                setMentors(mentorsRes.data.data);
            }
        } catch {
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleShift = async () => {
        if (!selectedStudent || !selectedMentor) {
            toast.error("Please select both a student and a new mentor.");
            return;
        }

        if (selectedStudent.mentor_id === parseInt(selectedMentor)) {
            toast.error("Student is already assigned to this mentor.");
            return;
        }

        setShifting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`/api/mentor-head/students/${selectedStudent.id}/shift`,
                { newMentorId: selectedMentor },
                { headers: { Authorization: `Bearer ${token}` } });

            if (res.data.success) {
                toast.success(`Successfully shifted ${selectedStudent.name}`);
                setSelectedStudent(null);
                setSelectedMentor('');
                fetchData(); // Refresh lists
            }
        } catch {
            toast.error("Failed to shift student");
        } finally {
            setShifting(false);
        }
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.course.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center text-slate-400 font-bold">Loading system...</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Page Title */}
            <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-sm mb-10">
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#008080] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#008080]/30 rotate-3">
                        <RefreshCw size={28} />
                    </div>
                    Student Reassignment
                </h2>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-3 flex items-center gap-2">
                    <ArrowRight size={14} className="text-emerald-500" />
                    Manage student roster distributions and reallocate assignments between mentors
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Step 1: Select Student */}
                <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col h-[600px]">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#008080] flex items-center justify-center text-white">1</span>
                        Select Student
                    </h3>

                    <div className="relative mb-6">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name or course..."
                            className="w-full p-4 pl-12 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:bg-white focus:ring-4 focus:ring-[#008080] transition-all font-semibold"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2.5">
                        {filteredStudents.map(student => (
                            <div
                                key={student.id}
                                onClick={() => setSelectedStudent(student)}
                                className={`p-4 rounded-2xl cursor-pointer border transition-all ${selectedStudent?.id === student.id ? 'bg-[#008080]/10 border-[#008080] shadow-md shadow-[#008080]' : 'bg-slate-50 border-slate-100 hover:bg-slate-100/50 hover:border-slate-200'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedStudent?.id === student.id ? 'bg-[#008080] text-white' : 'bg-slate-200 text-slate-500'}`}>
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <h4 className={`font-bold flex items-center gap-2 ${selectedStudent?.id === student.id ? 'text-[#008080]' : 'text-slate-700'}`}>
                                            {student.name}
                                            {student.onboarding_status === 'pending' && (
                                                <span className="px-2 py-0.5 bg-rose-50 rounded-md text-[8px] font-black text-rose-600 shadow-sm border border-rose-100 uppercase tracking-widest">
                                                    New
                                                </span>
                                            )}
                                        </h4>
                                        <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1">
                                            Current Mentor: {mentors.find(m => m.mentor_id === student.mentor_id)?.mentor_name || 'None'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step 2: Select New Mentor */}
                <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col h-[600px] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full opacity-50 blur-3xl -mr-32 -mt-32"></div>

                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
                        <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">2</span>
                        Reassign Mentor
                    </h3>

                    <div className="flex-1 flex flex-col gap-6 relative z-10">
                        {selectedStudent ? (
                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 shadow-sm animate-in fade-in zoom-in-95">
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Target Student</p>
                                <h4 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                    {selectedStudent.name}
                                    {selectedStudent.onboarding_status === 'pending' && (
                                        <span className="px-2 py-0.5 bg-rose-50 rounded-md text-[10px] font-black text-rose-600 shadow-sm border border-rose-100 uppercase tracking-widest">
                                            New
                                        </span>
                                    )}
                                </h4>
                                <div className="mt-4 flex items-center gap-3">
                                    <span className="px-3 py-1 bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-lg">{selectedStudent.course}</span>
                                    <span className="px-3 py-1 bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-lg">{selectedStudent.grade}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-center flex-1 flex flex-col items-center justify-center">
                                <p className="text-slate-400 font-bold">Select a student first to unlock reassignment.</p>
                            </div>
                        )}

                        <div className={`transition-all duration-300 ${!selectedStudent ? 'opacity-50 pointer-events-none' : ''}`}>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-2">Select New Mentor</label>
                            <select
                                value={selectedMentor}
                                onChange={(e) => setSelectedMentor(e.target.value)}
                                className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 ring-[#008080] shadow-sm"
                            >
                                <option value="" disabled>-- Choose a Mentor --</option>
                                {mentors.filter(m => m.mentor_id !== selectedStudent?.mentor_id).map(m => (
                                    <option key={m.mentor_id} value={m.mentor_id}>{m.mentor_name} ({m.total_assigned_students} students)</option>
                                ))}
                            </select>
                        </div>

                        <div className="mt-auto">
                            <button
                                onClick={handleShift}
                                disabled={!selectedStudent || !selectedMentor || shifting}
                                className="w-full flex items-center justify-center gap-3 bg-[#008080] hover:bg-[#008080] text-white p-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50 disabled:hover:translate-y-0 hover:-translate-y-1 shadow-lg shadow-[#008080]/30"
                            >
                                {shifting ? 'Shifting Data...' : 'Confirm Reassignment'}
                                <ArrowRight size={16} />
                            </button>
                            <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4">
                                Note: Past interaction logs will be preserved under student profile.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentShift;
