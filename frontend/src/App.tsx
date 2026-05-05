import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const home = token ? (role === 'ADMIN' ? '/admin' : '/employee') : '/login';

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">LeaveFlow</div>
        <div className="brand-sub">Leave Management System</div>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to={home} replace />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/employee"
            element={
              <ProtectedRoute role="EMPLOYEE">
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to={home} replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
