import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import studentService from '../../services/studentService';
import wardenService from '../../services/wardenService';
import staffService from '../../services/staffService';
import guardService from '../../services/guardService';
import Loader from '../../components/Loader';

const Profile = () => {
    const { user, authLoading } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            setLoading(false);
            return;
        }

        const fetchProfile = async () => {
            console.log("DEBUG: fetchProfile called. User role:", user.role);
            try {
                let data = null;
                const role = user.role?.toUpperCase();

                if (role === 'STUDENT') {
                    data = await studentService.getProfile(user.username);
                } else if (role === 'WARDEN') {
                    data = await wardenService.getProfile();
                } else if (role === 'GUARD') {
                    data = await guardService.getProfile();
                } else {
                    data = await staffService.getProfile();
                }

                setProfile(data);
            } catch (err) {
                console.error("Profile fetch error:", err);
                setError("Failed to load profile details.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user, authLoading]);

    if (loading) return <Loader />;

    if (error) {
        return (
            <div className="app-card border-l-4 border-red-500 bg-red-50 p-4">
                <p className="text-red-700">{error}</p>
            </div>
        );
    }

    if (!profile) return <div className="text-center p-8">No profile data available.</div>;

    const displayData = {
        fullName: profile.fullName || user.fullName || 'N/A',
        email: profile.email || profile.user?.email || 'N/A',
        phoneNumber: profile.phoneNumber || profile.user?.phoneNumber || 'N/A',
        role: user.role || 'N/A',
        username: user.username || 'N/A'
    };

    return (
        <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">My Profile</h2>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
                <div className="px-4 py-5 sm:px-6 bg-indigo-600">
                    <h3 className="text-lg leading-6 font-medium text-white">Security Pass & Information</h3>
                    <p className="mt-1 max-w-2xl text-sm text-indigo-100">Your registered contact and identity details.</p>
                </div>
                <div className="border-t border-gray-200">
                    <dl>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{displayData.fullName}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-t border-gray-100">
                            <dt className="text-sm font-medium text-gray-500">Email Address</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{displayData.email}</dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-t border-gray-100">
                            <dt className="text-sm font-medium text-gray-500 border-indigo-200 border-b md:border-none inline-block">Phone Number</dt>
                            <dd className="mt-1 text-sm font-bold text-indigo-700 sm:mt-0 sm:col-span-2">{displayData.phoneNumber}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-t border-gray-100">
                            <dt className="text-sm font-medium text-gray-500">Username</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{displayData.username}</dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-t border-gray-100">
                            <dt className="text-sm font-medium text-gray-500">Role</dt>
                            <dd className="mt-1 text-sm text-gray-800 font-semibold sm:mt-0 sm:col-span-2">
                                <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs uppercase tracking-wider">
                                    {displayData.role}
                                </span>
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>

            <div className="mt-6 text-sm text-gray-500 bg-blue-50 p-4 rounded-md border border-blue-100">
                <p><strong>Note:</strong> To update your profile details or change your phone number, please contact the Hostel Administrator.</p>
            </div>
        </div>
    );
};

export default Profile;
