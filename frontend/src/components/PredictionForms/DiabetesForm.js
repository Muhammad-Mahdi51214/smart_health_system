import { useState } from 'react';
import axios from 'axios';
import HospitalMap from '../HospitalMap';

function DiabetesForm() {
  const [formData, setFormData] = useState({
    glucose: '',
    bmi: '',
    age: '',
    insulin: '',
    pregnancies: '',
    bloodPressure: '',
    skinThickness: '',
    dpf: ''
  });
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formStep, setFormStep] = useState(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setResult(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/predict/diabetes',
        formData,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setResult(response.data);
    } catch (error) {
      setError(error.response?.data?.error || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    setFormStep(2);
  };

  const handlePrevStep = () => {
    setFormStep(1);
  };

  return (
    <div className="container">
      <div className="prediction-container">
        <h2 style={{ marginBottom: '10px' }}>🩺 Diabetes Risk Prediction</h2>
        <p style={{ color: '#7f8c8d', marginBottom: '25px' }}>Enter your health metrics for an accurate diabetes risk assessment</p>
        
        {error && (
          <div className="error-message" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>❌</span>
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="prediction-form">
          <div style={{ position: 'relative', marginBottom: '30px' }}>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
              <div style={{
                flex: 1,
                height: '3px',
                background: formStep >= 1 ? 'linear-gradient(90deg, #3498db, #2980b9)' : '#e0e0e0',
                borderRadius: '3px',
                transition: 'all 0.3s ease'
              }} />
              <div style={{
                flex: 1,
                height: '3px',
                background: formStep >= 2 ? 'linear-gradient(90deg, #3498db, #2980b9)' : '#e0e0e0',
                borderRadius: '3px',
                transition: 'all 0.3s ease'
              }} />
            </div>
          </div>

          {formStep === 1 && (
            <div style={{ animation: 'fadeInUp 0.5s ease-out' }}>
              <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>📊 Step 1: Basic Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="glucose">📌 Glucose Level (mg/dL):</label>
                  <input
                    id="glucose"
                    type="number"
                    step="0.01"
                    required
                    placeholder="70-200"
                    value={formData.glucose}
                    onChange={(e) => setFormData({...formData, glucose: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="bmi">⚖️ BMI:</label>
                  <input
                    id="bmi"
                    type="number"
                    step="0.01"
                    required
                    placeholder="10-50"
                    value={formData.bmi}
                    onChange={(e) => setFormData({...formData, bmi: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="age">👤 Age:</label>
                  <input
                    id="age"
                    type="number"
                    required
                    placeholder="18-100"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="pregnancies">👶 Number of Pregnancies:</label>
                  <input
                    id="pregnancies"
                    type="number"
                    required
                    placeholder="0-20"
                    value={formData.pregnancies}
                    onChange={(e) => setFormData({...formData, pregnancies: e.target.value})}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleNextStep}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '20px', position: 'relative', zIndex: 1 }}
              >
                Next Step ➜
              </button>
            </div>
          )}

          {formStep === 2 && (
            <div style={{ animation: 'fadeInUp 0.5s ease-out' }}>
              <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>🏥 Step 2: Medical Details</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="insulin">💉 Insulin Level (mu U/ml):</label>
                  <input
                    id="insulin"
                    type="number"
                    step="0.01"
                    required
                    placeholder="0-300"
                    value={formData.insulin}
                    onChange={(e) => setFormData({...formData, insulin: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="bloodPressure">❤️ Blood Pressure (mm Hg):</label>
                  <input
                    id="bloodPressure"
                    type="number"
                    required
                    placeholder="60-140"
                    value={formData.bloodPressure}
                    onChange={(e) => setFormData({...formData, bloodPressure: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="skinThickness">📏 Skin Thickness (mm):</label>
                  <input
                    id="skinThickness"
                    type="number"
                    step="0.01"
                    required
                    placeholder="0-100"
                    value={formData.skinThickness}
                    onChange={(e) => setFormData({...formData, skinThickness: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="dpf">🧬 Diabetes Pedigree Function:</label>
                  <input
                    id="dpf"
                    type="number"
                    step="0.001"
                    required
                    placeholder="0-2"
                    value={formData.dpf}
                    onChange={(e) => setFormData({...formData, dpf: e.target.value})}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="btn btn-secondary"
                  style={{ position: 'relative', zIndex: 1 }}
                >
                  ← Previous Step
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ position: 'relative', zIndex: 1 }}
                >
                  {loading ? '🔄 Analyzing...' : '✨ Predict Diabetes Risk'}
                </button>
              </div>
            </div>
          )}
        </form>
        
        {result && (
          <div className="result-container">
            <div className={`result-card ${result.prediction === 'Positive' ? 'result-positive-card' : 'result-negative-card'}`}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {result.prediction === 'Positive' ? '🚨' : '✅'} Prediction Result
              </h3>
              <div className="result-grid">
                <div className="result-item">
                  <span className="result-label">Diagnosis:</span>
                  <span className="result-value">
                    {result.prediction === 'Positive' ? '⚠️ Positive' : '✅ Negative'}
                  </span>
                </div>
                <div className="result-item">
                  <span className="result-label">Confidence:</span>
                  <span className="result-value">{(result.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="result-item">
                  <span className="result-label">Risk Level:</span>
                  <span className="result-value">{result.riskPercentage}%</span>
                </div>
                <div className="result-item">
                  <span className="result-label">Severity:</span>
                  <span className={`severity-badge severity-${result.severity.toLowerCase().replace(' ', '-')}`}>
                    {result.severity}
                  </span>
                </div>
              </div>
              
              {result.emergencyRequired && (
                <div className="emergency-alert">
                  ⚠️ <strong>Emergency:</strong> Immediate medical attention recommended
                </div>
              )}
              
              <div className="recommendations" style={{ marginTop: '25px' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                  💊 Recommendations
                </h4>
                <p style={{ lineHeight: '1.8' }}>{result.recommendations}</p>
              </div>
            </div>
            
            {result.nearbyHospitals && result.nearbyHospitals.length > 0 && (
              <div className="hospitals-container">
                <h3 style={{ marginBottom: '20px' }}>🏥 Nearest Hospitals</h3>
                <HospitalMap 
                  hospitals={result.nearbyHospitals}
                  userLocation={[result.nearbyHospitals[0]?.latitude || 33.6, result.nearbyHospitals[0]?.longitude || 73.0]}
                />
                
                <div className="hospitals-list">
                  {result.nearbyHospitals.map((hospital, index) => (
                    <div key={hospital.hospital_id} className="hospital-card" style={{ animation: `scaleIn ${0.3 + index * 0.1}s ease-out` }}>
                      <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <span style={{ fontSize: '1.3rem' }}>#{index + 1}</span>
                        {hospital.hospital_name}
                      </h4>
                      <p>📍 {hospital.address}, {hospital.city}</p>
                      <p>📞 {hospital.phone}</p>
                      <p>📏 <strong>Distance:</strong> {hospital.distance?.toFixed(2)} km</p>
                      <p>⭐ <strong>Rating:</strong> {hospital.rating}/5.0</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DiabetesForm;