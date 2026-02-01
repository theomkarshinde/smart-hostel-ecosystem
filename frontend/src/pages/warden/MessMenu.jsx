import React, { useState, useEffect } from 'react';
import wardenService from '../../services/wardenService';
import Loader from '../../components/Loader';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

const MessMenu = () => {
    const { user } = useAuth();
    const { showToast } = useNotification();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(false);

    if (!user?.managesMess && user?.role !== 'ADMIN') {
        return (
            <div className="bg-red-50 border border-red-200 p-8 rounded-lg text-center">
                <h2 className="text-xl font-bold text-red-800 mb-2">Access Denied</h2>
                <p className="text-red-600">Only Mess Wardens and Admins can manage the mess menu.</p>
            </div>
        );
    }

    const [formData, setFormData] = useState({
        mealType: 'BREAKFAST',
        items: '',
        price: ''
    });

    useEffect(() => {
        fetchMenu(selectedDate);
    }, [selectedDate]);

    useEffect(() => {
        const existing = menuItems.find(m => m.mealType === formData.mealType);
        if (existing) {
            setFormData(prev => ({
                ...prev,
                items: existing.items || '',
                price: existing.price || ''
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                items: '',
                price: ''
            }));
        }
    }, [formData.mealType, menuItems]);

    const fetchMenu = async (date) => {
        setLoading(true);
        try {
            const data = await wardenService.getMessMenu(date);
            setMenuItems(data);
        } catch (error) {
            console.error("Failed to fetch menu", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMenu = async (e) => {
        e.preventDefault();

        if (!formData.items.trim()) {
            showToast('Error', 'Menu Items description is required', 'error');
            return;
        }
        if (parseFloat(formData.price) < 0) {
            showToast('Error', 'Price cannot be negative', 'error');
            return;
        }
        if (formData.price === '') {
            showToast('Error', 'Price is required', 'error');
            return;
        }
        const today = new Date().toISOString().split('T')[0];
        if (selectedDate < today) {
            showToast('Error', 'Cannot add menu for past dates', 'error');
            return;
        }

        try {
            const payload = {
                menuDate: selectedDate,
                mealType: formData.mealType,
                items: formData.items,
                price: parseFloat(formData.price) || 0
            };
            await wardenService.addMessMenu(payload);
            showToast('Success', 'Menu added successfully', 'success');
            setFormData({ ...formData, items: '' });
            fetchMenu(selectedDate); 
        } catch (error) {
            console.error("Failed to add menu", error);
            showToast('Error', 'Failed to add menu', 'error');
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Mess Menu Management</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Visual Menu Display */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">Daily Menu</h3>
                        <input
                            type="date"
                            value={selectedDate}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1"
                        />
                    </div>

                    {loading ? <Loader /> : (
                        <div className="space-y-4">
                            {['BREAKFAST', 'LUNCH', 'DINNER'].map(type => {
                                const menu = menuItems.find(m => m.mealType === type);
                                return (
                                    <div key={type} className="border-b border-gray-100 pb-3 last:border-0">
                                        <div className="flex justify-between">
                                            <span className="font-medium text-gray-800">{type}</span>
                                            {menu ? (
                                                <div className="flex items-center space-x-2">
                                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Added</span>
                                                    <button
                                                        onClick={() => setFormData({ ...formData, mealType: type })}
                                                        className="text-indigo-600 hover:text-indigo-800"
                                                        title="Edit this meal"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded">Pending</span>
                                            )}
                                        </div>
                                        <p className="text-gray-600 mt-1 text-sm">
                                            {menu ? (
                                                <>
                                                    <span>{menu.items}</span>
                                                    <span className="block mt-1 font-semibold text-indigo-600">Price: ₹{menu.price}</span>
                                                </>
                                            ) : "No items added yet."}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Add Menu Form */}
                <div className="bg-white p-6 rounded-lg shadow-md h-fit">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Add / Update Menu</h3>
                    <form onSubmit={handleAddMenu} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Meal Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.mealType}
                                onChange={(e) => setFormData({ ...formData, mealType: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                            >
                                <option value="BREAKFAST">Breakfast</option>
                                <option value="LUNCH">Lunch</option>
                                <option value="DINNER">Dinner</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Items (comma separated or description) <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={formData.items}
                                onChange={(e) => setFormData({ ...formData, items: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                rows="4"
                                placeholder="e.g. Rice, Dal, Chapati, Paneer..."
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Price (₹) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition"
                        >
                            {menuItems.find(m => m.mealType === formData.mealType) ? 'Update Menu' : 'Save Menu'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MessMenu;
