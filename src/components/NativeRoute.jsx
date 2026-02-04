import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader } from 'lucide-react';
import PendingApproval from '../pages/Portal/PendingApproval';

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

    const isOtpVerified = sessionStorage.getItem('otp_verified') === 'true';
    if (!isOtpVerified && currentUser.email !== 'afifetownweb@gmail.com') {
        // Force OTP verification if not session-verified (skip for special admin email if needed, 
        // but here we apply it generally for portal)
        return <Navigate to="/portal/login" replace />;
    }

    if (userProfile.status !== 'approved') {
        return <PendingApproval />;
    }

    return children;
};

export default NativeRoute;
