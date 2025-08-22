import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import './RestaurantList.css';

const RestaurantList = () => {
  const [location, setLocation] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { search } = useLocation();
  const navigate = useNavigate();
  const { customerId, isLoggedIn } = useAuth();
  const [favourites, setFavourites] = useState({});

  useEffect(() => {
    const queryParams = new URLSearchParams(search);
    const address = queryParams.get('address');
    if (address) {
      setLocation(decodeURIComponent(address));
    }
    fetchRestaurantData();
    fetchFavourites(); // Fetch favorites on mount
  }, [search, isLoggedIn, customerId]); // Re-fetch when login status changes

  const fetchRestaurantData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:5000/api/restaurants/location");
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await response.json();
      setRestaurants(data.restaurants);
      setDishes(data.dishes);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavourites = async () => {
    if (!isLoggedIn) return;

    try {
      const response = await fetch(`http://localhost:5000/api/customer/favorites/${customerId}`);
      if (!response.ok) {
        console.error("Failed to fetch favorites:", response.statusText);
        return;
      }

      const data = await response.json();
      console.log("Fetched favorites from API:", data); // Debugging

      const favouritesMap = data.reduce((acc, restaurant) => {
        acc[restaurant.id] = true; 
        return acc;
      }, {});

      setFavourites(favouritesMap);
      console.log("Updated favourites state:", favouritesMap); // Debugging
    } catch (error) {
      console.error("Error fetching favourites:", error);
    }
  };

  const handleFavouriteToggle = async (restaurantId) => {
    if (!isLoggedIn) {
      alert("Please login to favorite restaurants");
      return;
    }

    try {
      const isFavourited = favourites[restaurantId];
      const endpoint = isFavourited
        ? `http://localhost:5000/api/customer/favorites/${customerId}/${restaurantId}`
        : "http://localhost:5000/api/customer/favorites";
      const method = isFavourited ? "DELETE" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: !isFavourited ? JSON.stringify({ customer_id: customerId, restaurant_id: restaurantId }) : null,
      });

      if (response.ok) {
        setFavourites((prev) => {
          const updatedFavourites = { ...prev, [restaurantId]: !isFavourited };
          console.log("Updated favourites state after toggle:", updatedFavourites);
          return updatedFavourites;
        });
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to update favorites");
      }
    } catch (error) {
      console.error("Error updating favourites:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleAddToCart = async (dishId) => {
    if (!isLoggedIn) {
      alert("Please login to add items to your cart");
      return;
    }
    try {
      const response = await fetch("http://localhost:5000/api/customer/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_id: customerId, dish_id: dishId, quantity: 1 }),
      });
      if (response.ok) {
        alert("Dish added to cart");
      } else {
        alert("Failed to add dish to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  return (
    <div className="restaurant-list-page">
      {error && <p className="error-message">Error: {error}</p>}

      <section className="restaurants-section">
        <h2>Restaurants Near You</h2>
        {loading ? (
          <p>Loading...</p>
        ) : restaurants.length > 0 ? (
          <div className="restaurant-cards-vertical">
            {restaurants.map((restaurant) => (
              <div key={restaurant.id} className="restaurant-card-vertical">
                <div className="restaurant-image-container">
                  <img src={restaurant.images} alt={restaurant.name} className="restaurant-image" />
                  {isLoggedIn && (
                    <button
                    onClick={() => handleFavouriteToggle(restaurant.id)}
                    className="favourite-button"
                    title={favourites[restaurant.id] ? "Remove from Favourites" : "Add to Favourites"}
                  >
                    {favourites[restaurant.id] ? (
                      <FaHeart className="fav-icon active" />
                    ) : (
                      <FaRegHeart className="fav-icon" />
                    )}
                  </button>                  
                  )}
                </div>
                <div className="restaurant-details">
                  <h3>{restaurant.name}</h3>
                  <p>{restaurant.location}</p>
                  <p className="description">{restaurant.description}</p>
                  <div className="rating">★★★★☆</div>
                  <div className="actions">
                    <button
                      onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                      className="view-menu-button"
                    >
                      View Menu
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No restaurants found.</p>
        )}
      </section>

      <section className="food-section">
        <h2>Popular Dishes</h2>
        {loading ? (
          <p>Loading...</p>
        ) : dishes.length > 0 ? (
          <div className="dish-cards-vertical">
            {dishes.map((dish) => (
              <div key={dish.id} className="dish-card-vertical">
                <img src={dish.image} alt={dish.name} className="dish-image" />
                <div className="dish-details">
                  <h3>{dish.name}</h3>
                  <p>{dish.restaurant_name}</p>
                  <p className="description">Delicious cheese pizza with fresh toppings</p>
                  <p className="price">Price: ${dish.price}</p>
                  <div className="actions">
                    <button
                      onClick={() => handleAddToCart(dish.id)}
                      className="add-to-cart-button"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No dishes found.</p>
        )}
      </section>
    </div>
  );
};

export default RestaurantList;
