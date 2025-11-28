import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon, StarIcon, PhoneIcon, MapPinIcon, HeartIcon, ShoppingCartIcon } from '@heroicons/react/24/solid';
import { restaurantAPI } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';

const CustomerDashboard = ({ user, onLogout }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  const getErrorMessage = (error) => {
    if (typeof error === 'string') return error;
    if (error?.response?.data?.message) return error.response.data.message;
    if (error?.response?.data?.error) return error.response.data.error;
    if (error?.message) return error.message;
    return 'Something went wrong';
  };

  useEffect(() => {
    loadRestaurants();
    const interval = setInterval(loadRestaurants, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadRestaurants = async () => {
    try {
      const response = await restaurantAPI.getAll();
      setRestaurants(response.data || []);
    } catch (error) {
      console.error('Error loading restaurants:', error);
      toast.error('Error loading restaurants');
    }
  };

  const filteredRestaurants = restaurants.filter(r => {
    const matchesSearch = r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         r.address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'all' || 
                         (activeFilter === 'veg' && r.veg) ||
                         (activeFilter === 'nonveg' && r.nonVeg) ||
                         (activeFilter === 'toprated' && (r.rating || 0) >= 4.0);
    return matchesSearch && matchesFilter;
  });

  const filterOptions = [
    { id: 'all', label: 'All', color: 'hover:bg-blue-100' },
    { id: 'veg', label: '🌿 Veg', color: 'hover:bg-green-100' },
    { id: 'nonveg', label: '🍗 Non-Veg', color: 'hover:bg-red-100' },
    { id: 'toprated', label: '⭐ Top Rated', color: 'hover:bg-yellow-100' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Toaster position="top-right" />
      
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md sticky top-0 z-50">
        <div className="flex justify-between items-center px-8 py-4">
          <h1 className="text-2xl font-bold tracking-wide">🍔 SnackSmart</h1>
          <nav className="hidden md:flex gap-6 text-lg">
            <a href="#home" className="hover:text-yellow-300 transition">Home</a>
            <a href="#restaurants" className="hover:text-yellow-300 transition">Restaurants</a>
            <a href="#about" className="hover:text-yellow-300 transition">About</a>
          </nav>
          <div className="flex items-center gap-4">
            <span className="hidden sm:block">Welcome, {user.username}!</span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={loadRestaurants}
              className="bg-blue-500 hover:bg-blue-600 transition px-4 py-2 rounded-lg flex items-center gap-2"
              title="Refresh restaurants"
            >
              🔄 Refresh
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setShowCart(true)}
              className="relative bg-yellow-500 hover:bg-yellow-600 transition px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <ShoppingCartIcon className="h-5 w-5" />
              Cart ({cart.length})
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={onLogout}
              className="bg-red-500 hover:bg-red-600 transition px-4 py-2 rounded-lg text-sm"
            >
              Logout
            </motion.button>
          </div>
        </div>
      </header>

      <section className="relative text-center py-24 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200')] bg-cover bg-center">
        <div className="bg-black/50 absolute inset-0"></div>
        <div className="relative z-10 text-white max-w-2xl mx-auto px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-4"
          >
            Find the Best Restaurants Near You
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 text-lg"
          >
            Discover dishes, read reviews, and enjoy delicious food from SnackSmart!
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by restaurant or dish..."
              className="w-full rounded-xl px-12 py-3 shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {filterOptions.map((filter) => (
            <motion.button
              key={filter.id}
              whileHover={{ scale: 1.05 }}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-6 py-3 rounded-full shadow transition-all ${
                activeFilter === filter.id 
                  ? 'bg-blue-500 text-white' 
                  : `bg-white ${filter.color}`
              }`}
            >
              {filter.label}
            </motion.button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRestaurants.map((restaurant, index) => (
            <motion.div
              key={restaurant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden transition cursor-pointer"
              onClick={async () => {
              try {
                     const dishesRes = await axios.get(`http://localhost:9090/api/dishes/restaurant/${restaurant.id}`);
                        const availableDishes = dishesRes.data.filter(d => d.isAvailable); // ✅ Only available dishes
                       setSelectedRestaurant({ ...restaurant, menu: availableDishes });
                       } catch (err) {
                         console.error("Error loading dishes:", err);
                        toast.error("Failed to load menu for this restaurant");
                    }
                  }}
            >
              <div className="relative">
                <img 
                  src={restaurant.imageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'} 
                  alt={restaurant.name} 
                  className="h-48 w-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400';
                  }}
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  {(restaurant.rating || 4.0) >= 4.0 && (
                    <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                      Top Rated
                    </span>
                  )}
                  <span className="bg-white/90 px-2 py-1 rounded-full text-xs font-medium">
                    {restaurant.veg && restaurant.nonVeg ? "🌿🍗" : restaurant.veg ? "🌿 Veg" : "🍗 Non-Veg"}
                  </span>
                </div>
                <button className="absolute top-4 left-4 p-2 bg-white/90 rounded-full hover:bg-white transition">
                  <HeartIcon className="h-5 w-5 text-gray-400 hover:text-red-500" />
                </button>
              </div>
              
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-2">{restaurant.name}</h2>
                
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  <span className="text-sm">{restaurant.address}</span>
                </div>
                
                <div className="flex items-center text-gray-600 mb-3">
                  <PhoneIcon className="h-4 w-4 mr-1" />
                  <span className="text-sm">{restaurant.phone}</span>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-yellow-500 font-semibold mr-1">⭐</span>
                    <span className="font-bold">{restaurant.rating || '4.0'}</span>
                    <span className="text-gray-500 ml-1">({Math.floor(Math.random() * 100) + 50})</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    🍽️ {restaurant.menu?.length || Math.floor(Math.random() * 20) + 5} dishes
                  </span>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition font-medium"
                >
                  View Restaurant →
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredRestaurants.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No restaurants found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </motion.div>
        )}

        {selectedRestaurant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedRestaurant(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <img 
                  src={selectedRestaurant.imageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=300&fit=crop'} 
                  alt={selectedRestaurant.name}
                  className="w-full h-48 object-cover rounded-t-2xl"
                />
                <button
                  onClick={() => setSelectedRestaurant(null)}
                  className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-600 hover:text-gray-800 w-10 h-10 rounded-full flex items-center justify-center text-xl transition"
                >
                  ×
                </button>
                <div className="absolute bottom-4 left-6 text-white">
                  <h1 className="text-3xl font-bold mb-2">{selectedRestaurant.name}</h1>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <StarIcon className="h-5 w-5 text-yellow-400 mr-1" />
                      <span className="font-semibold">{selectedRestaurant.rating || '4.0'}</span>
                      <span className="text-white/80 ml-1">({Math.floor(Math.random() * 100) + 50} reviews)</span>
                    </div>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                      {selectedRestaurant.veg && selectedRestaurant.nonVeg ? "🌿🍗 Veg & Non-Veg" : 
                       selectedRestaurant.veg ? "🌿 Pure Veg" : "🍗 Non-Veg"}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="md:col-span-2">
                    <h2 className="text-xl font-semibold mb-3">About {selectedRestaurant.name}</h2>
                    <p className="text-gray-600 mb-4">
                      {selectedRestaurant.description || "Welcome to our restaurant! We serve delicious food with fresh ingredients and authentic flavors."}
                    </p>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPinIcon className="h-5 w-5 mr-2" />
                      <span>{selectedRestaurant.address}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <PhoneIcon className="h-5 w-5 mr-2" />
                      <span>{selectedRestaurant.phone || "Contact for phone number"}</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold mb-3">Quick Info</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cuisine Type:</span>
                        <span className="font-medium">Multi-Cuisine</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg. Cost:</span>
                        <span className="font-medium">₹300 for two</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivery Time:</span>
                        <span className="font-medium">30-45 mins</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Open Hours:</span>
                        <span className="font-medium">9 AM - 11 PM</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Our Menu</h2>
                    <span className="text-gray-500">{selectedRestaurant.menu?.length || 0} dishes available</span>
                  </div>
                  
                  {selectedRestaurant.menu && selectedRestaurant.menu.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedRestaurant.menu.map((dish, index) => (
                        <motion.div 
                          key={index}
                          whileHover={{ scale: 1.02 }}
                          className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center flex-1">
                              <img 
                                src={dish.imageUrl || `https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=80&h=80&fit=crop&sig=${index}`}
                                alt={dish.dishName}
                                className="w-16 h-16 object-cover rounded-lg mr-4"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-gray-900">{dish.dishName}</h4>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    dish.veg ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {dish.veg ? '🌿' : '🍗'}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">Delicious and freshly prepared</p>
                                <div className="flex items-center justify-between">
                                  <span className="text-lg font-bold text-blue-600">₹{dish.price}</span>
                                  <motion.button
                                  whileHover={{ scale: dish.isAvailable ? 1.05 : 1 }}
                                  whileTap={{ scale: dish.isAvailable ? 0.95 : 1 }}
                                  disabled={!dish.isAvailable}
                                  onClick={() => {
                                  if (!dish.isAvailable) return;
                                  const cartItem = {
                                   id: Date.now(),
                                    dishId: dish.id,
                                  dishName: dish.dishName,
                                    price: dish.price,
                                    restaurantId: selectedRestaurant.id,
                                    restaurantName: selectedRestaurant.name,
                                    quantity: 1
                                          };
                                    setCart([...cart, cartItem]);
                                        toast.success(`Added ${dish.dishName} to cart!`);
                                      }}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm ${
                                        dish.isAvailable
                                         ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-yellow-900'
                                   : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                     }`}
                                  >
                               {dish.isAvailable ? 'Add to Cart' : 'Unavailable'}
                              </motion.button>

                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">🍽️</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Menu Coming Soon</h3>
                      <p className="text-gray-600">This restaurant is still setting up their menu. Check back later!</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>

      {showCart && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowCart(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Your Cart</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCartIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium">{item.dishName}</h4>
                          <p className="text-sm text-gray-600">{item.restaurantName}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">₹{item.price}</div>
                          <button
                            onClick={() => setCart(cart.filter(c => c.id !== item.id))}
                            className="text-red-500 text-sm hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-bold">Total: ₹{cart.reduce((sum, item) => sum + item.price, 0)}</span>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      onClick={async () => {
                        try {
                          const orderData = {
                            customerId: user.id,
                            restaurantId: cart[0]?.restaurantId,
                            totalAmount: cart.reduce((sum, item) => sum + item.price, 0)
                          };
                          
                          await axios.post('http://localhost:9090/api/orders/place', orderData);
                          toast.success('Order placed! Ready for pickup in 30 minutes');
                          setCart([]);
                          setShowCart(false);
                        } catch (err) {
                          console.log('Order Error:', JSON.stringify(err.response?.data, null, 2));
                          const errorMsg = getErrorMessage(err);
                          toast.error(`Failed to place order: ${errorMsg}`);
                        }
                      }}
                      className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition font-medium"
                    >
                      Place Order for Pickup
                    </motion.button>
                    
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Order will be ready for pickup in 30 minutes
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400">© 2025 SnackSmart – Order Online, Pickup Fast!</p>
        </div>
      </footer>
    </div>
  );
};

export default CustomerDashboard;