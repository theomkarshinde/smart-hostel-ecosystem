import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

const PendingApproval = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.status === 'APPROVED') {
            navigate('/student/dashboard');
        }
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg text-center">
                <div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Registration Pending
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Your registration has been submitted successfully and is awaiting Warden approval.
                    </p>
                </div>

                <div className="flex flex-col items-center justify-center py-6">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mb-4"></div>
                    <p className="text-gray-500">Please check back later.</p>
                </div>

                <button
                    onClick={() => {
                        authService.logout();
                        navigate('/login');
                    }}
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Back to Login
                </button>
            </div>
        </div>
    );
};

export default PendingApproval;
