import React, { useState, useEffect } from 'react';
import { dishAPI, reviewAPI } from '../services/api';

const RestaurantDetail = ({ restaurant, user, onBack }) => {
  const [dishes, setDishes] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [filteredDishes, setFilteredDishes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: '',
    restaurantId: restaurant.restaurantId,
    userId: user?.id
  });

  useEffect(() => {
    loadDishes();
    loadReviews();
  }, [restaurant]);

  useEffect(() => {
    filterDishes();
  }, [dishes, searchTerm, categoryFilter]);

  const loadDishes = async () => {
    try {
      const response = await dishAPI.getByRestaurant(restaurant.restaurantId);
      setDishes(response.data);
    } catch (error) {
      console.error('Error loading dishes:', error);
    }
  };

  const loadReviews = async () => {
    try {
      const response = await reviewAPI.getByRestaurant(restaurant.restaurantId);
      setReviews(response.data);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const filterDishes = () => {
    let filtered = dishes;
    
    if (searchTerm) {
      filtered = filtered.filter(dish => 
        dish.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (categoryFilter) {
      filtered = filtered.filter(dish => dish.category === categoryFilter);
    }
    
    setFilteredDishes(filtered);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await reviewAPI.add(reviewData);
      setShowReviewForm(false);
      setReviewData({
        rating: 5,
        comment: '',
        restaurantId: restaurant.restaurantId,
        userId: user?.id
      });
      loadReviews();
    } catch (error) {
      alert('Error adding review: ' + (error.response?.data || 'Unknown error'));
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? 'text-yellow-400' : 'text-gray-300'}>
          ★
        </span>
      );
    }
    return stars;
  };

  const getCategoryIcon = (category) => {
    return category === 'VEG' ? 
      <span className="inline-block w-4 h-4 bg-green-500 rounded-full mr-2"></span> :
      <span className="inline-block w-4 h-4 bg-red-500 rounded-full mr-2"></span>;
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Back to Restaurants
        </button>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {restaurant.imageUrl && (
              <img
                src={restaurant.imageUrl}
                alt={restaurant.name}
                className="w-full md:w-64 h-48 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{restaurant.name}</h1>
              <p className="text-gray-600 mb-2">{restaurant.location}</p>
              <p className="text-gray-600 mb-2">{restaurant.phone}</p>
              <div className="flex items-center mb-3">
                <div className="flex mr-2">
                  {renderStars(Math.round(restaurant.averageRating || 0))}
                </div>
                <span className="text-gray-600">({restaurant.averageRating?.toFixed(1) || '0.0'})</span>
              </div>
              <p className="text-gray-700">{restaurant.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-2xl font-bold mb-4 md:mb-0">Menu</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search dishes..."
              className="px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="VEG">Vegetarian</option>
              <option value="NON_VEG">Non-Vegetarian</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDishes.map((dish) => (
            <div key={dish.dishId} className="bg-white rounded-lg shadow-md p-6">
              {dish.imageUrl && (
                <img
                  src={dish.imageUrl}
                  alt={dish.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <div className="flex items-center mb-2">
                {getCategoryIcon(dish.category)}
                <h3 className="text-xl font-semibold">{dish.name}</h3>
              </div>
              <p className="text-gray-600 mb-3">{dish.description}</p>
              <p className="text-2xl font-bold text-green-600">${dish.price}</p>
            </div>
          ))}
        </div>

        {filteredDishes.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No dishes found.</p>
          </div>
        )}
      </div>

      {/* Reviews Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Reviews</h2>
          {user && (
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              {showReviewForm ? 'Cancel' : 'Write Review'}
            </button>
          )}
        </div>

        {showReviewForm && (
          <form onSubmit={handleReviewSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Rating</label>
              <select
                className="px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                value={reviewData.rating}
                onChange={(e) => setReviewData({...reviewData, rating: parseInt(e.target.value)})}
              >
                <option value={5}>5 Stars</option>
                <option value={4}>4 Stars</option>
                <option value={3}>3 Stars</option>
                <option value={2}>2 Stars</option>
                <option value={1}>1 Star</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Comment</label>
              <textarea
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                rows="3"
                value={reviewData.comment}
                onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
                placeholder="Share your experience..."
              />
            </div>
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Submit Review
            </button>
          </form>
        )}

        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.reviewId} className="border-b pb-4">
              <div className="flex items-center mb-2">
                <div className="flex mr-2">
                  {renderStars(review.rating)}
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700">{review.comment}</p>
            </div>
          ))}
        </div>

        {reviews.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No reviews yet. Be the first to review!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantDetail;