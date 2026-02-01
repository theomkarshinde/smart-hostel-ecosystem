import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const ForgotPassword = () => {
    const { showToast } = useNotification();
    const [searchParams] = useSearchParams();
    const tokenFromUrl = searchParams.get('token');

    const isResetMode = !!tokenFromUrl;

    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const navigate = useNavigate();

    const handleRequestSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { username: email });
            setSubmitted(true);
            showToast('Success', 'Reset link sent to your email', 'success');
        } catch (error) {
            console.error(error);
            showToast('Error', error.message || 'Failed to send reset link. Check username/email.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            showToast('Error', "Passwords don't match", 'error');
            return;
        }
        setLoading(true);
        try {
            await api.post('/auth/reset-password', { token: tokenFromUrl, newPassword });
            showToast('Success', 'Password reset successfully. Please login.', 'success');
            navigate('/login');
        } catch (error) {
            console.error(error);
            showToast('Error', error.message || 'Failed to reset password. Link might be expired.', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (isResetMode) {
        return (
            <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Set New Password</h2>
                <form onSubmit={handleResetSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">New Password</label>
                        <input
                            type="password"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                        <input
                            type="password"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none ${loading ? 'opacity-70' : ''}`}
                    >
                        {loading ? 'Reseting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Forgot Password</h2>
            {submitted ? (
                <div className="text-center">
                    <div className="text-green-600 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <p className="text-gray-600 mb-6">If an account exists for <b>{email}</b>, we have sent a password reset link.</p>
                    <Link to="/login" className="text-indigo-600 hover:text-indigo-500 font-medium">Back to Login</Link>
                </div>
            ) : (
                <form onSubmit={handleRequestSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Username / Email</label>
                        <p className="text-xs text-gray-500 mb-1">Enter your registered username (usually your email)</p>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none ${loading ? 'opacity-70' : ''}`}
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                    <div className="text-center mt-4">
                        <Link to="/login" className="text-sm text-indigo-600 hover:text-indigo-500">Back to Login</Link>
                    </div>
                </form>
            )}
        </div>
    );
};

export default ForgotPassword;
