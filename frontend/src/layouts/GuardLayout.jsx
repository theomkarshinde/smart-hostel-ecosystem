import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import {
    SquaresFour,
    UserPlus,
    CalendarCheck,
    User
} from 'phosphor-react';

const GuardLayout = () => {
    const menuItems = [
        { label: 'Dashboard', path: '/guard/dashboard', icon: <SquaresFour size={20} /> },
        { label: 'Visitor Entry', path: '/guard/visitor-entry', icon: <UserPlus size={20} /> },
        { label: 'Attendance', path: '/guard/attendance', icon: <CalendarCheck size={20} /> },
        { label: 'Profile', path: '/guard/profile', icon: <User size={20} /> },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar menuItems={menuItems} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Topbar title="Guard Dashboard" />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default GuardLayout;
