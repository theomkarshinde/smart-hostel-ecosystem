import React, { useState, useEffect } from 'react';
import wardenService from '../../services/wardenService';
import Loader from '../../components/Loader';
import { useNotification } from '../../context/NotificationContext';

const WardenLaundry = () => {
    const { showToast } = useNotification();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const data = await wardenService.getAllLaundry();
            setBookings(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await wardenService.updateLaundryStatus(id, newStatus);
            showToast('Success', `Status updated to ${newStatus}`, 'success');
            setBookings(bookings.map(b => b.bookingId === id ? { ...b, status: newStatus } : b));
        } catch (error) {
            console.error(error);
            showToast('Error', error.message || 'Failed to update status', 'error');
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Laundry Management</h2>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clothes</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {bookings.length > 0 ? (
                                bookings.map((booking) => (
                                    <tr key={booking.bookingId}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{booking.bookingId}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.studentId}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.clothesCount}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${booking.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                                    booking.status === 'WASHED' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-yellow-100 text-yellow-800'}`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            {booking.status === 'BOOKED' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(booking.bookingId, 'WASHED')}
                                                    className="bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100"
                                                >
                                                    Mark Washed
                                                </button>
                                            )}
                                            {booking.status === 'WASHED' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(booking.bookingId, 'DELIVERED')}
                                                    className="bg-green-50 text-green-600 px-3 py-1 rounded hover:bg-green-100"
                                                >
                                                    Mark Delivered
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">No bookings found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default WardenLaundry;
