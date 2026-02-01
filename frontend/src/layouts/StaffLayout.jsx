import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const StaffLayout = () => {
    const menuItems = [
        { label: 'Dashboard', path: '/staff/dashboard' },
        { label: 'Attendance', path: '/staff/attendance' },
        { label: 'Profile', path: '/staff/profile' },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar menuItems={menuItems} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Topbar title="Staff Dashboard" />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default StaffLayout;
