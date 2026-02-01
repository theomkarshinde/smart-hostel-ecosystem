import React, { useState, useEffect, useRef, useCallback } from 'react';
import useWebSocket from '../hooks/useWebSocket';
import { useNotification } from '../context/NotificationContext';

const NotificationBell = () => {
    const { notifications, unreadCount, markAllAsRead, clearNotifications, addNotification } = useNotification();
    const [isOpen, setIsOpen] = useState(false);

    const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:5000';

    const handleNewMessage = useCallback((message) => {
        addNotification(message.title || 'Notification', message.body || message.message);
    }, [addNotification]);

    useWebSocket(WS_URL, handleNewMessage);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            markAllAsRead();
        }
    };

    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>

            <button
                onClick={toggleDropdown}
                className="relative p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
                <span className="sr-only">View notifications</span>
                <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 block h-5 w-5 rounded-full ring-2 ring-white bg-red-500 text-xs text-white text-center leading-4 font-bold">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-40">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                        <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <span className="text-sm font-medium text-gray-700">Notifications</span>
                            {notifications.length > 0 && (
                                <button onClick={clearNotifications} className="text-xs text-indigo-600 hover:text-indigo-800">Clear all</button>
                            )}
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="px-4 py-6 text-center text-sm text-gray-500">No notifications</div>
                            ) : (
                                notifications.map((note) => (
                                    <div key={note.id} className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition">
                                        <p className="text-sm font-medium text-gray-900">{note.title}</p>
                                        <p className="text-sm text-gray-500 mt-1">{note.body}</p>
                                        <p className="text-xs text-gray-400 mt-1">{note.time}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
