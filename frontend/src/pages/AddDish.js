import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AddDish.css';

const AddDish = () => {
  const { restaurantId } = useAuth();
  const navigate = useNavigate();

  // State for the new dish form
  const [newDish, setNewDish] = useState({
    name: '',
    ingredients: '',
    image: '', // Store the image URL
    price: '',
    description: '',
    category: '', // Default to empty
  });

  // Predefined categories from the ENUM in the database
  const categories = ['Appetizer', 'Salad', 'Main Course', 'Dessert', 'Beverage'];

  // Handle input change for the new dish form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDish({ ...newDish, [name]: value });
  };

  // Handle adding a new dish
  const handleAddDish = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/restaurant/dishes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurant_id: restaurantId,
          ...newDish,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add dish');
      }

      alert('Dish added successfully!');
      navigate('/restaurant-dashboard'); // Redirect back to the dashboard
    } catch (error) {
      console.error('Error adding dish:', error);
      alert('Failed to add dish. Please try again.');
    }
  };

  return (
    <div className="add-dish-container">
      <h1>Add New Dish</h1>
      <form onSubmit={handleAddDish} className="add-dish-form">
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={newDish.name}
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
            value={newDish.ingredients}
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
            value={newDish.image}
            onChange={handleInputChange}
            placeholder="Paste the URL of your dish image"
            required
          />
          {/* Image Preview */}
          {newDish.image && (
            <div className="image-preview">
              <img src={newDish.image} alt="Dish Preview" />
              <p>Image Preview</p>
            </div>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="price">Price</label>
          <input
            type="number"
            id="price"
            name="price"
            value={newDish.price}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={newDish.description}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={newDish.category}
            onChange={handleInputChange}
            required
          >
            <option value="">Select a category</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="add-dish-button">
          Add Dish
        </button>
      </form>
    </div>
  );
};

export default AddDish;