import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AdminLayout from './pages/admin/AdminLayout';
import TelecallerLayout from './pages/telecaller/TelecallerLayout';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/telecaller'} replace /> : <Login />} />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/telecaller/*"
        element={
          <ProtectedRoute allowedRoles={['telecaller']}>
            <TelecallerLayout />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : '/telecaller') : '/login'} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
