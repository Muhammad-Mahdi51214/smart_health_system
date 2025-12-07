import React, { useState } from 'react';
import axios from 'axios';

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const config = token ? {
        headers: { 'Authorization': `Bearer ${token}` }
      } : {};

      await axios.post('http://localhost:5000/api/contact/submit', formData, config);
      
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      setError('Failed to submit message. Please try again.');
      console.error('Contact submission failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <h2>📬 Contact Us</h2>
        <p style={{ color: '#7f8c8d', marginBottom: '25px' }}>Have questions? We're here to help! Your message will be reviewed shortly.</p>
        
        {submitted && (
          <div className="success-message" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>✅</span>
            <span>Thank you! Your message has been submitted successfully. We'll get back to you soon.</span>
          </div>
        )}
        
        {error && (
          <div className="error-message" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>❌</span>
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">👤 Name:</label>
            <input
              id="name"
              type="text"
              required
              placeholder="Your full name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">📧 Email:</label>
            <input
              id="email"
              type="email"
              required
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="subject">💬 Subject:</label>
            <input
              id="subject"
              type="text"
              required
              placeholder="What is this about?"
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="message">📝 Message:</label>
            <textarea
              id="message"
              required
              rows="5"
              placeholder="Tell us more details..."
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ position: 'relative', zIndex: 1 }}
          >
            {loading ? 'Sending...' : ' Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ContactForm;