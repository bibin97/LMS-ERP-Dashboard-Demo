import React from 'react';
import { GraduationCap, Users, FileText, Calendar } from 'lucide-react';
import StatCard from '../components/StatCard';

const FacultyDashboard = () => {
    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold text-slate-900">Faculty Resource Panel</h2>
                <p className="text-slate-500 text-sm font-medium">Coordinate sessions and academic resources</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Classes" value={45} icon={<Users size={24} />} />
                <StatCard title="Materials Published" value={12} icon={<FileText size={24} />} />
                <StatCard title="Next Session" value="2:00 PM" icon={<Calendar size={24} />} />
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h4 className="text-lg font-bold text-slate-800 mb-4">Academic Calendar</h4>
                <p className="text-slate-500">View and manage your academic schedule.</p>
            </div>
        </div>
    );
};

export default FacultyDashboard;
