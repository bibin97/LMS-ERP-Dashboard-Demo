import React, { useState } from 'react';
import axios from 'axios';
import {
    UserPlus,
    Phone,
    MapPin,
    Lock,
    User,
    ArrowRight,
    Loader2,
    ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

const MentorRegistration = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone_number: '',
        place: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('/api/mentor-head/register-mentor', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                toast.success("Mentor registered successfully!");
                setFormData({
                    name: '',
                    email: '',
                    phone_number: '',
                    place: '',
                    password: ''
                });
            }
        } catch (error) {
            console.error('Registration error:', error);
            toast.error(error.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col md:flex-row">
                {/* Visual Side */}
                <div className="md:w-2/5 bg-[#008080] p-12 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/10 rounded-full blur-3xl opacity-50 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-white/10 rounded-full blur-3xl opacity-50 animate-pulse delay-700"></div>

                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/20">
                            <ShieldCheck size={32} />
                        </div>
                        <h2 className="text-4xl font-black tracking-tighter leading-none mb-4">
                            Expand Your<br />Network.
                        </h2>
                        <p className="text-emerald-50 text-sm font-bold uppercase tracking-widest leading-relaxed">
                            Onboard new mentors into the MashMagic EduTech ecosystem.
                        </p>
                    </div>

                    <div className="relative z-10 mt-12 bg-white/5 backdrop-blur-sm p-6 rounded-[2rem] border border-white/10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-8 h-8 rounded-full bg-emerald-400 flex items-center justify-center text-slate-900">
                                <ShieldCheck size={16} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#008080]">Secure Registration</span>
                        </div>
                        <p className="text-xs text-white/80">
                            Passwords are automatically hashed and data is encrypted before storage.
                        </p>
                    </div>
                </div>

                {/* Form Side */}
                <div className="md:w-3/5 p-12 bg-white">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            {/* Full Name */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mentor Name</label>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#008080] transition-colors">
                                        <User size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="MENTOR NAME"
                                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-[1.5rem] text-sm font-bold tracking-wide focus:ring-2 ring-[#008080]/20 transition-all outline-none"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email ID</label>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#008080] transition-colors">
                                        <User size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="EMAIL ADDRESS"
                                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-[1.5rem] text-sm font-bold tracking-wide focus:ring-2 ring-[#008080]/20 transition-all outline-none"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Phone Number */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#008080] transition-colors">
                                        <Phone size={18} />
                                    </div>
                                    <input
                                        type="tel"
                                        name="phone_number"
                                        placeholder="PHONE NUMBER"
                                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-[1.5rem] text-sm font-bold tracking-wide focus:ring-2 ring-[#008080]/20 transition-all outline-none"
                                        value={formData.phone_number}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Place */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#008080] transition-colors">
                                        <MapPin size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        name="place"
                                        placeholder="LOCATION"
                                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-[1.5rem] text-sm font-bold tracking-wide focus:ring-2 ring-[#008080]/20 transition-all outline-none"
                                        value={formData.place}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#008080] transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="PASSWORD"
                                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-[1.5rem] text-sm font-bold tracking-wide focus:ring-2 ring-[#008080]/20 transition-all outline-none"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 text-white rounded-[1.5rem] py-5 font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl hover:shadow-slate-200 active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    <span>Authorize Registration</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MentorRegistration;
