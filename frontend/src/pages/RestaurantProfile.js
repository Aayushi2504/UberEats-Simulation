import React, { useState, useEffect } from 'react';
import { getRestaurantProfile, updateRestaurantProfile } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

const RestaurantProfile = () => {
  const { restaurantId } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    contactInfo: '',
    images: '',
    timings: ''
  });
  const [errors, setErrors] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getRestaurantProfile(restaurantId);
        const { name, location, description, contact_info, images, timings } = response.data;
        setFormData({
          name,
          location,
          description,
          contactInfo: contact_info,
          images,
          timings
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, [restaurantId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Restaurant name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Please provide a description of your restaurant';
    } else if (formData.description.trim().length < 30) {
      newErrors.description = 'Description should be at least 30 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await updateRestaurantProfile(restaurantId, { 
        name: formData.name, 
        location: formData.location, 
        description: formData.description, 
        contact_info: formData.contactInfo, 
        images: formData.images, 
        timings: formData.timings 
      });
      alert('Profile updated successfully!');
      navigate('/restaurant-dashboard');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mt-4">
      <h1>Update Restaurant Profile</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Restaurant Name*</label>
          <input
            type="text"
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your restaurant name"
          />
          {errors.name && (
            <div className="invalid-feedback">
              {errors.name}
            </div>
          )}
        </div>
        <div className="mb-3">
          <label htmlFor="location" className="form-label">Location*</label>
          <input
            type="text"
            className="form-control"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            placeholder="Enter your restaurant address"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label">Description*</label>
          <textarea
            className={`form-control ${errors.description ? 'is-invalid' : ''}`}
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            placeholder="Tell customers about your restaurant (minimum 30 characters)"
          />
          {errors.description && (
            <div className="invalid-feedback">
              {errors.description}
            </div>
          )}
          <small className="text-muted">
            {formData.description.length}/30 characters minimum
          </small>
        </div>
        {/* Rest of the form fields remain the same */}
        <div className="mb-3">
          <label htmlFor="contactInfo" className="form-label">Contact Info</label>
          <input
            type="text"
            className="form-control"
            id="contactInfo"
            name="contactInfo"
            value={formData.contactInfo}
            onChange={handleChange}
            placeholder="Phone number or email"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="images" className="form-label">Images URL</label>
          <input
            type="text"
            className="form-control"
            id="images"
            name="images"
            value={formData.images}
            onChange={handleChange}
            placeholder="Comma-separated image URLs"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="timings" className="form-label">Timings</label>
          <input
            type="text"
            className="form-control"
            id="timings"
            name="timings"
            value={formData.timings}
            onChange={handleChange}
            placeholder="e.g., 9AM-10PM daily"
          />
        </div>
        <button type="submit" className="btn btn-primary">
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
};

export default RestaurantProfile;
