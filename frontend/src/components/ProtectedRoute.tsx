import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
  role?: 'ADMIN' | 'EMPLOYEE';
}

const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  const token = localStorage.getItem('token');
  const currentRole = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role && currentRole && role !== currentRole) {
    return <Navigate to={currentRole === 'ADMIN' ? '/admin' : '/employee'} replace />;
  }

  return children;
};

export default ProtectedRoute;
