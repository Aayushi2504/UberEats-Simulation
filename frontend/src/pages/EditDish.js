import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AddDish.css'; // Reuse the same CSS as AddDish

const EditDish = () => {
  const { dishId } = useParams(); // Get dishId from the URL
  const { restaurantId } = useAuth();
  const navigate = useNavigate();

  // State for the dish form
  const [dish, setDish] = useState({
    name: '',
    ingredients: '',
    image: '',
    price: '',
    description: '',
    category: '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Predefined categories from the ENUM in the database
  const categories = ['Appetizer', 'Salad', 'Main Course', 'Dessert', 'Beverage'];

  // Fetch dish details on component mount
  useEffect(() => {
    console.log("Dish ID received:", dishId); // Debugging

    if (!dishId) {
      setError("Invalid dish ID.");
      setLoading(false);
      return;
    }

    const fetchDishDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/dish/${dishId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch dish details');
        }
        
        const data = await response.json();
        console.log("Fetched dish details:", data); // Debugging

        // Ensure all fields are populated
        setDish({
          name: data.name || '',
          ingredients: data.ingredients || '',
          image: data.image || '',
          price: data.price || '',
          description: data.description || '',
          category: data.category || '',
        });
      } catch (err) {
        console.error('Error fetching dish details:', err);
        setError('Failed to fetch dish details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDishDetails();
  }, [dishId]);

  // Handle input change for the dish form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDish({ ...dish, [name]: value });
  };

  // Handle updating the dish
  const handleUpdateDish = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/restaurant/dishes/${dishId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dish),
      });

      if (!response.ok) {
        throw new Error('Failed to update dish');
      }

      const data = await response.json();
      alert(data.message || 'Dish updated successfully!');
      navigate('/restaurant-dashboard'); // Redirect back to the dashboard
    } catch (err) {
      console.error('Error updating dish:', err);
      alert('Failed to update dish. Please try again.');
    }
  };

  if (loading) return <h2>Loading...</h2>;
  if (error) return <h2>{error}</h2>;

  return (
    <div className="add-dish-container">
      <h1>Edit Dish</h1>
      <form onSubmit={handleUpdateDish} className="add-dish-form">
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={dish.name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="ingredients">Ingredients</label>
          <input
            type="text"
            id="ingredients"
            name="ingredients"
            value={dish.ingredients}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="image">Image URL</label>
          <input
            type="text"
            id="image"
            name="image"
            value={dish.image}
            onChange={handleInputChange}
            placeholder="Paste the URL of your dish image"
            required
          />
          {dish.image && <img src={dish.image} alt="Dish Preview" className="image-preview" />}
        </div>
        <div className="form-group">
          <label htmlFor="price">Price</label>
          <input
            type="number"
            id="price"
            name="price"
            value={dish.price}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={dish.description}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select id="category" name="category" value={dish.category} onChange={handleInputChange} required>
            <option value="">Select a category</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="add-dish-button">
          Update Dish
        </button>
      </form>
    </div>
  );
};

export default EditDish;
