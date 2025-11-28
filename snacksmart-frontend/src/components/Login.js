import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { authAPI } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'CUSTOMER',
    // Restaurant details
    restaurantName: '',
    phone: '',
    address: '',
    description: '',
    logo: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Helper function to extract error message safely
  const getErrorMessage = (error) => {
    if (typeof error === 'string') return error;
    if (error?.response?.data?.message) return error.response.data.message;
    if (error?.response?.data?.error) return error.response.data.error;
    if (error?.message) return error.message;
    return 'Authentication failed';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        const response = await authAPI.login({
          username: formData.username,
          password: formData.password
        });
        toast.success('Welcome to SnackSmart!');
        onLogin(response.data);
        // Navigate based on role
        switch(response.data.role) {
          case 'CUSTOMER':
            navigate('/customer-dashboard');
            break;
          case 'OWNER':
            navigate('/owner-dashboard');
            break;
          case 'ADMIN':
            navigate('/admin-dashboard');
            break;
          default:
            navigate('/customer-dashboard');
        }
      } else {
        if (formData.role === 'OWNER') {
          if (formData.password !== formData.confirmPassword) {
            throw new Error('Passwords do not match');
          }
          // Register owner with restaurant details
          await authAPI.registerOwner(formData);
          toast.success('Restaurant registered successfully! Please login.');
        } else {
          await authAPI.signup(formData);
          toast.success('Registration successful! Please login.');
        }
        setIsLogin(true);
      }
    } catch (err) {
      console.log('Auth Error:', JSON.stringify(err.response?.data, null, 2));
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      toast.error(errorMsg);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <Toaster position="top-right" />
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-blue-600" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(37,99,235,0.3) 1px, transparent 0)',
          backgroundSize: '20px 20px'
        }}></div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative bg-white rounded-3xl p-8 w-full shadow-2xl border border-blue-100 ${
          !isLogin && formData.role === 'OWNER' ? 'max-w-lg' : 'max-w-md'
        }`}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-6xl mb-4"
          >
            🍔
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent mb-2">
            SnackSmart
          </h1>
          <p className="text-gray-600">Eat Smart. Discover Restaurants Near You.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div className="relative">
            <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Username"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
          </div>

          {/* Email (only for signup) */}
          {!isLogin && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="relative"
            >
              <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                placeholder="Email"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </motion.div>
          )}

          {/* Password */}
          <div className="relative">
            <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-12 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>

          {/* Confirm Password (only for signup) */}
          {!isLogin && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="relative"
            >
              <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="password"
                placeholder="Confirm Password"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                required
              />
            </motion.div>
          )}

          {/* Role (only for signup) */}
          {!isLogin && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="relative"
            >
              <select
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="CUSTOMER">Customer</option>
                <option value="OWNER">Restaurant Owner</option>
              </select>
            </motion.div>
          )}

          {/* Restaurant Details (only for owner signup) */}
          {!isLogin && formData.role === 'OWNER' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4 border-t pt-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Restaurant Details</h3>
              
              {/* Restaurant Name */}
              <input
                type="text"
                placeholder="Restaurant Name"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={formData.restaurantName}
                onChange={(e) => setFormData({...formData, restaurantName: e.target.value})}
                required
              />
              
              {/* Phone */}
              <input
                type="tel"
                placeholder="Phone Number"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
              />
              
              {/* Address */}
              <input
                type="text"
                placeholder="Restaurant Address"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                required
              />
              
              {/* Description */}
              <textarea
                placeholder="Restaurant Description"
                rows="3"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
              
              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Logo (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  onChange={(e) => setFormData({...formData, logo: e.target.files[0]})}
                />
              </div>
            </motion.div>
          )}

          {/* Error Display */}
          {error && (
            <div className="text-red-500 text-sm p-2 bg-red-50 rounded-lg">
              {typeof error === 'string' ? error : error.message || error.error || 'Unexpected error'}
            </div>
          )}

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </motion.button>
        </form>

        {/* Toggle */}
        <div className="text-center mt-6">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-gray-600 hover:text-blue-600 transition-colors"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
          
          {/* Admin Login Link */}
          <div className="mt-4">
            <button
              onClick={() => navigate('/admin-login')}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Admin Login
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;