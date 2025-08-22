import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // AuthProvider that uses useNavigate
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Restaurant from './pages/Restaurant';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Signup from './pages/Signup';
import RestaurantAuth from './pages/RestaurantAuth';
import Profile from './pages/Profile';
import OrderHistory from './pages/OrderHistory';
import RestaurantDashboard from './pages/RestaurantDashboard';
import UpdateProfile from './pages/UpdateProfile';
import ManageDishes from './pages/ManageDishes';
import ManageOrders from './pages/ManageOrders';
import Favorites from './pages/Favorites';
import RestaurantList from './pages/RestaurantList';
import AddDish from './pages/AddDish'; 
import EditDish from './pages/EditDish'; 
import RestaurantProfile from './pages/RestaurantProfile'; // Import RestaurantProfile



// App content which includes routes and navbar
const AppContent = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/restaurant/:id" element={<Restaurant />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/restaurant-auth" element={<RestaurantAuth />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/orders" element={<OrderHistory />} />
        <Route path="/restaurant-dashboard" element={<RestaurantDashboard />} />
        <Route path="/dashboard" element={<RestaurantDashboard />} />
        <Route path="/update-profile" element={<UpdateProfile />} />
        <Route path="/manage-dishes" element={<ManageDishes />} />
        <Route path="/manage-orders" element={<ManageOrders />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/restaurants" element={<RestaurantList />} />
        <Route path="/add-dish" element={<AddDish />} />
        <Route path="/edit-dish/:dishId" element={<EditDish />} />
        <Route path="/restaurant-profile" element={<RestaurantProfile />} /> 
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <Router> {/* The Router should wrap everything, including AuthProvider */}
      <AuthProvider> {/* AuthProvider should be wrapped inside the Router */}
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
