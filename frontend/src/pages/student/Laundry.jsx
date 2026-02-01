import React, { useState, useEffect } from 'react';
import studentService from '../../services/studentService';
import Loader from '../../components/Loader';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

const Laundry = () => {
    const { addNotification } = useNotification();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const [clothesCount, setClothesCount] = useState('');

    const [studentId, setStudentId] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        if (user?.username) {
            fetchStudentId();
            fetchBookings();
        }
    }, [user]);

    const fetchStudentId = async () => {
        try {
            const stats = await studentService.getStats();
            if (stats && stats.studentId) {
                setStudentId(stats.studentId);
            }
        } catch (error) {
            console.error("Failed to fetch student ID", error);
        }
    };

    const fetchBookings = async () => {
        try {
            const data = await studentService.getLaundryBookings();
            setBookings(data);
        } catch (error) {
            console.error("Failed to fetch laundry bookings", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBook = async (e) => {
        e.preventDefault();
        if (!studentId) {
            addNotification('Error', 'Student ID not found. Please refresh.');
            return;
        }

        try {
            const ratePerCloth = 10;
            const amount = parseInt(clothesCount) * ratePerCloth;

            await studentService.bookLaundry({
                studentId: studentId,
                clothesCount: parseInt(clothesCount),
                amount: amount
            });

            addNotification('Success', 'Laundry booked successfully');
            setClothesCount('');
            fetchBookings();
        } catch (error) {
            console.error("Booking failed", error);
            addNotification('Error', error.message || 'Failed to book laundry');
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Laundry Service</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Booking Form */}
                <div className="bg-white p-6 rounded-lg shadow-md h-fit">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Book Service</h3>
                    <form onSubmit={handleBook}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Clothes</label>
                            <input
                                type="number"
                                value={clothesCount}
                                onChange={(e) => setClothesCount(e.target.value)}
                                min="1"
                                max="20"
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">Rate: ₹10 per cloth</p>
                        </div>
                        {clothesCount && (
                            <div className="mb-4 bg-gray-50 p-2 rounded text-sm">
                                Est. Amount: <span className="font-bold">₹{parseInt(clothesCount) * 10}</span>
                            </div>
                        )}
                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition"
                        >
                            Confirm Booking
                        </button>
                    </form>
                </div>

                {/* History */}
                <div className="md:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800">Booking History</h3>
                    </div>
                    {loading ? <Loader /> : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clothes</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {bookings.length > 0 ? (
                                        bookings.map((booking) => (
                                            <tr key={booking.bookingId}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{booking.bookingId}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.clothesCount}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{booking.amount}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                        ${booking.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                                            booking.status === 'WASHED' ? 'bg-blue-100 text-blue-800' :
                                                                'bg-yellow-100 text-yellow-800'}`}>
                                                        {booking.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">No bookings found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Laundry;
