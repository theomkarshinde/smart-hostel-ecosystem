import React from 'react';
import { NavLink } from 'react-router-dom';
import { Buildings } from 'phosphor-react';

const Sidebar = ({ menuItems }) => {
    return (
        <aside className="w-64 bg-gray-800 min-h-screen flex flex-col">
            <div className="flex items-center justify-center gap-2 h-16 bg-gray-900">
                <Buildings size={32} weight="fill" className="text-indigo-400" />
                <span className="text-white font-bold text-xl">S-H-E Hostels</span>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-2">
                {menuItems.map((item, index) => (
                    <NavLink
                        key={index}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${isActive
                                ? 'bg-gray-900 text-white'
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`
                        }
                    >
                        {item.icon && <span className="mr-3">{item.icon}</span>}
                        {item.label}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
