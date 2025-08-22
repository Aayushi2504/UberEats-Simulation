import React from 'react';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <header>
        <nav>
          <a href="#" className="logo">UserEATS</a>
          <div className="nav-links">
            <a href="#">Login</a>
            <a href="#">Signup</a>
            <a href="#">For Restaurants</a>
          </div>
        </nav>
      </header>
      <main>{children}</main>
      <footer>
        <p>© 2025 UserEATS. All rights reserved.</p>
        <div className="footer-links">
          <a href="#">About</a>
          <a href="#">Help</a>
          <a href="#">Terms</a>
        </div>
      </footer>
    </div>
  );
};

export default Layout;