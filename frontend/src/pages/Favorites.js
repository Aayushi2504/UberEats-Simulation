import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFavorites, removeFromFavorites } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import './Favorites.css';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { customerId } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await getFavorites(customerId);
        setFavorites(response.data);
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, [customerId]);

  const handleRemoveFavorite = async (restaurantId) => {
    try {
      await removeFromFavorites(customerId, restaurantId);
      setFavorites(favorites.filter((fav) => fav.id !== restaurantId));
      alert('Restaurant removed from favorites!');
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const handleViewMenu = (restaurantId) => {
    navigate(`/restaurant/${restaurantId}`);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="main-content"> {/* Wrap content in main-content */}
      <div className="favorites-page">
        <h1>Your Favorites</h1>
        {favorites.length > 0 ? (
          <div className="favorites-grid">
            {favorites.map((restaurant) => (
              <div key={restaurant.id} className="favorite-card">
                <img src={restaurant.images} alt={restaurant.name} className="favorite-image" />
                <div className="favorite-details">
                  <h3>{restaurant.name}</h3>
                  <p>{restaurant.description}</p>
                  <div className="actions">
                    <button
                      className="view-menu-button"
                      onClick={() => handleViewMenu(restaurant.id)}
                    >
                      View Menu
                    </button>
                    <button
                      className="remove-button"
                      onClick={() => handleRemoveFavorite(restaurant.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-favorites">You have no favorite restaurants yet.</p>
        )}
      </div>
    </div>
  );
};

export default Favorites;