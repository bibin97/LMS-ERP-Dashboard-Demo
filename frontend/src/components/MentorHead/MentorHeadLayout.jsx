import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';
import { 
    LayoutDashboard, 
    Target, 
    ShieldCheck, 
    UserPlus, 
    Users, 
    GraduationCap, 
    Briefcase, 
    ListTodo, 
    CheckCircle2, 
    Activity 
} from 'lucide-react';

const MentorHeadLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const navItems = [
        { path: '/mentor-head/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
        { path: '/mentor-head/checks', icon: <Target className="w-[18px] h-[18px]" />, label: 'Student Checks' },
        { path: '/mentor-head/shift', icon: <ShieldCheck className="w-[18px] h-[18px]" />, label: 'Student Shift' },
        { path: '/mentor-head/register-mentor', icon: <UserPlus size={18} />, label: 'Register Mentor' },
        { path: '/mentor-head/mentors', icon: <Users size={18} />, label: 'Mentors List' },
        { path: '/mentor-head/students', icon: <GraduationCap size={18} />, label: 'Students' },
        { path: '/mentor-head/faculties', icon: <Briefcase size={18} />, label: 'Faculties' },
        { path: '/mentor-head/tasks', icon: <ListTodo size={18} />, label: 'Tasks' },
        { path: '/mentor-head/course-completed', icon: <CheckCircle2 size={18} />, label: 'Course Completed' },
        { path: '/mentor-head/interactions', icon: <Activity size={18} />, label: 'Logs' },
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
                title="Mentor Head"
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

export default MentorHeadLayout;
