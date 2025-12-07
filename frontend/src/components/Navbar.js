import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setMobileMenuOpen(false);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" className="nav-brand"> Smart Health</Link>
        <div className="nav-menu" style={{ animation: 'none' }}>
          {token ? (
            <>
              <Link to="/dashboard" className="nav-link"> Dashboard</Link>
              <Link to="/predict" className="nav-link"> Predictions</Link>
              <Link to="/contact" className="nav-link">Contact</Link>
              <Link to="/map" className="nav-link"> Map</Link>
              <Link to="/profile" className="nav-link"><span >👤 {user.username}</span></Link>
              <button onClick={handleLogout} className="btn btn-secondary" style={{ position: 'relative', zIndex: 1 }}>
                🚪 Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">🔓 Login</Link>
              <Link to="/register" className="btn btn-primary" style={{ position: 'relative', zIndex: 1 }}>✨ Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;