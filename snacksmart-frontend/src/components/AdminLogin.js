import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const AdminLogin = ({ onLogin }) => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await axios.post('http://localhost:9090/api/auth/admin-login', credentials);
            
            if (response.data.message === 'Admin login successful') {
                // Create proper user object for admin
                const adminUser = {
                    id: response.data.id || 1,
                    username: credentials.username,
                    email: response.data.email || 'admin@snacksmart.com',
                    role: 'ADMIN'
                };
                
                localStorage.setItem('user', JSON.stringify(adminUser));
                localStorage.setItem('token', response.data.token || 'admin-token');
                
                if (onLogin) {
                    onLogin(adminUser);
                }
                
                toast.success('Welcome Admin!');
                navigate('/admin-dashboard');
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Login failed';
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
                className="relative bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-blue-100"
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
                    <p className="text-gray-600">Admin Portal</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Username */}
                    <div className="relative">
                        <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Admin Username"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                            value={credentials.username}
                            onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                            required
                        />
                    </div>

                    {/* Password */}
                    <div className="relative">
                        <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="password"
                            placeholder="Admin Password"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                            value={credentials.password}
                            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                            required
                        />
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="text-red-500 text-sm p-2 bg-red-50 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                    >
                        {loading ? 'Signing In...' : 'Admin Login'}
                    </motion.button>
                </form>

                {/* Back to Login */}
                <div className="text-center mt-6">
                    <button
                        onClick={() => navigate('/login')}
                        className="text-gray-600 hover:text-blue-600 transition-colors text-sm"
                    >
                        Back to User Login
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminLogin;