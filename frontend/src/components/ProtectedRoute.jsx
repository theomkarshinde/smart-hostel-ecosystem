import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
    const { isAuthenticated, user, authLoading } = useAuth();
    const role = user?.role;

    // Wait for Auth Hydration
    if (authLoading) {
        return <div className="flex justify-center items-center h-screen">Loading Auth...</div>;
    }

    //Check Authentication
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    //Check Role Access
    if (allowedRoles && user?.role && !allowedRoles.map(r => r.toLowerCase()).includes(user.role.toLowerCase())) {
        return <Navigate to="/login" replace />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.map(r => r.toLowerCase()).includes(role?.toLowerCase())) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
