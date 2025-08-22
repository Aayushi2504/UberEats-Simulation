import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import './RestaurantDashboard.css';

const RestaurantDashboard = () => {
  const { restaurantId } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All'); // State for status filter
  const [selectedCustomer, setSelectedCustomer] = useState(null); // State for selected customer
  const navigate = useNavigate();

  // Fetch restaurant data, dishes, and orders
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [restaurantResponse, dishesResponse, ordersResponse] = await Promise.all([
          fetch(`http://localhost:5000/api/restaurant/profile/${restaurantId}`),
          fetch(`http://localhost:5000/api/restaurant/dishes/${restaurantId}`),
          fetch(`http://localhost:5000/api/restaurant/orders/${restaurantId}?status=${statusFilter}`), // Include status filter
        ]);

        if (!restaurantResponse.ok || !dishesResponse.ok || !ordersResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const [restaurantData, dishesData, ordersData] = await Promise.all([
          restaurantResponse.json(),
          dishesResponse.json(),
          ordersResponse.json(),
        ]);

        setRestaurant(restaurantData);
        setDishes(dishesData);
        setOrders(ordersData);
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to fetch data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (restaurantId) {
      fetchData();
    }
  }, [restaurantId, statusFilter]); // Add statusFilter to dependencies

  // Update order status
  const handleUpdateStatus = async (orderId, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      // Update the orders state with the new status
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.order_id === orderId ? { ...order, status } : order
        )
      );
      alert('Order status updated successfully!');
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  // Delete a dish
  const handleDeleteDish = async (dishId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/restaurant/dishes/${dishId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete dish');
      }

      // Remove the deleted dish from the dishes state
      setDishes((prevDishes) => prevDishes.filter((dish) => dish.id !== dishId));
      alert('Dish deleted successfully!');
    } catch (error) {
      console.error('Error deleting dish:', error);
    }
  };

  // Handle viewing customer profile
  const handleViewCustomer = async (orderId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/customer`);
      if (!response.ok) {
        throw new Error('Failed to fetch customer details');
      }
      const customerData = await response.json();
      setSelectedCustomer(customerData); // Set the selected customer
    } catch (error) {
      console.error('Error fetching customer:', error);
      alert('Failed to fetch customer details. Please try again.');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="restaurant-dashboard-container">
      <h1>Welcome, {restaurant.name}</h1>

      {/* Orders Section */}
      <section className="orders-section">
        <div className="orders-header">
          <h2>Orders</h2>
          <select
            className="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Orders</option>
            <option value="New">New</option>
            <option value="Order Received">Order Received</option>
            <option value="Preparing">Preparing</option>
            <option value="On the Way">On the Way</option>
            <option value="Pick-up Ready">Pick-up Ready</option>
            <option value="Delivered">Delivered</option>
            <option value="Picked Up">Picked Up</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <div className="orders-grid">
            {orders.map((order) => (
              <div key={order.order_id} className="order-card">
                <h3>Order #{order.order_id}</h3>
                <p>Customer: {order.customer_name}</p>
                <p>Dishes: {order.dish_names}</p>
                <p>Total: ${Number(order.total).toFixed(2)}</p>
                <p>Status: {order.status}</p>
                <select
                  value={order.status}
                  onChange={(e) => handleUpdateStatus(order.order_id, e.target.value)}
                >
                  <option value="New">New</option>
                  <option value="Order Received">Order Received</option>
                  <option value="Preparing">Preparing</option>
                  <option value="On the Way">On the Way</option>
                  <option value="Pick-up Ready">Pick-up Ready</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Picked Up">Picked Up</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <button
                  className="view-customer-btn"
                  onClick={() => handleViewCustomer(order.order_id)}
                >
                  View Customer
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Customer Modal */}
      {selectedCustomer && (
        <div className="customer-modal">
          <div className="modal-content">
            <h3>Customer Details</h3>
            <p>Name: {selectedCustomer.name}</p>
            <p>Email: {selectedCustomer.email}</p>
            <button onClick={() => setSelectedCustomer(null)}>Close</button>
          </div>
        </div>
      )}

      {/* Dishes Section */}
      <section className="dishes-section">
        <div className="dishes-header">
          <h2>Dishes</h2>
          <button className="add-dish-button" onClick={() => navigate('/add-dish')}>
            Add New Dish
          </button>
        </div>
        <div className="dishes-grid">
          {dishes.map((dish) => (
            <div key={dish.id} className="dish-card">
              <img src={dish.image} alt={dish.name} />
              <h3>{dish.name}</h3>
              <p>{dish.description}</p>
              <p>${Number(dish.price).toFixed(2)}</p>
              <div className="dish-buttons">
                <button onClick={() => navigate(`/edit-dish/${dish.id}`)}>Edit</button>
                <button onClick={() => handleDeleteDish(dish.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Restaurant Info Section */}
      <section className="restaurant-info-section">
        <h2>Restaurant Info</h2>
        <p>{restaurant.description}</p>
        <p><strong>Location:</strong> {restaurant.location}</p>
        <p><strong>Contact Info:</strong> {restaurant.contact_info}</p>
        <p><strong>Timings:</strong> {restaurant.timings}</p>
        <button onClick={() => navigate('/restaurant-profile')}>Edit Profile</button>
      </section>
    </div>
  );
};

export default RestaurantDashboard;
