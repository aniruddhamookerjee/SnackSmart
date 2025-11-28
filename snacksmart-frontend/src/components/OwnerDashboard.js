import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  HomeIcon, 
  ClipboardDocumentListIcon, 
  ShoppingBagIcon, 
  CogIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  StarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { dishAPI, restaurantAPI } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';

const OwnerDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dishes, setDishes] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalDishes: 0,
    ordersToday: 0,
    averageRating: 4.0,
    revenue: 0
  });
  const [showModal, setShowModal] = useState(false);
  const [showRestaurantModal, setShowRestaurantModal] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    dishName: '',
    price: '',
    veg: true
  });
  const [restaurantFormData, setRestaurantFormData] = useState({
    name: '',
    address: '',
    phone: ''
  });
  const [showProfile, setShowProfile] = useState(false);
  const [showEditRestaurant, setShowEditRestaurant] = useState(false);
  const [editRestaurantData, setEditRestaurantData] = useState({
    name: '',
    address: '',
    phone: '',
    description: ''
  });

  const getErrorMessage = (error) => {
    if (typeof error === 'string') return error;
    if (error?.response?.data?.message) return error.response.data.message;
    if (error?.response?.data?.error) return error.response.data.error;
    if (error?.message) return error.message;
    return 'Something went wrong';
  };

  useEffect(() => {
    loadData();
  }, []);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfile && !event.target.closest('.profile-dropdown')) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfile]);

  const loadData = async () => {
    try {
      const restaurantsRes = await restaurantAPI.getAll();
      const userRestaurant = restaurantsRes.data?.find(r => r.ownerId === user.id);
      setRestaurant(userRestaurant || null);
      
      if (userRestaurant) {
        const dishesRes = await dishAPI.getByRestaurant(userRestaurant.id);
        setDishes(Array.isArray(dishesRes.data) ? dishesRes.data : []);
        
        try {
          const statsRes = await axios.get(`http://localhost:9090/api/restaurants/${userRestaurant.id}/stats`);
          setStats(statsRes.data);
        } catch (statsError) {
          console.error('Error loading stats:', statsError);
        }
        
        try {
          const ordersRes = await axios.get(`http://localhost:9090/api/orders/restaurant/${userRestaurant.id}`);
          setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
        } catch (orderError) {
          console.error('Error loading orders:', orderError);
          setOrders([]);
        }
      } else {
        setDishes([]);
        setOrders([]);
        setStats({ totalDishes: 0, ordersToday: 0, averageRating: 4.0, revenue: 0 });
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setDishes([]);
      setRestaurant(null);
      setOrders([]);
      toast.error('Error loading data');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingDish) {
        await dishAPI.update(editingDish.id, formData);
        toast.success('Dish updated successfully!');
      } else {
        if (!restaurant?.id) {
          throw new Error('Restaurant not found. Please register your restaurant first.');
        }
        await dishAPI.add({ ...formData, restaurantId: restaurant.id });
        toast.success('Dish added successfully!');
      }
      loadData();
      setShowModal(false);
      setEditingDish(null);
      setFormData({ dishName: '', price: '', veg: true });
    } catch (err) {
      console.log('API Error:', JSON.stringify(err.response?.data, null, 2));
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      toast.error(`Failed to save dish: ${errorMsg}`);
    }
  };

  const handleRestaurantSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const restaurantData = {
        ...restaurantFormData,
        ownerId: user.id
      };
      await restaurantAPI.add(restaurantData);
      toast.success('Restaurant registered successfully!');
      loadData();
      setShowRestaurantModal(false);
      setRestaurantFormData({ name: '', address: '', phone: '' });
    } catch (err) {
      console.log('Restaurant Registration Error:', JSON.stringify(err.response?.data, null, 2));
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      toast.error(`Failed to register restaurant: ${errorMsg}`);
    }
  };

  const handleEditRestaurant = () => {
    if (restaurant) {
      setEditRestaurantData({
        name: restaurant.name || '',
        address: restaurant.address || '',
        phone: restaurant.phone || '',
        description: restaurant.description || ''
      });
      setShowEditRestaurant(true);
      setShowProfile(false);
    }
  };

  const handleUpdateRestaurant = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await restaurantAPI.update(restaurant.id, editRestaurantData);
      toast.success('Restaurant updated successfully!');
      loadData();
      setShowEditRestaurant(false);
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      toast.error(`Failed to update restaurant: ${errorMsg}`);
    }
  };

  const handleEdit = (dish) => {
    setEditingDish(dish);
    setFormData({
      dishName: dish.dishName,
      price: dish.price,
      veg: dish.veg
    });
    setShowModal(true);
  };

  const handleDelete = async (dishId) => {
    if (window.confirm('Delete this dish?')) {
      try {
        await dishAPI.delete(dishId);
        toast.success('Dish deleted successfully!');
        loadData();
      } catch (error) {
        console.error('Error deleting dish:', error);
        toast.error('Error deleting dish');
      }
    }
  };

  // ✅ Added: Toggle Availability Function
  const toggleAvailability = async (dishId, currentStatus, dishName) => {
    try {
      await axios.put(`http://localhost:9090/api/dishes/${dishId}/availability`, {
        isAvailable: !currentStatus
      });
      toast.success(`Dish "${dishName}" is now ${!currentStatus ? 'Available' : 'Unavailable'}.`);
      loadData();
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Failed to update dish availability.');
    }
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
    { id: 'menu', label: 'Menu', icon: ClipboardDocumentListIcon },
    { id: 'orders', label: 'Orders', icon: ShoppingBagIcon },
    { id: 'settings', label: 'Settings', icon: CogIcon }
  ];

  const statsCards = [
    { 
      label: 'Total Dishes', 
      value: stats.totalDishes, 
      color: 'from-blue-500 to-blue-600', 
      icon: '🍽️',
      change: '+5 this week'
    },
    { 
      label: 'Orders Today', 
      value: stats.ordersToday, 
      color: 'from-green-500 to-green-600', 
      icon: '📦',
      change: '+12% from yesterday'
    },
    { 
      label: 'Average Rating', 
      value: Number(stats.averageRating).toFixed(1), 
      color: 'from-yellow-500 to-yellow-600', 
      icon: '⭐',
      change: '+0.2 this month'
    },
    { 
      label: 'Revenue', 
      value: `₹${stats.revenue}`, 
      color: 'from-purple-500 to-purple-600', 
      icon: '💰',
      change: '+18% this month'
    }
  ];

  const chartData = [
    { name: 'Mon', orders: 12, revenue: 2400 },
    { name: 'Tue', orders: 19, revenue: 1398 },
    { name: 'Wed', orders: 8, revenue: 9800 },
    { name: 'Thu', orders: 27, revenue: 3908 },
    { name: 'Fri', orders: 35, revenue: 4800 },
    { name: 'Sat', orders: 42, revenue: 3800 },
    { name: 'Sun', orders: 38, revenue: 4300 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex">
      <Toaster position="top-right" />
      
      <div className="w-64 bg-white shadow-xl border-r border-blue-100">
        <div className="p-6 border-b border-blue-100">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
            🍔 SnackSmart
          </h1>
          <p className="text-sm text-gray-600 mt-1">Owner Panel</p>
        </div>
        
        <nav className="mt-6">
          {sidebarItems.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ x: 4 }}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </motion.button>
          ))}
        </nav>

        <div className="absolute bottom-6 left-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={onLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
          >
            Logout
          </motion.button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow-sm border-b border-gray-200 px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Owner Dashboard</h1>
            <div className="relative profile-dropdown">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {user.username?.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">{user.username}</p>
                  <p className="text-xs text-gray-500">Restaurant Owner</p>
                </div>
              </motion.button>
              
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 p-6 z-50"
                >
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                      {user.username?.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="font-semibold text-gray-900">{user.username}</h3>
                    <p className="text-sm text-gray-500">Restaurant Owner</p>
                  </div>
                  
                  {restaurant ? (
                    <div className="space-y-3 border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Restaurant Details</h4>
                      <div>
                        <p className="text-xs text-gray-500">Name</p>
                        <p className="font-medium">{restaurant.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Address</p>
                        <p className="text-sm">{restaurant.address}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm">{restaurant.phone}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Rating</p>
                        <p className="text-sm flex items-center">
                          ⭐ {restaurant.rating || '4.0'}/5
                        </p>
                      </div>
                      <div className="pt-3 border-t">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          onClick={handleEditRestaurant}
                          className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors"
                        >
                          Edit Restaurant Details
                        </motion.button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 border-t">
                      <p className="text-sm text-gray-500 mb-3">No restaurant registered</p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => {
                          setShowRestaurantModal(true);
                          setShowProfile(false);
                        }}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 transition-colors"
                      >
                        Register Restaurant
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex-1 p-8">
          {activeTab === 'dashboard' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
                {!restaurant && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setShowRestaurantModal(true)}
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Register Restaurant
                  </motion.button>
                )}
              </div>
              
              {!restaurant && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-8">
                  <div className="flex items-center">
                    <div className="text-4xl mr-4">🏪</div>
                    <div>
                      <h3 className="text-lg font-semibold text-yellow-800 mb-1">Register Your Restaurant</h3>
                      <p className="text-yellow-700">You need to register your restaurant first before you can add dishes and manage orders.</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statsCards.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-gradient-to-r ${stat.color} rounded-2xl p-6 text-white shadow-lg`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-3xl">{stat.icon}</div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-white/80 text-sm">{stat.label}</p>
                      </div>
                    </div>
                    <p className="text-white/70 text-xs">{stat.change}</p>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">Weekly Performance</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }} 
                      />
                      <Bar dataKey="orders" fill="#3b82f6" radius={4} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {restaurant && (
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
                    <h3 className="text-xl font-semibold mb-4 text-gray-900">Restaurant Information</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-medium text-gray-900">{restaurant.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Address</p>
                        <p className="font-medium text-gray-900">{restaurant.address}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium text-gray-900">{restaurant.phone}</p>
                      </div>
                      <div className="flex items-center">
                        <StarIcon className="h-5 w-5 text-yellow-400 mr-1" />
                        <span className="font-medium text-gray-900">{restaurant.rating || '4.2'}/5</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'menu' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Menu Management</h2>
                {restaurant && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setShowModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Dish
                  </motion.button>
                )}
              </div>
              
              {!restaurant ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🏪</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Register your restaurant first</h3>
                  <p className="text-gray-600 mb-4">You need to register your restaurant before you can add dishes</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setShowRestaurantModal(true)}
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                  >
                    Register Restaurant
                  </motion.button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dishes.map((dish, index) => (
                      <motion.div
                        key={dish.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-blue-100"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">{dish.dishName}</h3>
                            <p className="text-blue-600 font-bold text-xl">₹{dish.price}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            dish.veg ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {dish.veg ? '🌿 Veg' : '🍗 Non-Veg'}
                          </span>
                        </div>
                        
                        {/* ✅ Availability Toggle */}
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-sm text-gray-700 font-medium">Available</label>
                          <input
                            type="checkbox"
                            checked={dish.isAvailable}
                            onChange={() => toggleAvailability(dish.id, dish.isAvailable, dish.dishName)}
                            className="h-5 w-5 accent-blue-600 cursor-pointer"
                          />
                        </div>
                        
                        <div className="flex space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => handleEdit(dish)}
                            className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
                          >
                            <PencilIcon className="h-4 w-4 mr-1" />
                            Edit
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => handleDelete(dish.id)}
                            className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center"
                          >
                            <TrashIcon className="h-4 w-4 mr-1" />
                            Delete
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {dishes.length === 0 && (
                    <div className="text-center py-16">
                      <div className="text-6xl mb-4">🍽️</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No dishes yet</h3>
                      <p className="text-gray-600">Add your first dish to get started</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Pickup Orders</h2>
              
              {orders.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">📦</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
                  <p className="text-gray-600">Orders will appear here when customers place them</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {orders.map((order, index) => (
                    <motion.div
                      key={order.orderId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">Order #{order.orderId}</h3>
                          <p className="text-blue-600 font-bold text-xl">₹{order.totalAmount}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'PREPARING' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'READY' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-gray-600 mb-4">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        <span className="text-sm">
                          Pickup: {new Date(order.pickupTime).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <div className="flex space-x-2">
                        {order.status === 'PENDING' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={async () => {
                              try {
                                await axios.put(`http://localhost:9090/api/orders/${order.orderId}/status`, 
                                  { status: 'PREPARING' });
                                loadData();
                                toast.success('Order marked as preparing');
                              } catch (error) {
                                toast.error('Error updating order');
                              }
                            }}
                            className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            Start Preparing
                          </motion.button>
                        )}
                        
                        {order.status === 'PREPARING' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={async () => {
                              try {
                                await axios.put(`http://localhost:9090/api/orders/${order.orderId}/status`, 
                                  { status: 'READY' });
                                loadData();
                                toast.success('Order marked as ready for pickup');
                              } catch (error) {
                                toast.error('Error updating order');
                              }
                            }}
                            className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors"
                          >
                            Mark Ready
                          </motion.button>
                        )}
                        
                        {order.status === 'READY' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={async () => {
                              try {
                                await axios.put(`http://localhost:9090/api/orders/${order.orderId}/status`, 
                                  { status: 'COLLECTED' });
                                loadData();
                                toast.success('Order marked as collected');
                              } catch (error) {
                                toast.error('Error updating order');
                              }
                            }}
                            className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
                          >
                            Mark Collected
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">Profile Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Username</p>
                      <p className="font-medium text-gray-900">{user.username}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Role</p>
                      <p className="font-medium text-gray-900">Restaurant Owner</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Change Password
                    </motion.button>
                  </div>
                </div>
                
                {restaurant && (
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
                    <h3 className="text-xl font-semibold mb-4 text-gray-900">Restaurant Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600">Restaurant Name</p>
                        <p className="font-medium text-gray-900">{restaurant.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Address</p>
                        <p className="text-sm text-gray-900">{restaurant.address}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="text-sm text-gray-900">{restaurant.phone}</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={handleEditRestaurant}
                        className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Edit Restaurant Details
                      </motion.button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-8 bg-red-50 rounded-2xl p-6 border border-red-200">
                <h3 className="text-xl font-semibold mb-4 text-red-900">Danger Zone</h3>
                <p className="text-red-700 mb-4">These actions cannot be undone.</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={onLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
                >
                  Logout
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md border border-blue-100"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-4 text-gray-900">
              {editingDish ? 'Edit Dish' : 'Add New Dish'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dish Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.dishName}
                  onChange={(e) => setFormData({...formData, dishName: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.veg}
                  onChange={(e) => setFormData({...formData, veg: e.target.value === 'true'})}
                >
                  <option value="true">🌿 Vegetarian</option>
                  <option value="false">🍗 Non-Vegetarian</option>
                </select>
              </div>
              
              {error && (
                <div className="text-red-500 text-sm mt-2 p-2 bg-red-50 rounded">
                  {typeof error === 'string' ? error : error.message || error.error || 'Unexpected error'}
                </div>
              )}
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
                >
                  {editingDish ? 'Update' : 'Add'} Dish
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
      
      {showRestaurantModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowRestaurantModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md border border-blue-100"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-4 text-gray-900">
              Register Your Restaurant
            </h3>
            
            <form onSubmit={handleRestaurantSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={restaurantFormData.name}
                  onChange={(e) => setRestaurantFormData({...restaurantFormData, name: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={restaurantFormData.address}
                  onChange={(e) => setRestaurantFormData({...restaurantFormData, address: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={restaurantFormData.phone}
                  onChange={(e) => setRestaurantFormData({...restaurantFormData, phone: e.target.value})}
                  required
                />
              </div>
              
              {error && (
                <div className="text-red-500 text-sm mt-2 p-2 bg-red-50 rounded">
                  {typeof error === 'string' ? error : error.message || error.error || 'Unexpected error'}
                </div>
              )}
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowRestaurantModal(false);
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
                >
                  Register Restaurant
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
      
      {showEditRestaurant && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowEditRestaurant(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md border border-blue-100"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-4 text-gray-900">
              Edit Restaurant Details
            </h3>
            
            <form onSubmit={handleUpdateRestaurant} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={editRestaurantData.name}
                  onChange={(e) => setEditRestaurantData({...editRestaurantData, name: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={editRestaurantData.address}
                  onChange={(e) => setEditRestaurantData({...editRestaurantData, address: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={editRestaurantData.phone}
                  onChange={(e) => setEditRestaurantData({...editRestaurantData, phone: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  value={editRestaurantData.description}
                  onChange={(e) => setEditRestaurantData({...editRestaurantData, description: e.target.value})}
                />
              </div>
              
              {error && (
                <div className="text-red-500 text-sm mt-2 p-2 bg-red-50 rounded">
                  {typeof error === 'string' ? error : error.message || error.error || 'Unexpected error'}
                </div>
              )}
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditRestaurant(false);
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
                >
                  Update Restaurant
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default OwnerDashboard;
