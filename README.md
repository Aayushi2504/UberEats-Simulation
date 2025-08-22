# UberEats Simulation Project 

A full-stack **food delivery prototype** inspired by UberEats, built as part of coursework at San José State University.
This project demonstrates end-to-end development with **ReactJS, Node.js/Express, and MySQL**.

---

## Tech Stack
**Frontend:** React, Axios, Context API, CSS3  
**Backend:** Node.js, Express.js, Express-Session, Bcrypt  
**Database:** MySQL  
**Tools:** Postman, Git

---

## System Architecture
*(Note: Add your 'System_Architecture.png' image to a `/docs` folder)*

---

## Features

### Customer Features
- User authentication (Signup/Login) with secure session management
- Browse restaurants and menu items
- Add items to cart and place orders
- Manage favorites list
- View order history and track order status
- Update user profile and profile picture

### Restaurant Features
- Restaurant authentication and registration
- Manage restaurant profile (details, hours, contact info)
- Full CRUD operations for menu items (Create, Read, Update, Delete)
- View and manage incoming orders
- Update order status (New → Preparing → Delivered/Cancelled)

### Backend Features
- RESTful API design with proper HTTP status codes
- Session-based authentication & authorization
- Optimized database queries with indexing
- Secure password handling with bcrypt

---

## Screenshots
*(Note: Add your screenshots to a `/screenshots` folder)*

| Landing Page | Customer Home | Cart | Restaurant Dashboard |
|--------------|---------------|------|----------------------|
| ![Landing Page](screenshots/landing.png) | ![Customer Home](screenshots/customer_home.png) | ![Cart](screenshots/cart.png) | ![Restaurant Dashboard](screenshots/restaurant_dashboard.png) |

---

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MySQL Server
- npm or yarn

### Installation
1.  **Clone the repository**
    ```bash
    git clone https://github.com/Aayushi2504/UberEats-Simulation.git
    cd UberEats-Simulation
    ```

2.  **Set up the database**
    - Import the provided SQL schema into your MySQL server

3.  **Configure backend environment**
    ```bash
    cd backend
    npm install
    # Create a .env file with your database credentials
    ```

4.  **Configure frontend environment**
    ```bash
    cd ../frontend
    npm install
    ```

5.  **Run the application**
    - Start the backend server: `npm start` from the `/backend` directory
    - Start the frontend: `npm start` from the `/frontend` directory

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/customer/signup` | Customer registration |
| POST | `/api/customer/login` | Customer login |
| POST | `/api/restaurant/signup` | Restaurant registration |
| GET | `/api/restaurants` | Get all restaurants |
| GET | `/api/restaurants/:id/dishes` | Get dishes for a restaurant |
| POST | `/api/orders` | Place a new order |
| PUT | `/api/orders/:id/status` | Update order status |

> Full Postman collection available in `/postman` directory.

---

## Results & Learnings
- Successfully implemented secure session-based authentication for multiple user types
- Built a responsive frontend that works seamlessly across mobile and desktop devices
- Optimized database performance through query indexing and efficient schema design
- Gained experience in full-stack development and API design

**Future Enhancements:**
- Real-time order tracking with WebSockets
- Integration with payment gateways (Stripe/PayPal)
- Advanced search and filtering capabilities
- Push notifications for order updates

---

## Author
**Aayushi Shah**  
[![GitHub](https://img.shields.io/badge/GitHub-Aayushi2504-blue?style=flat&logo=github)](https://github.com/Aayushi2504)

---

## Disclaimer
This is an **academic prototype** developed for educational purposes as part of the DATA-236 Distributed Systems course at San José State University. It is not affiliated with or endorsed by Uber Technologies Inc.
