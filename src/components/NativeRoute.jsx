
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader } from 'lucide-react';

const NativeRoute = ({ children }) => {
    const { currentUser, userProfile, loading } = useAuth();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader className="animate-spin text-afife-primary" /></div>;
    }

    if (!currentUser) {
        return <Navigate to="/portal/login" replace />;
    }

    if (!userProfile || userProfile.role !== 'native') {
        // If logged in but not a native (e.g. admin logged in regular portal, or random user)
        // Redirect to appropriate place or show unauthorized
        return <Navigate to="/portal/login" replace />;
    }

    if (userProfile.status !== 'approved') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Account Pending Approval</h2>
                    <p className="text-gray-600 mb-6">
                        Thank you for registering, {userProfile.fullName}. Your account is currently under review by the administration.
                        Security checks are in place to ensure only Afife natives have access.
                    </p>
                    <p className="text-sm text-gray-500">Please check back later.</p>
                </div>
            </div>
        )
    }

    return children;
};

export default NativeRoute;
