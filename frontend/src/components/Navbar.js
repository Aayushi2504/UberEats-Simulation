import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaShoppingCart, FaHeart, FaUserCircle, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const { customerId, isLoggedIn, logout, isRestaurant } = useAuth();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHomePage = location.pathname === '/';
  const isRestaurantSpecificPage = location.pathname.startsWith('/restaurant-') || 
    location.pathname.startsWith('/dashboard') || 
    location.pathname.startsWith('/manage-') || 
    location.pathname.startsWith('/add-dish') || 
    location.pathname.startsWith('/edit-dish');

  // Close mobile menu when clicking any link
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setShowDropdown(false);
  };

  // Restaurant Navbar (unchanged)
  if (isRestaurantSpecificPage || isRestaurant) {
    return (
      <nav style={{
        backgroundColor: isHomePage ? 'white' : '#FF6600',
        padding: '10px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        width: '100%',
      }}>
        <Link to="/" style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: isHomePage ? '#FF6600' : 'white',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '8px',
        }}>
          TastyEATS
          <span style={{
            fontSize: '14px',
            color: isHomePage ? '#FF6600' : 'white',
            marginBottom: '4px',
          }}>for restaurants</span>
        </Link>
        <div style={styles.navLinks}>
          {isLoggedIn && (
            <button onClick={logout} style={{
              background: 'none',
              border: 'none',
              color: isHomePage ? '#333' : 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '16px',
            }}>
              <FaSignOutAlt style={styles.icon} /> Logout
            </button>
          )}
        </div>
      </nav>
    );
  }

  // Customer Navbar (only added hamburger menu)
  return (
    <>
      <nav style={{
        backgroundColor: isHomePage ? 'white' : '#FF6600',
        padding: '10px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        width: '100%',
      }}>
        <Link to="/" style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: isHomePage ? '#FF6600' : 'white',
          textDecoration: 'none',
        }}>
          TastyEATS
        </Link>

        {/* Hamburger Button (Mobile Only) */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            color: isHomePage ? '#333' : 'white',
            fontSize: '24px',
            cursor: 'pointer',
          }}
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Original Desktop Nav Links (unchanged) */}
        <div className="desktop-nav" style={styles.navLinks}>
          {isLoggedIn ? (
            <>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  style={{ 
                    ...styles.linkStyles,
                    color: isHomePage ? '#333' : 'white',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <FaUserCircle style={styles.icon} /> Profile <span>▼</span>
                </button>
                {showDropdown && (
                  <div style={styles.dropdown}>
                    <Link 
                      to={`/profile/${customerId}`} 
                      style={styles.dropdownLink}
                      onClick={() => setShowDropdown(false)}
                    >
                      My Profile
                    </Link>
                    <Link 
                      to="/orders" 
                      style={styles.dropdownLink}
                      onClick={() => setShowDropdown(false)}
                    >
                      My Orders
                    </Link>
                  </div>
                )}
              </div>
              <Link to="/cart" style={{
                ...styles.linkStyles,
                color: isHomePage ? '#333' : 'white',
              }}>
                <FaShoppingCart style={styles.icon} /> Cart
              </Link>
              <Link to="/favorites" style={{
                ...styles.linkStyles,
                color: isHomePage ? '#333' : 'white',
              }}>
                <FaHeart style={styles.icon} /> Favorites
              </Link>
              <button onClick={logout} style={{
                ...styles.linkStyles,
                color: isHomePage ? '#333' : 'white',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}>
                <FaSignOutAlt style={styles.icon} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{
                ...styles.linkStyles,
                color: isHomePage ? '#333' : 'white',
              }}>Login</Link>
              <Link to="/signup" style={{
                ...styles.linkStyles,
                color: isHomePage ? '#333' : 'white',
              }}>Signup</Link>
              <Link to="/restaurant-auth" style={{
                ...styles.linkStyles,
                color: isHomePage ? '#333' : 'white',
              }}>For Restaurants</Link>
            </>
          )}
        </div>
      </nav>

      {/* Mobile Menu (New Addition) */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        {isLoggedIn ? (
          <>
            <Link to={`/profile/${customerId}`} onClick={closeMobileMenu}>
              <FaUserCircle /> My Profile
            </Link>
            <Link to="/orders" onClick={closeMobileMenu}>
              <FaHeart /> My Orders
            </Link>
            <Link to="/cart" onClick={closeMobileMenu}>
              <FaShoppingCart /> Cart
            </Link>
            <Link to="/favorites" onClick={closeMobileMenu}>
              <FaHeart /> Favorites
            </Link>
            <button onClick={() => { logout(); closeMobileMenu(); }}>
              <FaSignOutAlt /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" onClick={closeMobileMenu}>Login</Link>
            <Link to="/signup" onClick={closeMobileMenu}>Signup</Link>
            <Link to="/restaurant-auth" onClick={closeMobileMenu}>For Restaurants</Link>
          </>
        )}
      </div>
    </>
  );
};

const styles = {
  navLinks: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  icon: {
    fontSize: '18px',
  },
  linkStyles: {
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '16px',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: 'white',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    borderRadius: '5px',
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  dropdownLink: {
    textDecoration: 'none',
    color: '#333',
    fontSize: '14px',
  },
};

export default Navbar;
