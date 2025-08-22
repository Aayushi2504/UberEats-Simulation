import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCustomerOrders } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './OrderHistory.css';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { customerId } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await getCustomerOrders(customerId);
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [customerId]);

  if (loading) return <LoadingSpinner />;

  // Function to get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Delivered': return 'badge-success';
      case 'Cancelled': return 'badge-danger';
      default: return 'badge-warning';
    }
  };

  return (
    <div className="order-history-container">
      <h1 className="order-history-title">My Orders</h1>

      {orders.length > 0 ? (
        <div className="order-grid">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <h3 className="order-id">Order #{order.order_id}</h3>
                <span className={`status-badge ${getStatusBadgeColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <div className="order-card-body">
                <p className="order-detail">
                  <span className="detail-label">Restaurant:</span>
                  <span className="detail-value">{order.restaurant_name}</span>
                </p>
                <p className="order-detail">
                  <span className="detail-label">Items:</span>
                  <span className="detail-value">{order.items}</span>
                </p>
                <p className="order-detail">
                   <span className="detail-label">Total:</span>
                   <span className="detail-value">${Number(order.total).toFixed(2)}</span>
                </p>
                <p className="order-detail">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">{new Date(order.created_at).toLocaleDateString()}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-orders-message">No orders found.</p>
      )}
    </div>
  );
};

export default OrderHistory;
