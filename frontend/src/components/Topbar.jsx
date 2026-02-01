import React from 'react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { SignOut } from 'phosphor-react';

const Topbar = ({ title }) => {
    const { logout, user } = useAuth();

    return (
        <header className="bg-white shadow">
            <div className="flex justify-between items-center px-6 py-4">
                <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
                <div className="flex items-center space-x-4">
                    <NotificationBell />
                    <button
                        onClick={logout}
                        title="Logout"
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                    >
                        <SignOut size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Topbar;
