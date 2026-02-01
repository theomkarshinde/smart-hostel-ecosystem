import React, { useState, useEffect } from 'react';
import wardenService from '../../services/wardenService';
import Loader from '../../components/Loader';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

const MessPlans = () => {
    const { user } = useAuth();
    const { addNotification } = useNotification();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    if (!user?.managesMess && user?.role !== 'ADMIN') {
        return (
            <div className="bg-red-50 border border-red-200 p-8 rounded-lg text-center">
                <h2 className="text-xl font-bold text-red-800 mb-2">Access Denied</h2>
                <p className="text-red-600">Only Mess Wardens and Admins can manage mess plans.</p>
            </div>
        );
    }

    const [formData, setFormData] = useState({
        planName: '',
        perMealCost: '' 
    });

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const data = await wardenService.getMessPlans();
            setPlans(data);
        } catch (error) {
            console.error("Failed to fetch mess plans", error);
            addNotification('Error', 'Failed to load mess plans');
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePlan = async (e) => {
        e.preventDefault();

        if (!formData.planName.trim()) {
            addNotification('Error', 'Plan Name is required');
            return;
        }
        if (parseFloat(formData.perMealCost) < 0) {
            addNotification('Error', 'Meal Cost cannot be negative');
            return;
        }
        if (formData.perMealCost === '') {
            addNotification('Error', 'Meal Cost is required');
            return;
        }

        try {
            const payload = {
                planName: formData.planName,
                perMealCost: parseFloat(formData.perMealCost) || 0
            };
            await wardenService.createMessPlan(payload);
            addNotification('Success', 'Mess Plan created successfully');
            setFormData({ planName: '', perMealCost: '' });
            fetchPlans(); 
        } catch (error) {
            console.error("Failed to create plan", error);
            addNotification('Error', 'Failed to create plan');
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Mess Plans Management</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Plans List */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Existing Plans</h3>
                    {loading ? <Loader /> : (
                        <div className="space-y-4">
                            {plans.length === 0 ? (
                                <p className="text-gray-500 text-sm">No plans available.</p>
                            ) : (
                                plans.map(plan => (
                                    <div key={plan.planId} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center bg-gray-50">
                                        <div>
                                            <h4 className="font-bold text-gray-800">{plan.planName}</h4>
                                            <p className="text-sm text-gray-600">
                                                Subscriber Meal Cost: <span className="font-semibold text-green-600">₹{plan.perMealCost}</span>
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Create Plan Form */}
                <div className="bg-white p-6 rounded-lg shadow-md h-fit">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Create New Plan</h3>
                    <form onSubmit={handleCreatePlan} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Plan Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.planName}
                                onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                placeholder="e.g. Monthly Standard"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Subscriber Per-Meal Cost (₹) <span className="text-red-500">*</span>
                            </label>
                            <p className="text-xs text-gray-500 mb-1">Price deducted from wallet per meal scan for subscribers.</p>
                            <input
                                type="number"
                                value={formData.perMealCost}
                                onChange={(e) => setFormData({ ...formData, perMealCost: e.target.value })}
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
                            Create Plan
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MessPlans;
