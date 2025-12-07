import { useEffect, useState } from 'react';
import axios from 'axios';
import '../App.css'; 

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token'); // assuming JWT token
        const res = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setProfile(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch profile');
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p>{error}</p>;
  if (!profile) return <p>No profile data available.</p>;

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      <div className="profile-card">
        <p><strong>Username:</strong> {profile.username}</p>
        <p><strong>First Name:</strong> {profile.first_name}</p>
        <p><strong>Last Name:</strong> {profile.last_name}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Phone Number:</strong> {profile.phone_number}</p>
        <p><strong>City:</strong> {profile.city}</p>
      </div>
    </div>
  );
};

export default Profile;


