import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './auth/ProtectedRoute';
import Login from './pages/Login';
import UserHome from './pages/UserHome';
import AdminHome from './pages/AdminHome';

const App = () => {
  // Clean up any old localStorage sessions on app mount
  useEffect(() => {
    const oldSession = localStorage.getItem('falta.session');
    if (oldSession) {
      console.log('Clearing old localStorage session');
      localStorage.removeItem('falta.session');
      localStorage.removeItem('falta.admin.token');
      localStorage.removeItem('falta.admin.email');
    }
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute requiredRole="user" />}>
        <Route path="/app" element={<UserHome />} />
      </Route>

      <Route element={<ProtectedRoute requiredRole="admin" />}>
        <Route path="/admin" element={<AdminHome />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
