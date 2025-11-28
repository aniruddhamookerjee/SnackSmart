import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation
} from 'react-router-dom';
import { motion } from 'framer-motion';
import Login from './components/Login';
import AdminLogin from './components/AdminLogin';
import CustomerDashboard from './components/CustomerDashboard';
import OwnerDashboard from './components/OwnerDashboard';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load stored user from localStorage only once
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (err) {
        console.error('Invalid user data in localStorage');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    if (userData && userData.role) {
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      console.error('Invalid user data: missing role');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="text-6xl"
        >
          🍔
        </motion.div>
      </div>
    );
  }

  return (
    <Router>
      <MainRoutes user={user} handleLogin={handleLogin} handleLogout={handleLogout} />
    </Router>
  );
}

// Separate routing logic
function MainRoutes({ user, handleLogin, handleLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect users only once when they log in or load with a role
  useEffect(() => {
    if (user && user.role) {
      if (location.pathname === '/') {
        const lowerRole = user.role.toLowerCase();
        if (lowerRole === 'admin') navigate('/admin-dashboard');
        else if (lowerRole === 'owner') navigate('/owner-dashboard');
        else if (lowerRole === 'customer') navigate('/customer-dashboard');
      }
    }
  }, [user, navigate, location.pathname]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          user && user.role ? (
            <Navigate to={`/${user.role.toLowerCase()}-dashboard`} replace />
          ) : (
            <Login onLogin={handleLogin} />
          )
        }
      />
      <Route path="/login" element={<Login onLogin={handleLogin} />} />
      <Route path="/admin-login" element={<AdminLogin onLogin={handleLogin} />} />

      <Route
        path="/customer-dashboard"
        element={
          user?.role === 'CUSTOMER' ? (
            <CustomerDashboard user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/owner-dashboard"
        element={
          user?.role === 'OWNER' ? (
            <OwnerDashboard user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/admin-dashboard"
        element={
          user?.role === 'ADMIN' ? (
            <AdminDashboard user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/admin-login" replace />
          )
        }
      />
    </Routes>
  );
}

export default App;
