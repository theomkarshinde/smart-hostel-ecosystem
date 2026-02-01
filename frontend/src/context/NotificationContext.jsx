import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [toast, setToast] = useState(null);

    const addNotification = useCallback((title, message, type = 'info') => {
        const newNotification = {
            id: Date.now(),
            title,
            body: message,
            time: new Date().toLocaleTimeString(),
            read: false,
            type,
        };

        // Add to list
        setNotifications((prev) => [newNotification, ...prev]);
        setUnreadCount((prev) => prev + 1);

        // Show toast
        setToast({ title, body: message, type });
        setTimeout(() => setToast(null), 3000);
    }, []);

    const markAllAsRead = useCallback(() => {
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, []);

    const clearNotifications = useCallback(() => {
        setNotifications([]);
        setUnreadCount(0);
    }, []);

    const closeToast = useCallback(() => {
        setToast(null);
    }, []);

    const showToast = useCallback((title, message, type = 'error') => {
        setToast({ title, body: message, type });
        setTimeout(() => setToast(null), 3000);
    }, []);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            addNotification,
            markAllAsRead,
            clearNotifications,
            showToast,
            toast,
            closeToast
        }}>
            {children}
            {/* Global Toast Render */}
            {toast && (
                <div className="fixed top-5 right-5 z-50 animate-bounce-in">
                    <div className={`rounded-lg shadow-lg p-4 w-80 text-white flex justify-between items-start ${toast.type === 'error' ? 'bg-red-500' :
                        toast.type === 'success' ? 'bg-green-500' :
                            'bg-indigo-600'
                        }`}>
                        <div>
                            <h3 className="font-bold text-sm">{toast.title}</h3>
                            <p className="text-xs mt-1 opacity-90">{toast.body}</p>
                        </div>
                        <button onClick={closeToast} className="text-white hover:text-gray-200">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </NotificationContext.Provider>
    );
};
