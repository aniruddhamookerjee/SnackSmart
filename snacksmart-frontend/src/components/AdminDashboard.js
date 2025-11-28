import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  UsersIcon, 
  BuildingStorefrontIcon, 
  ClipboardDocumentListIcon,
  ShoppingBagIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { restaurantAPI } from '../services/api';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const AdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRestaurants: 0,
    totalDishes: 0,
    totalCustomers: 0,
    totalOwners: 0,
    totalAdmins: 0,
    activeUsers: 0,
    blockedUsers: 0,
    activeRestaurants: 0,
    blockedRestaurants: 0,
    ordersToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [restaurantSearch, setRestaurantSearch] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [restaurantFilter, setRestaurantFilter] = useState('all');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Real-time updates every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, restaurantsRes, statsRes] = await Promise.all([
        axios.get('http://localhost:9090/api/admin/users'),
        restaurantAPI.getAll(),
        axios.get('http://localhost:9090/api/admin/stats')
      ]);
      setUsers(usersRes.data || []);
      setRestaurants(restaurantsRes.data || []);
      setStats(statsRes.data || {});
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserStatusToggle = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
      await axios.put(`http://localhost:9090/api/admin/user/${userId}/status`, { status: newStatus });
      toast.success(`User ${newStatus.toLowerCase()} successfully`);
      loadData();
    } catch (error) {
      toast.error('Error updating user status');
    }
  };

  const handleRestaurantStatusToggle = async (restaurantId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
      await axios.put(`http://localhost:9090/api/admin/restaurant/${restaurantId}/status`, { status: newStatus });
      toast.success(`Restaurant ${newStatus.toLowerCase()} successfully`);
      loadData();
    } catch (error) {
      toast.error('Error updating restaurant status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Delete this user?')) {
      try {
        await axios.delete(`http://localhost:9090/api/admin/user/${userId}`);
        toast.success('User deleted successfully');
        loadData();
      } catch (error) {
        toast.error('Error deleting user');
      }
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
                         user.email?.toLowerCase().includes(userSearch.toLowerCase());
    const matchesFilter = userFilter === 'all' || 
                         (userFilter === 'active' && user.status === 'ACTIVE') ||
                         (userFilter === 'blocked' && user.status === 'BLOCKED') ||
                         (userFilter === 'customers' && user.role === 'CUSTOMER') ||
                         (userFilter === 'owners' && user.role === 'OWNER');
    return matchesSearch && matchesFilter;
  });

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name?.toLowerCase().includes(restaurantSearch.toLowerCase()) ||
                         restaurant.address?.toLowerCase().includes(restaurantSearch.toLowerCase());
    const matchesFilter = restaurantFilter === 'all' || 
                         (restaurantFilter === 'active' && restaurant.status === 'ACTIVE') ||
                         (restaurantFilter === 'blocked' && restaurant.status === 'BLOCKED');
    return matchesSearch && matchesFilter;
  });

  const statsCards = [
    { 
      label: 'Total Users', 
      value: stats.totalUsers || 0, 
      color: 'from-blue-500 to-blue-600', 
      icon: UsersIcon,
      subtext: `${stats.activeUsers} active, ${stats.blockedUsers} blocked`
    },
    { 
      label: 'Restaurants', 
      value: stats.totalRestaurants || 0, 
      color: 'from-green-500 to-green-600', 
      icon: BuildingStorefrontIcon,
      subtext: `${stats.activeRestaurants} active, ${stats.blockedRestaurants} blocked`
    },
    { 
      label: 'Total Dishes', 
      value: stats.totalDishes || 0, 
      color: 'from-purple-500 to-purple-600', 
      icon: ClipboardDocumentListIcon,
      subtext: 'Across all restaurants'
    },
    { 
      label: 'Orders Today', 
      value: stats.ordersToday || 0, 
      color: 'from-orange-500 to-orange-600', 
      icon: ShoppingBagIcon,
      subtext: 'Live orders'
    }
  ];

  const pieData = [
    { name: 'Customers', value: stats.totalCustomers || 0, color: '#3B82F6' },
    { name: 'Owners', value: stats.totalOwners || 0, color: '#10B981' },
    { name: 'Admins', value: stats.totalAdmins || 0, color: '#F59E0B' }
  ];

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'restaurants', label: 'Restaurants', icon: '🏪' },
    { id: 'analytics', label: 'Analytics', icon: '📈' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      <Toaster position="top-right" />
      
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 shadow-xl">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            🍔 SnackSmart
          </h1>
          <p className="text-sm text-gray-400 mt-1">Admin Panel</p>
        </div>
        
        <nav className="mt-6">
          {sidebarItems.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ x: 4 }}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                activeTab === item.id
                  ? 'bg-orange-600 text-white border-r-2 border-orange-400'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span className="text-xl mr-3">{item.icon}</span>
              {item.label}
            </motion.button>
          ))}
        </nav>

        <div className="absolute bottom-6 left-6">
          <div className="mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold mb-2">
              {user.username?.charAt(0).toUpperCase()}
            </div>
            <p className="text-sm font-medium">{user.username}</p>
            <p className="text-xs text-gray-400">Administrator</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={onLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Logout
          </motion.button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {activeTab === 'dashboard' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Admin Dashboard</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={loadData}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                🔄 Refresh Data
              </motion.button>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statsCards.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-gradient-to-r ${stat.color} rounded-2xl p-6`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <stat.icon className="h-8 w-8 text-white/80" />
                  </div>
                  <p className="text-white/80 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-white mb-2">{stat.value}</p>
                  <p className="text-white/60 text-xs">{stat.subtext}</p>
                </motion.div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-2xl p-6">
                <h3 className="text-xl font-semibold mb-4">User Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: 'none', 
                        borderRadius: '8px',
                        color: '#fff'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-gray-800 rounded-2xl p-6">
                <h3 className="text-xl font-semibold mb-4">System Overview</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                    <span>Restaurant Owners</span>
                    <span className="font-bold text-green-400">{stats.totalOwners}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                    <span>Customers</span>
                    <span className="font-bold text-blue-400">{stats.totalCustomers}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                    <span>Active Restaurants</span>
                    <span className="font-bold text-purple-400">{stats.activeRestaurants}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                    <span>Total Dishes</span>
                    <span className="font-bold text-yellow-400">{stats.totalDishes}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">User Management</h2>
              <div className="text-gray-400">
                Total: {stats.totalUsers} users ({stats.totalCustomers} customers, {stats.totalOwners} owners)
              </div>
            </div>
            
            {/* Search and Filter */}
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
              <select
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
              >
                <option value="all">All Users</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
                <option value="customers">Customers</option>
                <option value="owners">Owners</option>
              </select>
            </div>
            
            <div className="bg-gray-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">User</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Role</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredUsers.map((user, index) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-700/50"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                              {user.username?.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium">{user.username}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-300">{user.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                            user.role === 'OWNER' ? 'bg-green-100 text-green-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status || 'ACTIVE'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              onClick={() => handleUserStatusToggle(user.id, user.status || 'ACTIVE')}
                              className={`p-2 rounded-lg transition-colors ${
                                (user.status || 'ACTIVE') === 'ACTIVE' 
                                  ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10' 
                                  : 'text-green-400 hover:text-green-300 hover:bg-green-500/10'
                              }`}
                              disabled={user.role === 'ADMIN'}
                            >
                              {(user.status || 'ACTIVE') === 'ACTIVE' ? <XMarkIcon className="h-5 w-5" /> : <CheckIcon className="h-5 w-5" />}
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                              disabled={user.role === 'ADMIN'}
                            >
                              <TrashIcon className="h-5 w-5" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'restaurants' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Restaurant Management</h2>
              <div className="text-gray-400">
                Total: {stats.totalRestaurants} restaurants with {stats.totalDishes} dishes
              </div>
            </div>
            
            {/* Search and Filter */}
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search restaurants..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={restaurantSearch}
                  onChange={(e) => setRestaurantSearch(e.target.value)}
                />
              </div>
              <select
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={restaurantFilter}
                onChange={(e) => setRestaurantFilter(e.target.value)}
              >
                <option value="all">All Restaurants</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRestaurants.map((restaurant, index) => (
                <motion.div
                  key={restaurant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800 rounded-2xl p-6 hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{restaurant.name}</h3>
                      <p className="text-gray-400 text-sm">{restaurant.address}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      (restaurant.status || 'ACTIVE') === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {restaurant.status || 'ACTIVE'}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-300">📞 {restaurant.phone}</p>
                    <p className="text-sm text-gray-300">⭐ {restaurant.rating || '4.0'}/5</p>
                    <p className="text-sm text-gray-300">
                      🍽️ {restaurant.menu?.length || 0} dishes
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => handleRestaurantStatusToggle(restaurant.id, restaurant.status || 'ACTIVE')}
                      className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center ${
                        (restaurant.status || 'ACTIVE') === 'ACTIVE'
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {(restaurant.status || 'ACTIVE') === 'ACTIVE' ? (
                        <>
                          <XMarkIcon className="h-4 w-4 mr-1" />
                          Block
                        </>
                      ) : (
                        <>
                          <CheckIcon className="h-4 w-4 mr-1" />
                          Unblock
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <h2 className="text-3xl font-bold mb-8">Analytics</h2>
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Advanced Analytics Coming Soon</h3>
              <p className="text-gray-400">Detailed insights and reports will be available here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;