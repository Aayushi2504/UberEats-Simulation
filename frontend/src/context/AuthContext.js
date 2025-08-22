import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [customerId, setCustomerId] = useState(null);
  const [restaurantId, setRestaurantId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedCustomerId = localStorage.getItem('customerId');
    const storedRestaurantId = localStorage.getItem('restaurantId');
    if (storedCustomerId) {
      setCustomerId(storedCustomerId);
      setIsLoggedIn(true);
    } else if (storedRestaurantId) {
      setRestaurantId(storedRestaurantId);
      setIsLoggedIn(true);
    }
  }, []);

  const loginCustomer = (id) => {
    setCustomerId(id);
    setIsLoggedIn(true);
    localStorage.setItem('customerId', id);
  };

  const loginRestaurant = (id) => {
    setRestaurantId(id);
    setIsLoggedIn(true);
    localStorage.setItem('restaurantId', id);
  };

  const logout = () => {
    setCustomerId(null);
    setRestaurantId(null);
    setIsLoggedIn(false);
    localStorage.removeItem('customerId');
    localStorage.removeItem('restaurantId');
    navigate('/');
  };

  return (
    <AuthContext.Provider
      value={{
        customerId,
        restaurantId,
        isLoggedIn,
        loginCustomer,
        loginRestaurant,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
