import React, { useState } from 'react';
import authService from '../../services/authService';
import adminService from '../../services/adminService';
import wardenService from '../../services/wardenService';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const RegisterStudent = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        fullName: '',
        email: '',
        phoneNumber: '',
        gender: '',
        roomNumber: '',
        buildingId: '',
        totalFee: ''
    });
    const { showToast } = useNotification();
    const [loading, setLoading] = useState(false);
    const [buildings, setBuildings] = useState([]);
    const [allocatedRooms, setAllocatedRooms] = useState([]);
    const { user } = useAuth();

    React.useEffect(() => {
        const fetchBuildings = async () => {
            try {
                let data;
                if (user?.role === 'warden') {
                    data = await wardenService.getMyBuildings();
                } else {
                    data = await adminService.getAllBuildings();
                }
                setBuildings(data || []);
            } catch (err) {
                console.error("Failed to fetch buildings", err);
            }
        };
        fetchBuildings();
    }, [user?.role]);
    const handleChange = async (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === 'buildingId') {
            if (value) {
                const selectedBuilding = buildings.find(b => b.buildingId == value);
                const buildingFee = selectedBuilding?.fee || 0;

                setFormData(prev => ({
                    ...prev,
                    buildingId: value,
                    totalFee: buildingFee
                }));

                try {
                    const roomData = await wardenService.getAllocatedRooms(value);
                    setAllocatedRooms(roomData || []);
                } catch (err) {
                    console.error("Failed to fetch allocated rooms", err);
                    setAllocatedRooms([]);
                }
            } else {
                setAllocatedRooms([]);
                setFormData(prev => ({ ...prev, totalFee: '' }));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (!formData.fullName.trim()) {
            showToast('Error', 'Full Name is required', 'error');
            setLoading(false);
            return;
        }
        if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) {
            showToast('Error', 'Valid Email is required', 'error');
            setLoading(false);
            return;
        }
        if (!formData.phoneNumber.trim() || !/^\d{10}$/.test(formData.phoneNumber)) {
            showToast('Error', 'Valid 10-digit Phone Number is required', 'error');
            setLoading(false);
            return;
        }
        if (!formData.buildingId) {
            showToast('Error', 'Hostel Building is required', 'error');
            setLoading(false);
            return;
        }
        if (!formData.roomNumber.trim()) {
            showToast('Error', 'Room Number is required', 'error');
            setLoading(false);
            return;
        }

        if (!formData.username.trim()) {
            showToast('Error', 'Username is required', 'error');
            setLoading(false);
            return;
        }
        if (!formData.password || formData.password.length < 6) {
            showToast('Error', 'Password must be at least 6 characters', 'error');
            setLoading(false);
            return;
        }

        try {
            if (user?.role === 'warden' || user?.role === 'admin') {
                await wardenService.registerStudent(formData);
            } else {
                await authService.registerStudent(formData);
            }
            showToast('Success', 'Student registered successfully!', 'success');
            setFormData({
                username: '',
                password: '',
                fullName: '',
                email: '',
                phoneNumber: '',
                gender: '',
                roomNumber: '',
                buildingId: '',
                totalFee: ''
            });
        } catch (err) {
            console.error(err);
            showToast('Registration Error', 'Failed to register student. Username or email might be taken.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Register Student</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="fullName"
                            required
                            placeholder="Enter student's full name"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={formData.fullName}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            required
                            placeholder="Enter valid email address"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            name="phoneNumber"
                            required
                            pattern="[0-9]{10}"
                            maxLength="10"
                            placeholder="Enter 10-digit phone number"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={formData.phoneNumber}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                setFormData({ ...formData, phoneNumber: value });
                            }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Hostel Building <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="buildingId"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={formData.buildingId}
                            onChange={handleChange}
                        >
                            <option value="">Select Building</option>
                            {buildings.map(b => (
                                <option key={b.buildingId} value={b.buildingId}>{b.buildingName} ({b.buildingType})</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Room Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="roomNumber"
                            required
                            placeholder="e.g. 101-A"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={formData.roomNumber}
                            onChange={handleChange}
                        />
                        {allocatedRooms.length > 0 && (
                            <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded-md">
                                <p className="text-xs font-semibold text-red-700 mb-1">Already Occupied Rooms:</p>
                                <div className="flex flex-wrap gap-1">
                                    {allocatedRooms.map((room, idx) => (
                                        <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                            {room}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Gender <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="gender"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={formData.gender}
                            onChange={handleChange}
                        >
                            <option value="">Select Gender</option>
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Hostel Fee (₹)
                    </label>
                    <div className="mt-1 p-2 bg-gray-100 border border-gray-200 rounded-md text-gray-700 font-semibold flex items-center gap-1">
                        ₹{formData.totalFee || 0}
                    </div>
                    <p className="text-xs text-amber-600 mt-1 font-medium">
                        Fee is automatically set based on the selected building.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Username <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="username"
                            required
                            placeholder="Create a username"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={formData.username}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Password <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            name="password"
                            required
                            placeholder="Create a password (min 6 chars)"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Registering...' : 'Register Student'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RegisterStudent;
