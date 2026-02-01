import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import studentService from '../../services/studentService';
import Loader from '../../components/Loader';
import { useNotification } from '../../context/NotificationContext';

const StudentPayment = () => {
    const { showToast } = useNotification();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [paymentMode, setPaymentMode] = useState('online');
    const [isEmi, setIsEmi] = useState(false);
    const [emiMonths, setEmiMonths] = useState(3);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await studentService.getStats();
                setStats(data);
                if (data.totalFee > 0 && data.paidFee >= data.totalFee) {
                    navigate('/student/dashboard');
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [navigate]);

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleOnlinePayment = async () => {
        const res = await loadRazorpay();
        if (!res) {
            showToast('Error', 'Razorpay SDK failed to load. Are you online?', 'error');
            return;
        }

        let amountToPay = (stats?.totalFee || 0) - (stats?.paidFee || 0);
        if (isEmi) {
            amountToPay = Math.ceil((stats?.totalFee || 0) / emiMonths);
        }

        if (amountToPay <= 0) {
            showToast('Info', 'Fees already paid!', 'success');
            navigate('/student/dashboard');
            return;
        }

        try {
            const user = JSON.parse(localStorage.getItem('user'));

            const orderData = await studentService.createOrder({
                userId: user?.userId,
                amount: amountToPay,
                purpose: "Hostel Fee Payment"
            });
            const orderId = typeof orderData === 'string' && orderData.startsWith("order_") ? orderData : JSON.parse(orderData).id;

            const options = {
                key: "YOUR_RAZORPAY_KEY_ID", 
                amount: amountToPay * 100, 
                currency: "INR",
                name: "SHE Hostels",
                description: "Hostel Fee Payment",
                order_id: orderId,
                handler: async function (response) {
                    try {
                        await studentService.verifyPayment({
                            userId: user?.userId,
                            amount: amountToPay,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpaySignature: response.razorpay_signature,
                            purpose: "Hostel Fee Payment"
                        });
                        showToast('Success', 'Payment Successful!', 'success');
                        navigate('/student/dashboard');
                    } catch (error) {
                        console.error("Payment verification failed", error);
                        showToast('Error', 'Payment verification failed. Please contact support.', 'error');
                    }
                },
                prefill: {
                    name: user?.username || "Student",
                    email: "student@example.com", 
                    contact: "9999999999"
                },
                theme: {
                    color: "#3399cc"
                }
            };
            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (err) {
            console.error("Payment initiation failed", err);
            showToast('Error', 'Could not initiate payment. Check console.', 'error');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (paymentMode === 'online') {
            await handleOnlinePayment();
        } else {
            showToast('Info', 'Please visit the Warden Office to pay via Cash. A ticket has been generated.', 'info');
            navigate('/student/dashboard'); 
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="px-6 py-4 bg-indigo-600">
                    <h2 className="text-xl font-bold text-white">Complete Your Registration Payment</h2>
                </div>

                <div className="p-6">
                    <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    Your room <strong>{stats?.roomNumber}</strong> in <strong>{stats?.buildingName}</strong> is reserved.
                                    Please confirm payment details to proceed.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6 grid grid-cols-2 gap-4 text-center">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <span className="block text-sm text-gray-500">Total Fee</span>
                            <span className="block text-2xl font-bold text-gray-800">₹{stats?.totalFee || 0}</span>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <span className="block text-sm text-gray-500">Paid Amount</span>
                            <span className="block text-2xl font-bold text-green-600">₹{stats?.paidFee || 0}</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select Payment Mode</label>
                            <div className="flex space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setPaymentMode('online')}
                                    className={`flex-1 py-3 px-4 rounded-lg border-2 text-center ${paymentMode === 'online' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    Online Payment
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPaymentMode('cash')}
                                    className={`flex-1 py-3 px-4 rounded-lg border-2 text-center ${paymentMode === 'cash' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    Cash Payment (Office)
                                </button>
                            </div>
                        </div>

                        {paymentMode === 'online' && (
                            <div className="mb-6">
                                <div className="flex items-center mb-4">
                                    <input
                                        id="emi-option"
                                        type="checkbox"
                                        checked={isEmi}
                                        onChange={(e) => setIsEmi(e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="emi-option" className="ml-2 block text-sm text-gray-900">
                                        Opt for EMI (Installments)
                                    </label>
                                </div>

                                {isEmi && (
                                    <div className="ml-6 p-4 bg-gray-50 rounded-md">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Number of Installments</label>
                                        <select
                                            value={emiMonths}
                                            onChange={(e) => setEmiMonths(Number(e.target.value))}
                                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        >
                                            <option value={2}>2 Months</option>
                                            <option value={3}>3 Months</option>
                                            <option value={4}>4 Months</option>
                                        </select>
                                        <p className="mt-2 text-sm text-gray-500">
                                            Estimated Monthly: ₹{Math.ceil((stats?.totalFee || 0) / emiMonths)}
                                        </p>
                                    </div>
                                )}

                                <p className="text-sm text-gray-500 mt-4 h-15">
                                    You will be redirected to Razorpay to complete the payment of
                                    <strong> ₹{isEmi ? Math.ceil((stats?.totalFee || 0) / emiMonths) : (stats?.totalFee || 0) - (stats?.paidFee || 0)}</strong>.
                                </p>
                            </div>
                        )}

                        {paymentMode === 'cash' && (
                            <div className="mb-6 p-4 bg-blue-50 text-blue-800 rounded-md text-sm">
                                Please visit the Warden's office to complete your payment in cash.
                                A ticket will be generated for your reference.
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            {paymentMode === 'online' ? 'Proceed to Pay' : 'Generate Cash Ticket'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default StudentPayment;
