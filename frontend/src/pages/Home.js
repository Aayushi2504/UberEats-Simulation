import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [address, setAddress] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    if (address.trim()) {
      // Redirect to the RestaurantList page with the address as a query parameter
      navigate(`/restaurants?address=${encodeURIComponent(address)}`);
    } else {
      alert('Please enter a valid address or zip code.');
    }
  };

  return (
    <div className="home-page">
      <div className="hero">
        <h1>Food at your fingertips!</h1>
        <div className="search-bar">
          <input
            type="text"
            id="delivery-address"
            name="delivery-address"
            placeholder="Enter your delivery address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
      </div>
    </div>
  );
};

export default Home;
