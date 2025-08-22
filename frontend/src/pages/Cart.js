import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { viewCart, placeOrder } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { FiTrash2 } from 'react-icons/fi'; // Import trash icon
import './Cart.css';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { customerId } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await viewCart(customerId);
        setCartItems(response.data);
      } catch (error) {
        console.error('Error fetching cart:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [customerId]);

  const handlePlaceOrder = async () => {
    try {
      // Place the order
      await placeOrder({
        customer_id: customerId,
        restaurant_id: 1, // Replace with actual restaurant ID
        status: 'New',
        items: cartItems,
      });

      // Clear the cart on the backend
      const clearCartResponse = await fetch(`http://localhost:5000/api/customer/cart/clear/${customerId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!clearCartResponse.ok) {
        throw new Error('Failed to clear cart');
      }

      // Clear the cart on the frontend
      setCartItems([]);

      alert('Order placed successfully!');
      navigate('/restaurants'); // Redirect to restaurant list
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveItem = async (cartId) => {
    try {
      console.log(`Deleting cart item with ID: ${cartId}`); // Debugging

      const response = await fetch(`http://localhost:5000/api/customer/cart/${cartId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove item from cart');
      }

      setCartItems((prevItems) => prevItems.filter((item) => item.id !== cartId));
      console.log('Item successfully removed from UI');
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const calculateTotalPrice = () => {
    return cartItems.reduce((total, item) => total + Number(item.price) * item.quantity, 0);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="cart-container">
      <h1 className="cart-title">Your Cart</h1>

      {cartItems.length === 0 ? (
        <p className="empty-cart-message">Your cart is empty 🛒</p>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} className="cart-item-image" />
                <div className="cart-item-details">
                  <h3 className="cart-item-title">{item.name}</h3>
                  <p className="cart-item-price">${Number(item.price).toFixed(2)}</p>
                  <div className="cart-item-quantity">
                    <button onClick={() => handleQuantityChange(item.id, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => handleQuantityChange(item.id, item.quantity + 1)}>+</button>
                  </div>
                </div>
                <button className="remove-item-button" onClick={() => handleRemoveItem(item.id)}>
                  <FiTrash2 className="remove-icon" />
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Total: ${calculateTotalPrice().toFixed(2)}</h2>
            <button className="place-order-button" onClick={handlePlaceOrder}>
              Place Order
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
