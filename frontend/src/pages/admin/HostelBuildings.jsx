import React, { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import { useNotification } from '../../context/NotificationContext';
import Loader from '../../components/Loader';
import { Plus, Trash, House, CurrencyInr, Users, Door } from 'phosphor-react';

const HostelBuildings = () => {
    const { showToast } = useNotification();
    const [buildings, setBuildings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ buildingName: '', totalCapacity: '', totalRooms: '', buildingType: 'BOYS', fee: '' });

    useEffect(() => {
        fetchBuildings();
    }, []);

    const fetchBuildings = async () => {
        try {
            const data = await adminService.getAllBuildings();
            setBuildings(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.buildingName.trim()) {
            showToast('Error', 'Building Name is required', 'error');
            return;
        }
        if (Number(formData.totalRooms) <= 0) {
            showToast('Error', 'Total Rooms must be greater than 0', 'error');
            return;
        }
        if (Number(formData.totalCapacity) <= 0) {
            showToast('Error', 'Total Capacity must be greater than 0', 'error');
            return;
        }
        if (!formData.fee || Number(formData.fee) < 0) {
            showToast('Error', 'Hostel Fee must be 0 or greater', 'error');
            return;
        }

        try {
            await adminService.createBuilding(formData);
            setShowModal(false);
            setFormData({ buildingName: '', totalCapacity: '', totalRooms: '', buildingType: 'BOYS', fee: '' });
            showToast('Success', 'Hostel building created successfully', 'success');
            fetchBuildings(); // Re-fetch to update the list
        } catch (err) {
            console.error(err);
            showToast('Error', 'Failed to create building', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this building?')) {
            try {
                await adminService.deleteBuilding(id);
                setBuildings(buildings.filter(b => b.buildingId !== id));
                showToast('Success', 'Building deleted', 'success');
            } catch (err) {
                console.error(err);
                showToast('Error', 'Failed to delete building', 'error');
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Hostel Buildings</h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
                >
                    <Plus size={18} weight="bold" />
                    Add Building
                </button>
            </div>

            {loading ? (
                <Loader />
            ) : buildings.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
                    No records found.
                </div>
            ) : (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rooms</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee (₹)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warden</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {buildings.map((building) => (
                                <tr key={building.buildingId}>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                        <div className="flex items-center gap-2 text-indigo-700">
                                            <House size={18} />
                                            {building.buildingName}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{building.buildingType}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center gap-1.5">
                                            <Users size={16} />
                                            {building.totalCapacity}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center gap-1.5">
                                            <Door size={16} />
                                            {building.totalRooms}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{building.availableRooms}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-800">
                                        <div className="flex items-center gap-1">
                                            <CurrencyInr size={14} />
                                            {building.fee || 0}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {building.assignedWarden && building.assignedWarden !== "Unassigned" ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                {building.assignedWarden}
                                            </span>
                                        ) : (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                Unassigned
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleDelete(building.buildingId)}
                                            className="flex items-center gap-1 text-red-600 hover:text-red-900 ml-auto"
                                        >
                                            <Trash size={16} />
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                    <div className="relative bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Add New Hostel Building</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
                                    <House size={16} className="text-indigo-600" />
                                    Building Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter building name (e.g., Block A)"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={formData.buildingName}
                                    onChange={(e) => setFormData({ ...formData, buildingName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={formData.buildingType}
                                    onChange={(e) => setFormData({ ...formData, buildingType: e.target.value })}
                                >
                                    <option value="BOYS">Boys Hostel</option>
                                    <option value="GIRLS">Girls Hostel</option>
                                </select>
                            </div>
                            <div>
                                <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
                                    <Door size={16} className="text-indigo-600" />
                                    Total Rooms <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    required
                                    placeholder="Enter total number of rooms"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={formData.totalRooms}
                                    onChange={(e) => setFormData({ ...formData, totalRooms: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
                                    <Users size={16} className="text-indigo-600" />
                                    Total Capacity <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    required
                                    placeholder="Enter total capacity (students)"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={formData.totalCapacity}
                                    onChange={(e) => setFormData({ ...formData, totalCapacity: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
                                    <CurrencyInr size={16} className="text-indigo-600" />
                                    Hostel Fee (₹) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    required
                                    placeholder="Fixed fee for this building"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={formData.fee}
                                    onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                                >
                                    <Plus size={18} weight="bold" />
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HostelBuildings;
