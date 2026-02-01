import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import Loader from '../components/Loader';

const AuthLayout = lazy(() => import('../layouts/AuthLayout'));
const AdminLayout = lazy(() => import('../layouts/AdminLayout'));
const WardenLayout = lazy(() => import('../layouts/WardenLayout'));
const StudentLayout = lazy(() => import('../layouts/StudentLayout'));
const StaffLayout = lazy(() => import('../layouts/StaffLayout'));
const GuardLayout = lazy(() => import('../layouts/GuardLayout'));

const Login = lazy(() => import('../pages/auth/Login'));
const StudentRegister = lazy(() => import('../pages/auth/StudentRegister'));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'));

const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));
const HostelBuildings = lazy(() => import('../pages/admin/HostelBuildings'));

const ManageStaff = lazy(() => import('../pages/admin/ManageStaff'));
const Settings = lazy(() => import('../pages/admin/Settings'));

const WardenDashboard = lazy(() => import('../pages/warden/Dashboard'));
const PendingStudents = lazy(() => import('../pages/warden/PendingStudents'));
const RegisterStudent = lazy(() => import('../pages/warden/RegisterStudent'));
const WardenComplaints = lazy(() => import('../pages/warden/Complaints'));
const MessMenu = lazy(() => import('../pages/warden/MessMenu'));
const MessPlans = lazy(() => import('../pages/warden/MessPlans'));
const MessAttendance = lazy(() => import('../pages/warden/MessAttendance'));
const WardenLaundry = lazy(() => import('../pages/warden/Laundry'));
const WardenPayments = lazy(() => import('../pages/warden/Payments'));
const StaffAttendancePage = lazy(() => import('../pages/warden/StaffAttendance'));
const WardenVisitors = lazy(() => import('../pages/warden/Visitors'));
const AllStudents = lazy(() => import('../pages/warden/AllStudents'));

const StudentDashboard = lazy(() => import('../pages/student/Dashboard'));
const StudentAttendance = lazy(() => import('../pages/student/Attendance'));
const Mess = lazy(() => import('../pages/student/Mess'));
const Laundry = lazy(() => import('../pages/student/Laundry'));
const Payments = lazy(() => import('../pages/student/Payments'));
const Profile = lazy(() => import('../pages/common/Profile'));
const StudentComplaints = lazy(() => import('../pages/student/Complaints'));
const PendingApproval = lazy(() => import('../pages/student/PendingApproval'));
const StudentPayment = lazy(() => import('../pages/student/StudentPayment'));
const StudentVisitors = lazy(() => import('../pages/student/Visitors'));

const StaffDashboard = lazy(() => import('../pages/staff/Dashboard'));
const StaffAttendance = lazy(() => import('../pages/staff/Attendance'));
const StaffComplaints = lazy(() => import('../pages/staff/Complaints'));

const GuardDashboard = lazy(() => import('../pages/guard/Dashboard'));
const VisitorEntry = lazy(() => import('../pages/guard/VisitorEntry'));
const GuardAttendance = lazy(() => import('../pages/guard/Attendance'));

const AppRoutes = () => {
    return (
        <Suspense fallback={<Loader fullScreen={true} />}>
            <Routes>
                {/* Public Routes */}
                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<StudentRegister />} />
                    <Route path="/reset-password" element={<ForgotPassword />} />
                </Route>

                {/* Redirect root to login */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Admin Routes */}
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="hostel-buildings" element={<HostelBuildings />} />

                        <Route path="manage-staff" element={<ManageStaff />} />
                        <Route path="attendance" element={<StaffAttendancePage />} />
                        <Route path="register-student" element={<RegisterStudent />} />
                        <Route path="settings" element={<Settings />} />
                    </Route>
                </Route>

                {/* Warden Routes */}
                <Route element={<ProtectedRoute allowedRoles={['warden']} />}>
                    <Route path="/warden" element={<WardenLayout />}>
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<WardenDashboard />} />
                        <Route path="pending-students" element={<PendingStudents />} />
                        <Route path="register-student" element={<RegisterStudent />} />
                        <Route path="complaints" element={<WardenComplaints />} />
                        <Route path="mess-menu" element={<MessMenu />} />
                        <Route path="mess-plans" element={<MessPlans />} />
                        <Route path="mess-attendance" element={<MessAttendance />} />
                        <Route path="laundry" element={<WardenLaundry />} />
                        <Route path="payments" element={<WardenPayments />} />
                        <Route path="attendance" element={<StaffAttendancePage />} />
                        <Route path="visitors" element={<WardenVisitors />} />
                        <Route path="all-students" element={<AllStudents />} />
                        <Route path="profile" element={<Profile />} />
                    </Route>
                </Route>

                {/* Student Routes */}
                <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                    <Route path="/student" element={<StudentLayout />}>
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<StudentDashboard />} />
                        <Route path="attendance" element={<StudentAttendance />} />
                        <Route path="mess" element={<Mess />} />
                        <Route path="laundry" element={<Laundry />} />
                        <Route path="payments" element={<Payments />} />
                        <Route path="profile" element={<Profile />} />
                        <Route path="complaints" element={<StudentComplaints />} />
                        <Route path="pending-approval" element={<PendingApproval />} />
                        <Route path="setup-payment" element={<StudentPayment />} />
                        <Route path="visitors" element={<StudentVisitors />} />
                    </Route>
                </Route>

                {/* Staff Routes */}
                <Route element={<ProtectedRoute allowedRoles={['staff']} />}>
                    <Route path="/staff" element={<StaffLayout />}>
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<StaffDashboard />} />
                        <Route path="attendance" element={<StaffAttendance />} />
                        <Route path="complaints" element={<StaffComplaints />} />
                        <Route path="profile" element={<Profile />} />
                    </Route>
                </Route>

                {/* Guard Routes */}
                <Route element={<ProtectedRoute allowedRoles={['guard']} />}>
                    <Route path="/guard" element={<GuardLayout />}>
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<GuardDashboard />} />
                        <Route path="visitor-entry" element={<VisitorEntry />} />
                        <Route path="attendance" element={<GuardAttendance />} />
                        <Route path="profile" element={<Profile />} />
                    </Route>
                </Route>

                {/* Catch all - 404 */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Suspense>
    );
};

export default AppRoutes;
