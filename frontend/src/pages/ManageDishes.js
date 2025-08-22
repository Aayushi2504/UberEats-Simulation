import React, { useState, useEffect } from 'react';
import { getRestaurantDishes, addDish, updateDish, deleteDish } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const ManageDishes = () => {
  const { restaurantId } = useAuth();
  const [dishes, setDishes] = useState([]);
  const [name, setName] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [image, setImage] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [editDishId, setEditDishId] = useState(null);

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const response = await getRestaurantDishes(restaurantId);
        setDishes(response.data);
      } catch (error) {
        console.error('Error fetching dishes:', error);
      }
    };
    fetchDishes();
  }, [restaurantId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dishData = { name, ingredients, image, price, description, category };
      if (editDishId) {
        await updateDish(editDishId, dishData);
        setDishes(dishes.map((dish) => (dish.id === editDishId ? { ...dish, ...dishData } : dish)));
        setEditDishId(null);
      } else {
        const response = await addDish(restaurantId, dishData);
        setDishes([...dishes, response.data]);
      }
      alert('Dish saved successfully!');
      setName('');
      setIngredients('');
      setImage('');
      setPrice('');
      setDescription('');
      setCategory('');
    } catch (error) {
      console.error('Error saving dish:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (dish) => {
    setName(dish.name);
    setIngredients(dish.ingredients);
    setImage(dish.image);
    setPrice(dish.price);
    setDescription(dish.description);
    setCategory(dish.category);
    setEditDishId(dish.id);
  };

  const handleDelete = async (dishId) => {
    try {
      await deleteDish(dishId);
      setDishes(dishes.filter((dish) => dish.id !== dishId));
      alert('Dish deleted successfully!');
    } catch (error) {
      console.error('Error deleting dish:', error);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mt-4">
      <h1>Manage Dishes</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Name</label>
          <input
            type="text"
            className="form-control"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="ingredients" className="form-label">Ingredients</label>
          <input
            type="text"
            className="form-control"
            id="ingredients"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="image" className="form-label">Image URL</label>
          <input
            type="text"
            className="form-control"
            id="image"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="price" className="form-label">Price</label>
          <input
            type="number"
            className="form-control"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea
            className="form-control"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="category" className="form-label">Category</label>
          <input
            type="text"
            className="form-control"
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          {editDishId ? 'Update Dish' : 'Add Dish'}
        </button>
      </form>
      <div className="row mt-4">
        {dishes.map((dish) => (
          <div key={dish.id} className="col-md-4 mb-4">
            <div className="card">
              <img src={dish.image} className="card-img-top" alt={dish.name} />
              <div className="card-body">
                <h5 className="card-title">{dish.name}</h5>
                <p className="card-text">{dish.description}</p>
                <p className="card-text">${dish.price}</p>
                <button
                  className="btn btn-warning me-2"
                  onClick={() => handleEdit(dish)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(dish.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageDishes;