import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCustomerProfile, updateCustomerProfile } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './Profile.css';

const Profile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    profilePicture: '',
    country: '',
    state: '',
  });
  const [errors, setErrors] = useState({
    name: '',
    profilePicture: '',
    country: '',
    state: ''
  });

  const countries = ['United States', 'Canada', 'United Kingdom'];
  const stateAbbreviations = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getCustomerProfile(id);
        setProfile(response.data);
        setFormData({
          name: response.data.name,
          profilePicture: response.data.profilePicture || '',
          country: response.data.country || '',
          state: response.data.state || '',
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'name':
        if (!value.trim()) error = 'Name is required';
        break;
      case 'profilePicture':
        if (value && !/^https?:\/\/.+\..+/.test(value)) {
          error = 'Invalid URL format';
        }
        break;
      case 'country':
        if (editMode && !value) error = 'Country is required';
        break;
      case 'state':
        if (editMode && formData.country && !value) error = 'State is required';
        break;
      default:
        break;
    }
    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: validateField(name, value)
      });
    }
  };

  const validateForm = () => {
    const newErrors = {
      name: validateField('name', formData.name),
      profilePicture: validateField('profilePicture', formData.profilePicture),
      country: validateField('country', formData.country),
      state: validateField('state', formData.state)
    };
    setErrors(newErrors);
    return Object.values(newErrors).every(error => !error);
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    try {
      await updateCustomerProfile(id, formData);
      setProfile((prevProfile) => ({
        ...prevProfile,
        ...formData,
      }));
      setEditMode(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!profile) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <h1>Profile Not Found</h1>
          </div>
          <div className="profile-body">
            <p>No profile data available.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h1>Profile</h1>
        </div>

        <div className="profile-picture-container">
          {profile.profilePicture ? (
            <img src={profile.profilePicture} alt="Profile" className="profile-picture" />
          ) : (
            <div className="profile-placeholder">No image</div>
          )}
        </div>

        <div className="profile-body">
          {editMode ? (
            <div className="edit-form">
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={errors.name ? 'error-input' : ''}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label>Profile Picture URL:</label>
                <input
                  type="text"
                  name="profilePicture"
                  value={formData.profilePicture}
                  onChange={handleInputChange}
                  className={errors.profilePicture ? 'error-input' : ''}
                />
                {errors.profilePicture && <span className="error-message">{errors.profilePicture}</span>}
              </div>
              <div className="form-group">
                <label>Country:</label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className={errors.country ? 'error-input' : ''}
                >
                  <option value="">Select Country</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
                {errors.country && <span className="error-message">{errors.country}</span>}
              </div>
              <div className="form-group">
                <label>State:</label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className={errors.state ? 'error-input' : ''}
                >
                  <option value="">Select State</option>
                  {stateAbbreviations.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                {errors.state && <span className="error-message">{errors.state}</span>}
              </div>

              <div className="profile-actions">
                <button className="btn-save" onClick={handleSave}>
                  Save
                </button>
                <button className="btn-cancel" onClick={() => setEditMode(false)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="profile-info">
                <div className="profile-info-item">
                  <span className="info-label">Name:</span>
                  <span className="info-value">{profile.name}</span>
                </div>
                <div className="profile-info-item">
                  <span className="info-label">Country:</span>
                  <span className="info-value">{profile.country}</span>
                </div>
                <div className="profile-info-item">
                  <span className="info-label">State:</span>
                  <span className="info-value">{profile.state}</span>
                </div>
              </div>

              <div className="profile-actions">
                <button className="btn-edit" onClick={() => setEditMode(true)}>
                  Edit Profile
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
