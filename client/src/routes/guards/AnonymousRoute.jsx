import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';

const AnonymousRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null; // Or a loader
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
};

export default AnonymousRoute;
