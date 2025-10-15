// src/routes/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import Loading from "../../components/ui/Loading";

const ProtectedRoute = ({ allowedRoles = [], children }) => {
	const { isAuthenticated, user, isLoading } = useAuth();
	const location = useLocation();

	if (isLoading) return <Loading />;

	// Not logged in or no user
	if (!isAuthenticated || !user) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	// Role restriction
	if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
		return <div>You don't have permission to access this page.</div>;
	}

	return children;
};

export default ProtectedRoute;
