import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { useNotification } from '../../context/NotificationContext';
import { Users, UserPlus, NotePencil, EnvelopeSimple, Phone, IdentificationCard, House, CheckCircle, Info, XCircle } from 'phosphor-react';

const ManageStaff = () => {
    const { showToast } = useNotification();
    const [view, setView] = useState('list'); 
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        fullName: '',
        email: '',
        phoneNumber: '',
        gender: 'MALE',
        staffType: 'WARDEN',
        managesMess: false,
        buildingIds: []
    });
    const [staffList, setStaffList] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingStaffId, setEditingStaffId] = useState(null);

    // Fetch data on mount
    useEffect(() => {
        fetchBuildings();
        fetchStaff();
    }, []);

    const fetchBuildings = async () => {
        try {
            const data = await adminService.getAllBuildings();
            setBuildings(data);
        } catch (error) {
            console.error("Failed to fetch buildings");
        }
    };

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const data = await adminService.listStaff();
            setStaffList(data);
        } catch (error) {
            console.error("Failed to fetch staff");
            showToast('Error', 'Failed to load staff list', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCheckboxChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.checked });
    };

    const handleBuildingChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => Number(option.value));
        setFormData({ ...formData, buildingIds: selectedOptions });
    };

    const handleSingleBuildingChange = (e) => {
        setFormData({ ...formData, buildingIds: e.target.value ? [Number(e.target.value)] : [] });
    };

    const resetForm = () => {
        setFormData({
            username: '',
            password: '',
            fullName: '',
            email: '',
            phoneNumber: '',
            gender: 'MALE',
            staffType: 'WARDEN',
            managesMess: false,
            buildingIds: []
        });
        setEditingStaffId(null);
    };

    const handleEdit = (staff) => {
        setEditingStaffId(staff.staffId);
        setFormData({
            fullName: staff.fullName || '',
            email: staff.user?.email || '',
            phoneNumber: staff.user?.phoneNumber || '',
            staffType: staff.staffType || 'WARDEN',
            managesMess: staff.managesMess || false,
            buildingIds: staff.buildingIds || []
        });
        setView('edit');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!formData.fullName.trim()) {
            showToast('Error', 'Full Name is required', 'error');
            setLoading(false);
            return;
        }

        if (view === 'add') {
            if (!formData.username.trim()) {
                showToast('Error', 'Username is required', 'error');
                setLoading(false);
                return;
            }
            if (!formData.password || formData.password.length < 6) {
                showToast('Error', 'Password must be at least 6 characters', 'error');
                setLoading(false);
                return;
            }
        }

        let payload = { ...formData };
        if (formData.staffType === 'GUARD') {
            payload.buildingIds = buildings.map(b => b.buildingId);
        }

        try {
            if (view === 'add') {
                await adminService.addStaff(payload);
                showToast('Success', `Staff "${formData.fullName}" added successfully`, 'success');
            } else {
                await adminService.updateStaff(editingStaffId, payload);
                showToast('Success', `Staff info updated successfully`, 'success');
            }
            resetForm();
            setView('list');
            fetchStaff();
        } catch (error) {
            console.error(error);
            const errorMsg = error.response?.data?.message || 'Failed to process request';
            showToast('Error', errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    const getBuildingNames = (ids) => {
        if (!ids || ids.length === 0) return 'None';
        if (ids.length === buildings.length && buildings.length > 0) return 'All Buildings';
        return ids.map(id => buildings.find(b => b.buildingId === id)?.buildingName).filter(Boolean).join(', ');
    };

    const inputClass = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border";

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    {view === 'list' ? <Users size={28} className="text-indigo-600" /> : (view === 'edit' ? <NotePencil size={28} className="text-indigo-600" /> : <UserPlus size={28} className="text-indigo-600" />)}
                    {view === 'list' ? 'Staff Members' : (view === 'edit' ? 'Edit Staff Details' : 'Add New Staff Member')}
                </h2>
                <button
                    onClick={() => { setView(view === 'list' ? 'add' : 'list'); resetForm(); }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium"
                >
                    {view === 'list' ? (
                        <><UserPlus size={18} weight="bold" /> Add New Staff</>
                    ) : (
                        <><Users size={18} weight="bold" /> View Staff List</>
                    )}
                </button>
            </div>

            {view === 'list' ? (
                <div className="app-card">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Buildings</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {staffList.map((staff) => (
                                    <tr key={staff.staffId} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            <div className="flex items-center gap-2">
                                                <IdentificationCard size={18} className="text-indigo-500" />
                                                {staff.fullName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium">{staff.staffType}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
                                            <div className="flex items-center gap-1.5">
                                                <House size={16} />
                                                {getBuildingNames(staff.buildingIds)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => handleEdit(staff)} className="flex items-center gap-1 text-indigo-600 hover:text-indigo-900 ml-auto">
                                                <NotePencil size={18} />
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {staffList.length === 0 && !loading && (
                                    <tr><td colSpan="4" className="px-6 py-4 text-center text-gray-500">No staff members found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="app-card">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                                    <IdentificationCard size={18} className="text-indigo-600" />
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required className={inputClass} />
                            </div>
                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                                    <EnvelopeSimple size={18} className="text-indigo-600" />
                                    Email Address
                                </label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                                    <Phone size={18} className="text-indigo-600" />
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    pattern="[0-9]{10}"
                                    maxLength="10"
                                    placeholder="Enter 10-digit number"
                                    value={formData.phoneNumber}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '');
                                        setFormData({ ...formData, phoneNumber: value });
                                    }}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                                    <Users size={18} className="text-indigo-600" />
                                    Staff Role <span className="text-red-500">*</span>
                                </label>
                                <select name="staffType" value={formData.staffType} onChange={handleChange} className={inputClass} disabled={view === 'edit'}>
                                    <option value="WARDEN">Warden</option>
                                    <option value="GUARD">Security Guard</option>
                                    <option value="MESS">Mess Staff</option>
                                    <option value="CLEANER">Cleaner</option>
                                    <option value="ELECTRICIAN">Electrician</option>
                                    <option value="PLUMBER">Plumber</option>
                                </select>
                            </div>
                        </div>

                        {formData.staffType !== 'GUARD' && (
                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                                    <House size={18} className="text-indigo-600" />
                                    Assign Building(s) <span className="text-red-500">*</span>
                                </label>
                                {formData.staffType === 'WARDEN' ? (
                                    <select onChange={handleSingleBuildingChange} value={formData.buildingIds?.[0] || ''} className={inputClass} required>
                                        <option value="">Select Building</option>
                                        {buildings.map(b => <option key={b.buildingId} value={b.buildingId}>{b.buildingName}</option>)}
                                    </select>
                                ) : (
                                    <select multiple onChange={handleBuildingChange} value={formData.buildingIds || []} className={`${inputClass} h-32`} required>
                                        {buildings.map(b => <option key={b.buildingId} value={b.buildingId}>{b.buildingName}</option>)}
                                    </select>
                                )}
                            </div>
                        )}

                        {formData.staffType === 'WARDEN' && (
                            <div className="flex items-center space-x-3 bg-amber-50 p-4 rounded-lg border border-amber-200">
                                <input type="checkbox" name="managesMess" id="managesMess" checked={formData.managesMess} onChange={handleCheckboxChange} className="h-5 w-5 text-amber-600 rounded" />
                                <label htmlFor="managesMess" className="text-sm font-semibold text-amber-900">
                                    Mess Management Authority
                                    <span className="block font-normal text-amber-800 opacity-80 mt-0.5">Grants global access to Mess Menu, Payments, and Attendance.</span>
                                </label>
                            </div>
                        )}

                        {view === 'add' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                                        <Users size={18} className="text-indigo-600" />
                                        Username <span className="text-red-500">*</span>
                                    </label>
                                    <input type="text" name="username" value={formData.username} onChange={handleChange} required className={inputClass} placeholder="Create username" />
                                </div>
                                <div>
                                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                                        <Info size={18} className="text-indigo-600" />
                                        Password <span className="text-red-500">*</span>
                                    </label>
                                    <input type="password" name="password" value={formData.password} onChange={handleChange} required className={inputClass} placeholder="Min 6 characters" />
                                </div>
                            </div>
                        )}

                        <div className="flex space-x-3 pt-4">
                            <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 font-semibold shadow-md transition-all">
                                {loading ? 'Processing...' : (view === 'add' ? <><UserPlus size={20} weight="bold" /> Add Staff Member</> : <><CheckCircle size={20} weight="bold" /> Update Staff Info</>)}
                            </button>
                            <button type="button" onClick={() => { setView('list'); resetForm(); }} className="flex items-center justify-center gap-2 px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium">
                                <XCircle size={18} />
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ManageStaff;
