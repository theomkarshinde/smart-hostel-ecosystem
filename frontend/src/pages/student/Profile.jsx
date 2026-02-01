import React, { useEffect, useState } from 'react';
import studentService from '../../services/studentService';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';
import {
    User,
    Envelope,
    Phone,
    Shield,
    Info,
    CalendarBlank
} from 'phosphor-react';

const Profile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                if (user?.username) {
                    const data = await studentService.getProfile(user.username);
                    setProfile(data);
                } else {
                    const storedUser = JSON.parse(localStorage.getItem('user'));
                    if (storedUser?.username) {
                        const data = await studentService.getProfile(storedUser.username);
                        setProfile(data);
                    } else {
                        setError("User information not found.");
                    }
                }
            } catch (err) {
                console.error(err);
                setError("Failed to load profile.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    if (loading) return <Loader />;

    if (error) {
        return (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                    <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!profile) return <div>No profile data available</div>;

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-100">
            <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
                <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center gap-2">
                        <User className="text-indigo-600" />
                        Student Profile
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and application status.</p>
                </div>
                <div className="bg-indigo-50 p-2 rounded-full">
                    <Info className="text-indigo-500" size={24} />
                </div>
            </div>
            <div className="border-t border-gray-200">
                <dl>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 items-center">
                        <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <User size={16} className="text-indigo-400" />
                            Full name
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile.fullName || profile.username || 'N/A'}</dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 items-center">
                        <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <Envelope size={16} className="text-indigo-400" />
                            Email address
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile.email || 'N/A'}</dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 items-center">
                        <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <Phone size={16} className="text-indigo-400" />
                            Phone number
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile.phoneNumber || 'N/A'}</dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 items-center">
                        <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <Shield size={16} className="text-indigo-400" />
                            Role
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-semibold">
                            <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs">
                                {profile.role || 'STUDENT'}
                            </span>
                        </dd>
                    </div>
                    {/* Add more fields as provided by UserDTO */}
                </dl>
            </div>
        </div>
    );
};

export default Profile;
