import React, { useState, useEffect } from 'react';
import studentService from '../../services/studentService';
import Loader from '../../components/Loader';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

const Mess = () => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [menuItems, setMenuItems] = useState([]);
    const [plans, setPlans] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const { addNotification } = useNotification();
    const { user } = useAuth();
    const [studentId, setStudentId] = useState(null);

    useEffect(() => {
        if (user?.username) {
            fetchStudentDetails();
        }
    }, [user]);

    const fetchStudentDetails = async () => {
        try {
            const data = await studentService.getStudentProfile();
            if (data.studentId) {
                setStudentId(data.studentId);
            }
        } catch (e) {
            console.error('Failed to fetch student profile:', e);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedDate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [menuData, subscriptionData, plansData] = await Promise.all([
                studentService.getMessMenu(selectedDate),
                studentService.getMessInfo(),
                studentService.getMessPlans()
            ]);
            setMenuItems(menuData);
            setStats(subscriptionData);
            setPlans(plansData);
        } catch (error) {
            console.error("Failed to fetch mess data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async (planId) => {
        if (!studentId) {
            addNotification('Error', 'Student ID not found. Please try again.', 'error');
            return;
        }

        const plan = plans.find(p => p.planId === planId);
        if (!plan) return;

        const mealDays = 30;
        const bufferDays = 15;
        const totalDays = mealDays + bufferDays;
        const totalMeals = mealDays * 3;
        const totalCost = totalMeals * plan.perMealCost;

        const confirmed = window.confirm(
            `Subscribe to ${plan.planName}?\n\n` +
            `Total Meals: ${totalMeals} (${mealDays} days × 3 meals/day)\n` +
            `Cost per Meal: ₹${plan.perMealCost}\n` +
            `Total Cost: ₹${totalCost}\n\n` +
            `Validity: ${totalDays} days (${mealDays} days + ${bufferDays} days buffer)\n` +
            `This gives you flexibility to skip meals and use them within ${totalDays} days.\n\n` +
            `Amount will be deducted from your wallet immediately.`
        );

        if (!confirmed) return;

        try {
            const today = new Date();
            const endDate = new Date();
            endDate.setDate(today.getDate() + totalDays);

            const payload = {
                studentId: studentId,
                planId: planId,
                startDate: today.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0]
            };

            await studentService.subscribeMess(payload);
            addNotification('Success', `Subscribed successfully! You have ${totalMeals} meals.`);
            fetchData(); 
        } catch (e) {
            console.error(e);
            const errorMsg = e.response?.data?.message || e.response?.data || 'Subscription failed';
            addNotification('Error', errorMsg);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Mess & Dining</h2>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-700">Daily Menu</h3>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1"
                    />
                </div>

                {loading ? <Loader /> : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {['BREAKFAST', 'LUNCH', 'DINNER'].map(type => {
                            const menu = menuItems.find(m => m.mealType === type);
                            return (
                                <div key={type} className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-white hover:shadow-sm transition">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-bold text-gray-800">{type}</h4>
                                        <span className="text-xs text-gray-500">
                                            {type === 'BREAKFAST' ? '8:00 - 9:30 AM' :
                                                type === 'LUNCH' ? '12:30 - 2:00 PM' : '7:30 - 9:00 PM'}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 text-sm whitespace-pre-line">
                                        {menu ? menu.items : "No menu available"}
                                    </p>
                                    {menu && menu.price && (
                                        <p className="text-xs text-gray-400 mt-2">Daily Price: ₹{menu.price}</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Mess Plans Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700 mb-6">Mess Plans</h3>
                {stats && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
                        <h4 className="font-bold text-green-800">Active Subscription</h4>
                        <p className="text-sm text-green-700">Valid from {stats.startDate} to {stats.endDate}</p>
                        <p className="text-sm font-bold text-green-800 mt-2">
                            Remaining Meals: {stats.remainingMeals || 0}
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map(plan => (
                        <div key={plan.planId} className="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-md transition text-center">
                            <h4 className="font-bold text-xl text-gray-800 mb-2">{plan.planName}</h4>
                            <p className="text-gray-600 mb-4">Subscriber Cost: <span className="font-bold text-indigo-600">₹{plan.perMealCost}</span> / meal</p>
                            <button
                                onClick={() => handleSubscribe(plan.planId)}
                                disabled={!!stats}
                                className={`w-full py-2 rounded-md transition ${stats ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                            >
                                {stats ? 'Subscribed' : 'Subscribe Now'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                <div className="flex">
                    <div className="shrink-0">
                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-blue-700">
                            Scan your ID card at the mess entrance to mark attendance. Amount will be deducted from your wallet based on the daily menu price or your active mess plan.
                        </p>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default Mess;
