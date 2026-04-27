import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';
import { 
    LayoutDashboard, 
    Activity, 
    UserPlus, 
    GraduationCap, 
    Users, 
    Briefcase, 
    ShieldAlert 
} from 'lucide-react';

const AcademicHeadLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const navItems = [
        { path: '/academic-head/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
        { path: '/academic-head/actions', icon: <Activity size={18} />, label: 'Actions Center' },
        { path: '/academic-head/registrations', icon: <UserPlus size={18} />, label: 'Registrations' },
        { path: '/academic-head/students', icon: <GraduationCap size={18} />, label: 'Students' },
        { path: '/academic-head/mentors', icon: <Users size={18} />, label: 'Mentors' },
        { path: '/academic-head/faculties', icon: <Briefcase size={18} />, label: 'Faculties' },
        { path: '/academic-head/live-monitoring', icon: <Activity size={18} />, label: 'Live Monitoring' },
        { path: '/academic-head/tasks', icon: <Briefcase size={18} />, label: 'Workforce Tasks' },
        { path: '/academic-head/checking', icon: <ShieldAlert size={18} />, label: 'Institutional Audit' },
    ];

    return (
        <div className="flex min-h-screen relative overflow-hidden" 
             style={{ background: 'linear-gradient(180deg, #F8FAFC, #EEF2F7)' }}>
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[990] md:hidden cursor-pointer transition-all duration-500"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
            
            <Sidebar 
                isOpen={isSidebarOpen} 
                setIsOpen={setIsSidebarOpen} 
                isCollapsed={isCollapsed} 
                setIsCollapsed={setIsCollapsed} 
                navItems={navItems}
                title="Academic Head"
            />
            
            <div className={`flex-1 flex flex-col min-w-0 w-full h-screen overflow-y-auto transition-all duration-300 ${isCollapsed ? 'md:ml-24' : 'md:ml-72'}`}>
                <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="p-6 md:p-10 animate-in fade-in slide-in-from-bottom-8 duration-700 overflow-x-hidden w-full max-w-[100vw]">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AcademicHeadLayout;
