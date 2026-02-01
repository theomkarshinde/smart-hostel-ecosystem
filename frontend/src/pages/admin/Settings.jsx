import React, { useState } from 'react';
import adminService from '../../services/adminService';
import { toast } from 'react-hot-toast';

const Settings = () => {
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);

    const handleDelete = async (e) => {
        e.preventDefault();
        if (!window.confirm(`Are you sure you want to delete user: ${username}? This action cannot be undone.`)) return;

        setLoading(true);
        try {
            await adminService.deleteUser(username);
            toast.success('User deleted successfully');
            setUsername('');
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">System Settings</h2>

            <div className="app-card mb-6">
                <h3 className="text-lg font-semibold mb-4 text-red-600">Danger Zone: Data Cleanup</h3>
                <p className="text-gray-600 mb-4 text-sm">Delete a user and their associated data (Student/Staff records) permanently.</p>

                <form onSubmit={handleDelete} className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">Username to Delete</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            placeholder="Enter username"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm p-2 border"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                        {loading ? 'Deleting...' : 'Delete User'}
                    </button>
                </form>
            </div>

        </div>
    );
};

export default Settings;
