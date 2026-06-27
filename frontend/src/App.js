import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './utils/AuthContext';
import LoginPage from './pages/LoginPage';
import AdminLayout from './pages/admin/AdminLayout';
import AgentLayout from './pages/agent/AgentLayout';
import './styles/global.css';

function RequireAuth({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    const isAdmin = ['Super Admin', 'Branch Admin'].includes(user.role);
    return <Navigate to={isAdmin ? '/admin' : '/agent'} replace />;
  }
  return children;
}

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const isAdmin = ['Super Admin', 'Branch Admin'].includes(user.role);
  return <Navigate to={isAdmin ? '/admin' : '/agent'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/admin/*"
            element={
              <RequireAuth roles={['Super Admin', 'Branch Admin']}>
                <AdminLayout />
              </RequireAuth>
            }
          />
          <Route
            path="/agent/*"
            element={
              <RequireAuth roles={['Agent', 'Branch Admin', 'Super Admin']}>
                <AgentLayout />
              </RequireAuth>
            }
          />
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
