import React from 'react';
import { LayoutDashboard, Users, BookOpen, Clock } from 'lucide-react';
import StatCard from '../components/StatCard';

const MentorDashboard = () => {
    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold text-slate-900">Mentor Portal</h2>
                <p className="text-slate-500 text-sm font-medium">Manage your students and assigned tasks</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="My Students" value={12} icon={<Users size={24} />} trend={5} />
                <StatCard title="Active Tasks" value={8} icon={<BookOpen size={24} />} />
                <StatCard title="Average Rating" value="4.8/5" icon={<Clock size={24} />} />
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h4 className="text-lg font-bold text-slate-800 mb-4">Upcoming Sessions</h4>
                <p className="text-slate-500">No upcoming sessions scheduled for today.</p>
            </div>
        </div>
    );
};

export default MentorDashboard;
