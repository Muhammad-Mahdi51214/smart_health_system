import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

// User components
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ContactForm from './components/ContactForm';
import DiabetesForm from './components/PredictionForms/DiabetesForm';
import HeartForm from './components/PredictionForms/HeartForm';
import HospitalMap from './components/HospitalMap';
import Profile from './components/Profile';


// Admin components
import AdminLogin from './admin/AdminLogin';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import UserManagement from './admin/UserManagement';
import MessagesManagement from './admin/MessagesManagement';
import AuditLogs from './admin/AuditLogs';
import PredictionPage from './components/PredictionPage';


// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

const AdminProtectedRoute = ({ children }) => {
  const adminToken = localStorage.getItem('adminToken');
  return adminToken ? children : <Navigate to="/admin/login" />;
};

function App() {
const [hospitals, setHospitals] = useState([]);
const [userLocation, setUserLocation] = useState(null); // initially null
const [locationLoaded, setLocationLoaded] = useState(false);

  // Fetch hospital data from API
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/hospitals/');
        setHospitals(res.data);
      } catch (err) {
        console.error('Error fetching hospitals:', err);
      }
    };

    fetchHospitals();
  }, []);

  useEffect(() => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
        setLocationLoaded(true);
      },
      (error) => {
        console.error('Error getting location:', error);
        setUserLocation([34.05, 71.55]); // fallback
        setLocationLoaded(true);
      },
      { enableHighAccuracy: true }
    );
  } else {
    console.log('Geolocation is not supported by this browser.');
    setUserLocation([34.05, 71.55]); // fallback
    setLocationLoaded(true);
  }
}, []);
  
  return (
    <Router>
      <Routes>
        {/* User Routes */}
        <Route path="/" element={
          <>
            <Navbar />
            <div className="container">
              <div className="hero">
                <h1>Smart Health Diagnosis System</h1>
                <p>AI-powered disease prediction for better healthcare</p>
              </div>
            </div>
          </>
        } />
        
        <Route path="/login" 
        element={
        <>
        <Navbar />
        <Login />
        </>
      } />
        <Route path="/register" element={<><Navbar /><Register /></>} />
        <Route path="/contact" element={<><Navbar /><ContactForm /></>} />
        <Route 
          path="/map" 
          element={
            <ProtectedRoute>
              <Navbar />
               {locationLoaded ? (
                 <HospitalMap hospitals={hospitals} userLocation={userLocation} />
                  ) : (
                <p>Loading map and user location...</p>
                )}
            </ProtectedRoute>
          }
        />


        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Navbar />
            <Dashboard />
          </ProtectedRoute>
        } />


        <Route 
        path="/profile" 
          element={
            <ProtectedRoute>
              <Navbar />
          <Profile />
          </ProtectedRoute>
          } 
/>
        <Route path="/predict" element={
          <ProtectedRoute>
            <Navbar />
            <PredictionPage />
          </ProtectedRoute>
        } />
        
        <Route path="/predict/heart" element={
          <ProtectedRoute>
            <Navbar />
            <HeartForm />
          </ProtectedRoute>
        } />
        <Route path="/predict/diabetes" element={
          <ProtectedRoute>
            <Navbar />
            <DiabetesForm />
          </ProtectedRoute>
        } />
        
         
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        <Route path="/admin" element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }>
         
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="messages" element={<MessagesManagement />} />
          <Route path="audit-logs" element={<AuditLogs />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;