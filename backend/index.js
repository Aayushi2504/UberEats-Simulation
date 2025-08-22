const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Session setup
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1102',
  database: 'uber_eats'
});

db.connect((err) => {
  if (err) throw err;
  console.log('MySQL connected');
});

//Customer

// Customer Signup
app.post('/api/customer/signup', async (req, res) => {
  const { name, email, password } = req.body;

  // Validate input
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert the customer into the database
  const sql = 'INSERT INTO customers (name, email, password) VALUES (?, ?, ?)';
  db.query(sql, [name, email, hashedPassword], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Email already exists' });
      }
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(201).json({ 
      message: 'Customer registered successfully', 
      customer: { id: result.insertId, name, email }
    });
  });
});

//Customer Login
app.post('/api/customer/login', (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Check if the customer exists
  const sql = 'SELECT * FROM customers WHERE email = ?';
  db.query(sql, [email], async (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (result.length === 0) return res.status(404).json({ error: 'Customer not found' });

    const customer = result[0];

    // Compare the password with the hashed password
    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    // Create a session for the customer
    req.session.customerId = customer.id;
    res.json({ message: 'Login successful', customer });
  });
});

//Customer Logout
app.post('/api/customer/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.json({ message: 'Logout successful' });
  });
});

// View customer profile
app.get('/api/customer/profile/:customer_id', (req, res) => {
  const { customer_id } = req.params;
  console.log("Fetching profile for customer ID:", customer_id); // Debugging

  const sql = 'SELECT * FROM customers WHERE id = ?';
  db.query(sql, [customer_id], (err, result) => {
    if (err) {
      console.error("Database error:", err); // Debugging
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.length === 0) {
      console.log("Customer not found for ID:", customer_id); // Debugging
      return res.status(404).json({ error: 'Customer not found' });
    }
    console.log("Profile data:", result[0]); // Debugging
    res.json(result[0]);
  });
});

//Customer Profile Update
app.put('/api/customer/profile/:customer_id', (req, res) => {
  const { customer_id } = req.params;
  const { name, profile_picture, country, state } = req.body;

  // Validate input
  if (!name && !profile_picture && !country && !state) {
    return res.status(400).json({ error: 'At least one field is required' });
  }

  // Update the customer profile
  const sql = 'UPDATE customers SET name = ?, profile_picture = ?, country = ?, state = ? WHERE id = ?';
  db.query(sql, [name, profile_picture, country, state, customer_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ message: 'Profile updated successfully' });
  });
});

// View order history
app.get('/api/customer/orders/:customer_id', (req, res) => {
  const { customer_id } = req.params;

  const sql = `
    SELECT 
      o.id AS order_id,
      o.created_at,
      o.status,
      o.total,
      r.name AS restaurant_name,
      GROUP_CONCAT(d.name SEPARATOR ', ') AS items  
    FROM orders o
    JOIN restaurants r ON o.restaurant_id = r.id
    JOIN order_items oi ON o.id = oi.order_id
    JOIN dishes d ON oi.dish_id = d.id
    WHERE o.customer_id = ?
    GROUP BY o.id
    ORDER BY o.created_at DESC; 
  `;

  db.query(sql, [customer_id], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    res.json(result);
  });
});

//View Restaurant Detail
app.get('/api/restaurant/:restaurant_id', (req, res) => {
  const { restaurant_id } = req.params;

  // Fetch restaurant details
  const sql = 'SELECT * FROM restaurants WHERE id = ?';
  db.query(sql, [restaurant_id], (err, restaurantResult) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (restaurantResult.length === 0) return res.status(404).json({ error: 'Restaurant not found' });

    // Fetch dishes for the restaurant
    const dishesSql = 'SELECT * FROM dishes WHERE restaurant_id = ?';
    db.query(dishesSql, [restaurant_id], (err, dishesResult) => {
      if (err) return res.status(500).json({ error: 'Database error' });

      // Combine restaurant details and dishes
      const response = {
        ...restaurantResult[0],
        dishes: dishesResult
      };
      res.json(response);
    });
  });
});

//Adding Restaurant to Favourites
// Adding Restaurant to Favourites
app.post('/api/customer/favorites', (req, res) => {
  const { customer_id, restaurant_id } = req.body;

  if (!customer_id || !restaurant_id) {
    return res.status(400).json({ error: 'Customer ID and Restaurant ID are required' });
  }

  const sql = 'INSERT INTO favorites (customer_id, restaurant_id) VALUES (?, ?)';
  db.query(sql, [customer_id, restaurant_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.status(201).json({ message: 'Restaurant added to favorites' });
  });
});

//View Favourites
app.get('/api/customer/favorites/:customer_id', (req, res) => {
  const { customer_id } = req.params;

  // Fetch favorite restaurants for the customer
  const sql = `
    SELECT r.* 
    FROM restaurants r
    JOIN favorites f ON r.id = f.restaurant_id
    WHERE f.customer_id = ?
  `;
  db.query(sql, [customer_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(result);
  });
});

//Remove Favourites
app.delete('/api/customer/favorites/:customer_id/:restaurant_id', (req, res) => {
  const { customer_id, restaurant_id } = req.params;

  // Remove the restaurant from favorites
  const sql = 'DELETE FROM favorites WHERE customer_id = ? AND restaurant_id = ?';
  db.query(sql, [customer_id, restaurant_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Favorite not found' });
    res.json({ message: 'Restaurant removed from favorites' });
  });
});

//Get all restaurants
app.get('/api/restaurants', (req, res) => {
  // Fetch all restaurants
  const sql = 'SELECT * FROM restaurants';
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(result);
  });
});

//Get all dishes
app.get('/api/dishes', (req, res) => {
  // Fetch all dishes
  const sql = 'SELECT * FROM dishes';
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(result);
  });
});

//Add dish to cart
// Add dish to cart
app.post('/api/customer/cart', (req, res) => {
  const { customer_id, dish_id, quantity } = req.body;

  if (!customer_id || !dish_id || !quantity) {
    return res.status(400).json({ error: 'Required fields are missing' });
  }

  const sql = 'INSERT INTO cart (customer_id, dish_id, quantity) VALUES (?, ?, ?)';
  db.query(sql, [customer_id, dish_id, quantity], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.status(201).json({ message: 'Dish added to cart successfully' });
  });
});

//View Cart
app.get('/api/customer/cart/:customer_id', (req, res) => {
  const { customer_id } = req.params;

  // Fetch the cart for the customer
  const sql = `
    SELECT c.*, d.name, d.price, d.image, d.restaurant_id 
    FROM cart c
    JOIN dishes d ON c.dish_id = d.id
    WHERE c.customer_id = ?
  `;
  db.query(sql, [customer_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(result);
  });
});

//Remove dish from Cart
app.delete('/api/customer/cart/:cart_id', (req, res) => {
  const { cart_id } = req.params;

  // Remove the dish from the cart
  const sql = 'DELETE FROM cart WHERE id = ?';
  db.query(sql, [cart_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Cart item not found' });
    res.json({ message: 'Dish removed from cart successfully' });
  });
});

// Clear cart for a customer
app.delete('/api/customer/cart/clear/:customer_id', (req, res) => {
  const { customer_id } = req.params;

  const sql = 'DELETE FROM cart WHERE customer_id = ?';
  db.query(sql, [customer_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ message: 'Cart cleared successfully' });
  });
});

//Restaurant

//Restaurant Signup
app.post('/api/restaurant/signup', async (req, res) => {
  const { name, email, password, location, description, contact_info, images, timings } = req.body;

  if (!name || !email || !password || !location) {
    return res.status(400).json({ error: 'Required fields are missing' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const sql = 'INSERT INTO restaurants (name, email, password, location, description, contact_info, images, timings) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [name, email, hashedPassword, location, description, contact_info, images, timings], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Email already exists' });
      }
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(201).json({ message: 'Restaurant registered successfully', restaurant: { id: result.insertId, name, email } });
  });
});

//Restaurant Login
app.post('/api/restaurant/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const sql = 'SELECT * FROM restaurants WHERE email = ?';
  db.query(sql, [email], async (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (result.length === 0) return res.status(404).json({ error: 'Restaurant not found' });

    const restaurant = result[0];
    const isMatch = await bcrypt.compare(password, restaurant.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    req.session.restaurantId = restaurant.id;
    res.json({ message: 'Login successful', restaurant: { id: restaurant.id, name: restaurant.name, email: restaurant.email } });
  });
});

//Restaurant Logout
app.post('/api/restaurant/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.json({ message: 'Logout successful' });
  });
});

//Restaurant View Profile
app.get('/api/restaurant/profile/:restaurant_id', (req, res) => {
  const { restaurant_id } = req.params;

  // Fetch restaurant profile
  const sql = 'SELECT * FROM restaurants WHERE id = ?';
  db.query(sql, [restaurant_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (result.length === 0) return res.status(404).json({ error: 'Restaurant not found' });
    res.json(result[0]);
  });
});

//Restaurant Profile Update
app.put('/api/restaurant/profile/:restaurant_id', (req, res) => {
  const { restaurant_id } = req.params;
  const { name, location, description, contact_info, images, timings } = req.body;

  // Validate input
  if (!name && !location && !description && !contact_info && !images && !timings) {
    return res.status(400).json({ error: 'At least one field is required' });
  }

  // Update the restaurant profile
  const sql = 'UPDATE restaurants SET name = ?, location = ?, description = ?, contact_info = ?, images = ?, timings = ? WHERE id = ?';
  db.query(sql, [name, location, description, contact_info, images, timings, restaurant_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ message: 'Profile updated successfully' });
  });
});

//Restaurant Delete Profile
app.delete('/api/restaurant/profile/:restaurant_id', (req, res) => {
  const { restaurant_id } = req.params;

  // Delete the restaurant profile
  const sql = 'DELETE FROM restaurants WHERE id = ?';
  db.query(sql, [restaurant_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Restaurant not found' });
    res.json({ message: 'Restaurant profile deleted successfully' });
  });
});

//Restaurant Add-Dishes
app.post('/api/restaurant/dishes', async (req, res) => {
  const { restaurant_id, name, ingredients, image, price, description, category } = req.body;

  // Validate input
  if (!restaurant_id || !name || !price || !category) {
    return res.status(400).json({ error: 'Required fields are missing' });
  }

  // Insert the dish into the database
  const sql = 'INSERT INTO dishes (restaurant_id, name, ingredients, image, price, description, category) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [restaurant_id, name, ingredients, image, price, description, category], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.status(201).json({ message: 'Dish added successfully' });
  });
});

//Restaurant View Dishes
app.get('/api/restaurant/dishes/:restaurant_id', (req, res) => {
  const { restaurant_id } = req.params;

  // Fetch dishes for the restaurant
  const sql = 'SELECT * FROM dishes WHERE restaurant_id = ?';
  db.query(sql, [restaurant_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(result);
  });
});

//Restaurant Update Dishes
app.put('/api/restaurant/dishes/:dish_id', (req, res) => {
  const { dish_id } = req.params;
  const { name, ingredients, image, price, description, category } = req.body;

  // Validate input
  if (!name && !ingredients && !image && !price && !description && !category) {
    return res.status(400).json({ error: 'At least one field is required' });
  }

  // Update the dish
  const sql = `
    UPDATE dishes 
    SET name = ?, ingredients = ?, image = ?, price = ?, description = ?, category = ?
    WHERE id = ?
  `;
  db.query(sql, [name, ingredients, image, price, description, category, dish_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Dish not found' });
    res.json({ message: 'Dish updated successfully' });
  });
});

// Fetch a single dish by dish_id
app.get('/api/dish/:dish_id', (req, res) => {
  const { dish_id } = req.params;
  console.log("Fetching dish with ID:", dish_id); // Debugging

  const sql = `SELECT * FROM dishes WHERE id = ?`;
  db.query(sql, [dish_id], (err, result) => {
    if (err) {
      console.error("Database error:", err); // Debugging
      return res.status(500).json({ error: 'Database error' });
    }

    console.log("Query Result:", result); // Debugging

    if (result.length === 0) {
      console.log("Dish not found for ID:", dish_id); // Debugging
      return res.status(404).json({ error: 'Dish not found' });
    }

    res.json(result[0]); // Return the dish details
  });
});

//Restaurant Delete Dishes
app.delete('/api/restaurant/dishes/:dish_id', (req, res) => {
  const { dish_id } = req.params;

  // Delete the dish
  const sql = 'DELETE FROM dishes WHERE id = ?';
  db.query(sql, [dish_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Dish not found' });
    res.json({ message: 'Dish deleted successfully' });
  });
});

//Get Order by Restaurant

// Get orders for a specific restaurant
app.get('/api/restaurant/orders/:restaurant_id', (req, res) => {
  const { restaurant_id } = req.params;
  const { status } = req.query;

  let sql = `
    SELECT 
      o.id AS order_id,
      o.customer_id,
      o.status,
      o.created_at,
      c.name AS customer_name,
      GROUP_CONCAT(d.name SEPARATOR ', ') AS dish_names,
      SUM(d.price * oi.quantity) AS total
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    JOIN order_items oi ON o.id = oi.order_id
    JOIN dishes d ON oi.dish_id = d.id
    WHERE o.restaurant_id = ?
  `;

  const params = [restaurant_id];
  
  if (status && status !== 'All') {
    sql += ' AND o.status = ?';
    params.push(status);
  }

  sql += ' GROUP BY o.id ORDER BY o.created_at DESC';

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(result);
  });
});

//Filter Order By Status
app.get('/api/restaurant/orders/:restaurant_id', (req, res) => {
  const { restaurant_id } = req.params;
  const { status } = req.query;

  let sql = 'SELECT * FROM orders WHERE restaurant_id = ?';
  if (status) {
    sql += ' AND status = ?';
  }

  db.query(sql, [restaurant_id, status], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(result);
  });
});

//View customer profile for Orders
app.get('/api/orders/:order_id/customer', (req, res) => {
  const { order_id } = req.params;

  // Fetch customer details for the order
  const sql = `
    SELECT c.* 
    FROM customers c
    JOIN orders o ON c.id = o.customer_id
    WHERE o.id = ?
  `;
  db.query(sql, [order_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (result.length === 0) return res.status(404).json({ error: 'Customer not found for this order' });
    res.json(result[0]);
  });
});

//Update Order Status
app.put('/api/orders/:order_id/status', (req, res) => {
  const { order_id } = req.params;
  const { status } = req.body;

  // Validate input
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  // Update the order status
  const sql = 'UPDATE orders SET status = ? WHERE id = ?';
  db.query(sql, [status, order_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Order not found' });
    res.json({ message: 'Order status updated successfully' });
  });
});

// Fetch restaurants and dishes by location (or all if no location is provided)
app.get('/api/restaurants/location', (req, res) => {
  const { location } = req.query;

  // Fetch restaurants
  let restaurantsSql = 'SELECT * FROM restaurants';
  let restaurantsParams = [];
  if (location) {
    restaurantsSql += ' WHERE location LIKE ?';
    restaurantsParams.push(`%${location}%`);
  }

  db.query(restaurantsSql, restaurantsParams, (err, restaurantsResult) => {
    if (err) return res.status(500).json({ error: 'Database error' });

    if (restaurantsResult.length === 0) {
      return res.json({ restaurants: [], dishes: [] }); // No restaurants found
    }

    // Fetch dishes for the restaurants
    const restaurantIds = restaurantsResult.map((restaurant) => restaurant.id);
    const dishesSql = 'SELECT * FROM dishes WHERE restaurant_id IN (?)';
    db.query(dishesSql, [restaurantIds], (err, dishesResult) => {
      if (err) return res.status(500).json({ error: 'Database error' });

      // Combine restaurants and dishes
      const response = {
        restaurants: restaurantsResult,
        dishes: dishesResult,
      };
      res.json(response);
    });
  });
});

//Orders

//Customer Place Order
app.post('/api/orders', async (req, res) => {
  const { customer_id, restaurant_id, status, items } = req.body;

  // Validate input
  if (!customer_id || !restaurant_id || !status || !items || items.length === 0) {
    return res.status(400).json({ error: 'Required fields are missing' });
  }

  // Start transaction
  db.beginTransaction(async (err) => {
    if (err) return res.status(500).json({ error: 'Database error' });

    try {
      // 1. Calculate total price
      const [cartItems] = await db.promise().query(
        `SELECT c.quantity, d.price 
         FROM cart c
         JOIN dishes d ON c.dish_id = d.id
         WHERE c.customer_id = ?`,
        [customer_id]
      );

      const total = cartItems.reduce((sum, item) => 
        sum + (Number(item.price) * item.quantity), 0);

      // 2. Insert order with calculated total
      const orderSql = `INSERT INTO orders 
        (customer_id, restaurant_id, status, total) 
        VALUES (?, ?, ?, ?)`;
        
      const [orderResult] = await db.promise().query(
        orderSql, 
        [customer_id, restaurant_id, status, total]
      );

      // 3. Insert order items
      const orderId = orderResult.insertId;
      const orderItemsSql = `INSERT INTO order_items 
        (order_id, dish_id, quantity) 
        VALUES ?`;
      
      const orderItemsValues = items.map((item) => 
        [orderId, item.dish_id, item.quantity]
      );

      await db.promise().query(orderItemsSql, [orderItemsValues]);

      // 4. Clear cart
      await db.promise().query(
        `DELETE FROM cart WHERE customer_id = ?`,
        [customer_id]
      );

      // Commit transaction
      await db.promise().commit();

      res.status(201).json({ 
        message: 'Order placed successfully', 
        orderId,
        total: total.toFixed(2)
      });
    } catch (error) {
      await db.promise().rollback();
      console.error('Error placing order:', error);
      res.status(500).json({ error: 'Database error' });
    }
  });
});

//Order Update
app.put('/api/orders/:order_id', (req, res) => {
  const { order_id } = req.params;
  const { status } = req.body;

  // Validate input
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  // Update the order status
  const sql = 'UPDATE orders SET status = ? WHERE id = ?';
  db.query(sql, [status, order_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ message: 'Order status updated successfully' });
  });
});

//Get Order by ID
app.get('/api/orders/:order_id', (req, res) => {
  const { order_id } = req.params;

  // Fetch order details
  const sql = 'SELECT * FROM orders WHERE id = ?';
  db.query(sql, [order_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (result.length === 0) return res.status(404).json({ error: 'Order not found' });
    res.json(result[0]);
  });
});

//Search Functionality

//Search dishes by Name
app.get('/api/dishes/search', (req, res) => {
  const { query } = req.query;

  // Validate input
  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  // Search for dishes by name
  const sql = 'SELECT * FROM dishes WHERE name LIKE ?';
  db.query(sql, [`%${query}%`], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(result);
  });
});

//Search Restaurants by Name
app.get('/api/restaurants/search', (req, res) => {
  const { query } = req.query;

  // Validate input
  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  // Search for restaurants by name
  const sql = 'SELECT * FROM restaurants WHERE name LIKE ?';
  db.query(sql, [`%${query}%`], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(result);
  });
});

//Search Dishes by Category
app.get('/api/dishes/category', (req, res) => {
  const { category } = req.query;

  // Validate input
  if (!category) {
    return res.status(400).json({ error: 'Category is required' });
  }

  // Search for dishes by category
  const sql = 'SELECT * FROM dishes WHERE category = ?';
  db.query(sql, [category], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(result);
  });
});

//Search Restaurants by Location
app.get('/api/restaurants/location', (req, res) => {
  const { location } = req.query;

  // Validate input
  if (!location) {
    return res.status(400).json({ error: 'Location is required' });
  }

  // Search for restaurants by location
  const sql = 'SELECT * FROM restaurants WHERE location LIKE ?';
  db.query(sql, [`%${location}%`], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(result);
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
