import React, { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import { useNotification } from '../../context/NotificationContext';

const AssignWarden = () => {
    const { showToast } = useNotification();
    const [buildings, setBuildings] = useState([]);
    const [wardens, setWardens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBuilding, setSelectedBuilding] = useState('');
    const [selectedWarden, setSelectedWarden] = useState('');
    const [message, setMessage] = useState(''); 

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [buildingsData, wardensData] = await Promise.all([
                adminService.getUnassignedBuildings(),
                adminService.getUnassignedWardens()
            ]);
            setBuildings(buildingsData);
            setWardens(wardensData);
        } catch (err) {
            console.error(err);
            showToast('Error', 'Failed to load data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        setMessage('');
        if (!selectedBuilding || !selectedWarden) {
            showToast('Error', 'Please select both building and warden', 'error');
            return;
        }

        try {
            await adminService.assignWarden(selectedBuilding, selectedWarden);
            showToast('Success', 'Warden assigned successfully', 'success');
            fetchData();
            setSelectedBuilding('');
            setSelectedWarden('');
        } catch {
            showToast('Error', 'Failed to assign warden', 'error');
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Assign Warden to Building</h2>

            {/* Inline validation error */}
            {message && (
                <div className="p-4 mb-6 rounded-md bg-red-100 text-red-700">
                    {message}
                </div>
            )}

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="bg-white shadow-md rounded-lg p-6">
                    <form onSubmit={handleAssign} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select Building</label>
                            <select
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                value={selectedBuilding}
                                onChange={(e) => setSelectedBuilding(e.target.value)}
                            >
                                <option value="">-- Select Building --</option>
                                {buildings.map(b => (
                                    <option key={b.buildingId} value={b.buildingId}>
                                        {b.buildingName} ({b.buildingType})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select Warden</label>
                            <select
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                value={selectedWarden}
                                onChange={(e) => setSelectedWarden(e.target.value)}
                            >
                                <option value="">-- Select Warden --</option>
                                {wardens.map(w => (
                                    <option key={w.staffId} value={w.staffId}>
                                        {w.fullName} ({w.user ? w.user.username : 'N/A'})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition font-medium"
                        >
                            Assign Warden
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AssignWarden;
