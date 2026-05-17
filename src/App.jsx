import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import ErrorBoundary from './components/ErrorBoundary';
import Wallet from './pages/Wallet';
import Portfolio from './pages/Portfolio';
import TradeLogs from './pages/TradeLogs';
import IPOPortal from './pages/IPOPortal';
import Markets from './pages/Markets';
import KYC from './pages/KYC';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ color: 'white', padding: '20px' }}>Loading SecuaTrade...</div>;
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ color: 'white', padding: '20px' }}>Loading SecuaTrade...</div>;
  if (!user) return <Navigate to="/login" />;
  if (!user.user?.is_staff) return <Navigate to="/dashboard" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <ErrorBoundary>
                  <AdminDashboard />
                </ErrorBoundary>
              </AdminRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <ErrorBoundary>
                  <Dashboard />
                </ErrorBoundary>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/wallet" 
            element={
              <PrivateRoute>
                <Wallet />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/portfolio" 
            element={
              <PrivateRoute>
                <Portfolio />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/logs" 
            element={
              <PrivateRoute>
                <TradeLogs />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/ipo" 
            element={
              <PrivateRoute>
                <IPOPortal />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/markets" 
            element={
              <PrivateRoute>
                <Markets />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/kyc" 
            element={
              <PrivateRoute>
                <KYC />
              </PrivateRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
