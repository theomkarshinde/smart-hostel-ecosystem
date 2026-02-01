import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../../services/authService';
import { useNotification } from '../../context/NotificationContext';

const StudentRegister = () => {
    const { showToast } = useNotification();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        email: '',
        phoneNumber: '',
        gender: 'MALE', 
        roomNumber: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.fullName.trim()) {
            setError('Full Name is required');
            showToast('Error', 'Full Name is required', 'error');
            setLoading(false);
            return;
        }
        if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) {
            setError('Please enter a valid email address');
            showToast('Error', 'Please enter a valid email address', 'error');
            setLoading(false);
            return;
        }
        if (!formData.phoneNumber.trim() || !/^\d{10}$/.test(formData.phoneNumber)) {
            setError('Please enter a valid 10-digit phone number');
            showToast('Error', 'Please enter a valid 10-digit phone number', 'error');
            setLoading(false);
            return;
        }
        if (!formData.username.trim()) {
            setError('Username is required');
            showToast('Error', 'Username is required', 'error');
            setLoading(false);
            return;
        }
        if (!formData.password || formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            showToast('Error', 'Password must be at least 6 characters long', 'error');
            setLoading(false);
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match");
            showToast('Error', "Passwords don't match", 'error');
            setLoading(false);
            return;
        }

        try {
            const registrationData = { ...formData };
            delete registrationData.confirmPassword;

            await authService.registerStudent(registrationData);
            showToast('Success', 'Registration submitted successfully!', 'success');
            setSuccess(true);
            setFormData({
                username: '',
                password: '',
                confirmPassword: '',
                fullName: '',
                email: '',
                phoneNumber: ''
            });
        } catch (err) {
            console.error('Registration error:', err);
            const msg = err.response?.data?.message || 'Registration failed. Please try again.';
            setError(msg);
            showToast('Error', msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="mt-2 text-xl font-medium text-gray-900">Registration Successful</h3>
                <p className="mt-4 text-sm text-gray-500">
                    Registration submitted. Waiting for warden approval.
                </p>
                <div className="mt-6">
                    <Link to="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                        Back to Sign in
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-center text-3xl font-extrabold text-gray-900">Student Registration</h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Already registered?{' '}
                    <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                        Sign in
                    </Link>
                </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                        Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        required
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="Enter your email address"
                        value={formData.email}
                        onChange={handleChange}
                        className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>

                <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                        Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        required
                        pattern="[0-9]{10}"
                        maxLength="10"
                        placeholder="Enter your 10-digit phone number"
                        value={formData.phoneNumber}
                        onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            setFormData({ ...formData, phoneNumber: value });
                        }}
                        className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>

                <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                        Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="gender"
                        name="gender"
                        required
                        value={formData.gender}
                        onChange={handleChange}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700">
                        Requested Room Number (Optional)
                    </label>
                    <input
                        id="roomNumber"
                        name="roomNumber"
                        type="text"
                        placeholder="e.g. 101-A"
                        value={formData.roomNumber}
                        onChange={handleChange}
                        className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>

                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                        Username <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="username"
                        name="username"
                        type="text"
                        required
                        placeholder="Choose a username"
                        value={formData.username}
                        onChange={handleChange}
                        className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        placeholder="Create a password (min. 6 chars)"
                        value={formData.password}
                        onChange={handleChange}
                        className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        placeholder="Re-enter your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </div>
            </form>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mt-6">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}
        </div>
    );
};

export default StudentRegister;
