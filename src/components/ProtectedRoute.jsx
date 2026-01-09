
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { currentUser } = useAuth();

    // In a real app with role-based auth, we'd check claims here too.
    // For now, any auth user is admin.

    if (!currentUser) {
        return <Navigate to="/admin/login" />;
    }

    return children;
};

export default ProtectedRoute;
