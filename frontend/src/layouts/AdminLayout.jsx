import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import {
    SquaresFour,
    Buildings,
    Users,
    CalendarCheck,
    UserPlus,
    Gear
} from 'phosphor-react';

const AdminLayout = () => {
    const menuItems = [
        { label: 'Dashboard', path: '/admin/dashboard', icon: <SquaresFour size={20} /> },
        { label: 'Hostel Buildings', path: '/admin/hostel-buildings', icon: <Buildings size={20} /> },
        { label: 'Manage Staff', path: '/admin/manage-staff', icon: <Users size={20} /> },
        { label: 'Warden Attendance', path: '/admin/attendance', icon: <CalendarCheck size={20} /> },
        { label: 'Register Student', path: '/admin/register-student', icon: <UserPlus size={20} /> },
        { label: 'Settings', path: '/admin/settings', icon: <Gear size={20} /> },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar menuItems={menuItems} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Topbar title="Admin Dashboard" />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
