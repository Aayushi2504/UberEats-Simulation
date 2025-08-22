import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getRestaurantDetails } from '../services/api';

const Restaurant = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      try {
        const response = await getRestaurantDetails(id);
        setRestaurant(response.data);
      } catch (error) {
        console.error('Error fetching restaurant details:', error);
      }
    };
    fetchRestaurantDetails();
  }, [id]);

  if (!restaurant) return <div>Loading...</div>;

  return (
    <div className="container mt-4">
      <h1>{restaurant.name}</h1>
      <p>{restaurant.description}</p>
      <div className="row">
        {restaurant.dishes.map((dish) => (
          <div key={dish.id} className="col-md-4 mb-4">
            <div className="card">
              <img src={dish.image} className="card-img-top" alt={dish.name} />
              <div className="card-body">
                <h5 className="card-title">{dish.name}</h5>
                <p className="card-text">{dish.description}</p>
                <p className="card-text">${dish.price}</p>
                <button className="btn btn-primary">Add to Cart</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Restaurant;