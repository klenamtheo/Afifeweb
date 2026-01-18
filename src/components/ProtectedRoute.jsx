
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { currentUser, userProfile, loading } = useAuth();

    if (loading) {
        return null; // Or a loading spinner if preferred, but null is usually safe for route transitions
    }

    if (!currentUser) {
        return <Navigate to="/admin/login" />;
    }

    // Role-based protection:
    // If user has a profile AND that profile is 'native', they are NOT an admin (unless hardcoded override)
    // Admins typically don't have a user profile doc in this system, or rely on explicit claims.
    if (userProfile && userProfile.role === 'native' && currentUser.email !== 'afifetownweb@gmail.com') {
        return <Navigate to="/portal" replace />;
    }

    return children;
};

export default ProtectedRoute;
