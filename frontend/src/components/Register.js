import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    city: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setFormData({...formData, password});
    setPasswordStrength(calculatePasswordStrength(password));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('❌ Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('❌ Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const postData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        city: formData.city
      }

     await axios.post('http://localhost:5000/api/auth/register', postData);
      
      alert('✅ Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      setError(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return '#e0e0e0';
    if (passwordStrength <= 2) return '#e74c3c';
    if (passwordStrength <= 3) return '#f39c12';
    return '#2ecc71';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return 'Enter password';
    if (passwordStrength <= 2) return '🔴 Weak';
    if (passwordStrength <= 3) return '🟡 Fair';
    return '🟢 Strong';
  };

  return (
    <div className="container">
      <div className="form-container">
        <h2 style={{ marginBottom: '10px' }}>Create Your Account</h2>
        <p style={{ color: '#7f8c8d', marginBottom: '25px' }}>Join our health prediction community</p>
        
        {error && (
          <div className="error-message" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>❌</span>
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">👤 First Name:</label>
              <input
                id="firstName"
                type="text"
                required
                placeholder="John"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="lastName">👤 Last Name:</label>
              <input
                id="lastName"
                type="text"
                required
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="username">👽 Username:</label>
            <input
              id="username"
              type="text"
              required
              placeholder="johndoe"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">📧 Email:</label>
            <input
              id="email"
              type="email"
              required
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">📱 Phone:</label>
              <input
                id="phone"
                type="tel"
                placeholder="(+92) 123-4567890"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="city">🏙️ City:</label>
              <input
                id="city"
                type="text"
                placeholder="Islamabad"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">🔐 Password:</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter a strong password"
                  value={formData.password}
                  onChange={handlePasswordChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.2rem'
                  }}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {formData.password && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{
                    height: '4px',
                    background: '#e0e0e0',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${(passwordStrength / 5) * 100}%`,
                      background: getPasswordStrengthColor(),
                      transition: 'all 0.3s ease'
                    }} />
                  </div>
                  <p style={{ fontSize: '0.85rem', color: getPasswordStrengthColor(), marginTop: '5px' }}>
                    {getPasswordStrengthText()}
                  </p>
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">🔐 Confirm Password:</label>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Repeat password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              />
              {formData.password && formData.confirmPassword && (
                <p style={{
                  fontSize: '0.85rem',
                  marginTop: '5px',
                  color: formData.password === formData.confirmPassword ? '#2ecc71' : '#e74c3c'
                }}>
                  {formData.password === formData.confirmPassword ? '✅ Passwords match' : '❌ Passwords do not match'}
                </p>
              )}
            </div>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-large" 
            disabled={loading}
            style={{ position: 'relative', zIndex: 1 }}
          >
            {loading ? '🔄 Creating Account...' : '✨ Register Now'}
          </button>
        </form>
        
        <p className="form-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;