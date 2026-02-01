import React, { useState, useEffect } from 'react';
import studentService from '../../services/studentService';
import Loader from '../../components/Loader';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

const Payments = () => {
    const { addNotification } = useNotification();
    const [stats, setStats] = useState(null);
    const [history, setHistory] = useState([]);
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(true);

    const { user } = useAuth();
    useEffect(() => {
        if (user?.username) fetchData();
    }, [user]);

    const studentId = stats?.studentId;

    const fetchData = async () => {
        try {
            const [statsData, historyData] = await Promise.all([
                studentService.getStats(),
                studentService.getPayments()
            ]);
            setStats(statsData);
            setHistory(historyData);
        } catch (error) {
            console.error("Failed to fetch payment info", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMoney = async (e) => {
        e.preventDefault();
        if (!amount || amount <= 0) {
            addNotification('Error', 'Please enter a valid amount', 'error');
            return;
        }

        try {
            const orderId = await studentService.createOrder({ amount: parseFloat(amount) });

            if (!orderId) throw new Error("Order creation failed");

            if (!window.Razorpay) {
                addNotification('Error', 'Razorpay SDK not loaded. Please check internet connection.', 'error');
                return;
            }

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: parseFloat(amount) * 100,
                currency: "INR",
                name: "Smart Hostel",
                description: "Wallet Topup",
                order_id: orderId,
                handler: async function (response) {
                    await handlePaymentSuccess(response, amount);
                },
                prefill: {
                    name: user?.username || "Student",
                    contact: "9999999999"
                },
                theme: {
                    color: "#6366F1"
                }
            };
            const rzp1 = new window.Razorpay(options);
            rzp1.open();

        } catch (error) {
            console.error("Payment initiation failed", error);
            addNotification('Error', 'Failed to initiate payment');
        }
    };

    const handlePaymentSuccess = async (response, paymentAmount, type = 'WALLET') => {
        try {
            const verifyData = {
                studentId: studentId,
                amount: parseFloat(paymentAmount),
                paymentType: type,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
            };
            await studentService.verifyPayment(verifyData);
            addNotification('Success', `Payment Successful! ${type === 'WALLET' ? 'Wallet Updated' : 'Fee Paid'}.`);
            setAmount('');
            fetchData();
        } catch (error) {
            console.error("Payment verification failed", error);
            addNotification('Error', 'Payment verification failed');
        }
    };

    const handlePayFee = async (payAmount) => {
        if (!payAmount || payAmount <= 0) return;

        try {
            const orderId = await studentService.createOrder({ amount: parseFloat(payAmount) });
            if (!orderId) throw new Error("Order creation failed");

            if (!window.Razorpay) {
                addNotification('Error', 'Razorpay SDK not loaded.', 'error');
                return;
            }

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: parseFloat(payAmount) * 100,
                currency: "INR",
                name: "Smart Hostel",
                description: "Hostel Fee Payment",
                order_id: orderId,
                handler: async function (response) {
                    await handlePaymentSuccess(response, payAmount, 'HOSTEL');
                },
                prefill: {
                    name: user?.username || "Student",
                    contact: "9999999999"
                },
                theme: {
                    color: "#6366F1"
                }
            };
            const rzp1 = new window.Razorpay(options);
            rzp1.open();
        } catch (error) {
            console.error("Payment failed", error);
            addNotification('Error', 'Failed to initiate fee payment');
        }
    };

    const handlePayFromWallet = async (payAmount) => {
        if (!payAmount || payAmount <= 0) return;
        if ((stats?.walletBalance || 0) < payAmount) {
            addNotification('Error', 'Insufficient wallet balance');
            return;
        }

        if (!window.confirm(`Are you sure you want to pay ₹${payAmount} from your wallet?`)) return;

        try {
            setLoading(true);
            await studentService.payFromWallet(studentId, payAmount);
            addNotification('Success', 'Fee paid successfully from wallet!');
            fetchData();
        } catch (error) {
            console.error("Wallet payment failed", error);
            addNotification('Error', error.response?.data?.message || 'Failed to pay fee from wallet');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Payments & Wallet</h2>

            {/* Fee & Wallet Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Fee Details</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Total Fee:</span>
                            <span className="font-medium text-gray-900">₹{stats?.totalFee || 0}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Paid Fee:</span>
                            <span className="font-medium text-green-600">₹{stats?.paidFee || 0}</span>
                        </div>
                        <div className="flex justify-between border-t border-gray-100 pt-2">
                            <span className="text-gray-800 font-medium">Pending Dues:</span>
                            <span className="font-bold text-red-600">₹{(stats?.totalFee || 0) - (stats?.paidFee || 0)}</span>
                        </div>

                        <div className="mt-6 space-y-3">
                            {((stats?.totalFee || 0) - (stats?.paidFee || 0)) > 0 && (
                                <div className="space-y-2">
                                    <button
                                        onClick={() => handlePayFee((stats?.totalFee || 0) - (stats?.paidFee || 0))}
                                        className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition font-bold"
                                    >
                                        Pay Outstanding via Razorpay
                                    </button>
                                    {(stats?.walletBalance || 0) >= ((stats?.totalFee || 0) - (stats?.paidFee || 0)) && (
                                        <button
                                            onClick={() => handlePayFromWallet((stats?.totalFee || 0) - (stats?.paidFee || 0))}
                                            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition font-bold"
                                        >
                                            Pay Outstanding from Wallet
                                        </button>
                                    )}
                                </div>
                            )}

                            {stats?.isEmiEnabled && ((stats?.totalFee || 0) - (stats?.paidFee || 0)) > 0 && (
                                <div className="space-y-2">
                                    <button
                                        onClick={() => handlePayFee(stats.emiAmount)}
                                        className="w-full bg-indigo-100 text-indigo-700 py-2 rounded-md hover:bg-indigo-200 transition font-bold"
                                    >
                                        Pay EMI via Razorpay (₹{stats.emiAmount})
                                    </button>
                                    {(stats?.walletBalance || 0) >= stats.emiAmount && (
                                        <button
                                            onClick={() => handlePayFromWallet(stats.emiAmount)}
                                            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition font-bold"
                                        >
                                            Pay EMI from Wallet (₹{stats.emiAmount})
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {stats?.isEmiEnabled && (
                            <div className="mt-4 bg-indigo-50 p-3 rounded">
                                <p className="text-sm text-indigo-800">EMI Option Enabled</p>
                                <p className="text-xs text-indigo-600">EMI Amount: ₹{stats?.emiAmount}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Wallet</h3>
                    <div className="text-center mb-6">
                        <span className="block text-gray-500 text-sm">Current Balance</span>
                        <span className="block text-4xl font-bold text-indigo-600">₹{stats?.walletBalance || 0}</span>
                    </div>

                    <form onSubmit={handleAddMoney} className="flex gap-2">
                        <div className="flex-1">
                            <input
                                type="number"
                                placeholder="Enter Amount"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                min="1"
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
                        >
                            Add Money
                        </button>
                    </form>
                    <p className="text-xs text-gray-400 mt-2 text-center">Secured by Razorpay</p>
                </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">Transaction History</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {history.length > 0 ? (
                                history.map((payment) => (
                                    <tr key={payment.paymentId}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{payment.paymentId}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.paymentType}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${payment.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {payment.amount < 0 ? '-' : '+'}₹{Math.abs(payment.amount)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">No transactions found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Payments;
