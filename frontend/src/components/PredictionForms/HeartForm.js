import  { useState } from 'react';
import axios from 'axios';
import HospitalMap from '../HospitalMap';

function HeartForm() {
  const [formData, setFormData] = useState({
    age: '',
    sex: '1',
    cp: '0',
    trestbps: '',
    chol: '',
    fbs: '0',
    restecg: '0',
    thalach: '',
    exang: '0',
    oldpeak: '',
    slope: '0',
    ca: '0',
    thal: '0'
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
        'http://localhost:5000/api/predict/heart',
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
        <h2 style={{ marginBottom: '10px' }}>❤️ Heart Disease Prediction</h2>
        <p style={{ color: '#7f8c8d', marginBottom: '25px' }}>Enter your cardiovascular health metrics for an accurate assessment</p>
        
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
                background: formStep >= 1 ? 'linear-gradient(90deg, #e74c3c, #c0392b)' : '#e0e0e0',
                borderRadius: '3px',
                transition: 'all 0.3s ease'
              }} />
              <div style={{
                flex: 1,
                height: '3px',
                background: formStep >= 2 ? 'linear-gradient(90deg, #e74c3c, #c0392b)' : '#e0e0e0',
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
                  <label htmlFor="age">👤 Age:</label>
                  <input
                    id="age"
                    type="number"
                    required
                    placeholder="20-80"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="sex">🚹 Sex:</label>
                  <select
                    id="sex"
                    value={formData.sex}
                    onChange={(e) => setFormData({...formData, sex: e.target.value})}
                  >
                    <option value="1">🚹 Male</option>
                    <option value="0">🚺 Female</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="cp">💔 Chest Pain Type:</label>
                  <select
                    id="cp"
                    value={formData.cp}
                    onChange={(e) => setFormData({...formData, cp: e.target.value})}
                  >
                    <option value="0">Typical Angina</option>
                    <option value="1">Atypical Angina</option>
                    <option value="2">Non-anginal Pain</option>
                    <option value="3">Asymptomatic</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="trestbps">❤️ Resting Blood Pressure (mm Hg):</label>
                  <input
                    id="trestbps"
                    type="number"
                    required
                    placeholder="90-180"
                    value={formData.trestbps}
                    onChange={(e) => setFormData({...formData, trestbps: e.target.value})}
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
                  <label htmlFor="chol">🧬 Cholesterol (mg/dL):</label>
                  <input
                    id="chol"
                    type="number"
                    step="0.01"
                    required
                    placeholder="120-350"
                    value={formData.chol}
                    onChange={(e) => setFormData({...formData, chol: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="fbs">🩸 Fasting Blood Sugar &gt; 120 mg/dL:</label>
                  <select
                    id="fbs"
                    value={formData.fbs}
                    onChange={(e) => setFormData({...formData, fbs: e.target.value})}
                  >
                    <option value="0">❌ No</option>
                    <option value="1">✅ Yes</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="restecg">📈 Resting ECG Results:</label>
                  <select
                    id="restecg"
                    value={formData.restecg}
                    onChange={(e) => setFormData({...formData, restecg: e.target.value})}
                  >
                    <option value="0">Normal</option>
                    <option value="1">ST-T Abnormality</option>
                    <option value="2">LV Hypertrophy</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="thalach">⚡ Max Heart Rate:</label>
                  <input
                    id="thalach"
                    type="number"
                    required
                    placeholder="60-200"
                    value={formData.thalach}
                    onChange={(e) => setFormData({...formData, thalach: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="exang">🏃 Exercise Induced Angina:</label>
                  <select
                    id="exang"
                    value={formData.exang}
                    onChange={(e) => setFormData({...formData, exang: e.target.value})}
                  >
                    <option value="0">❌ No</option>
                    <option value="1">✅ Yes</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="oldpeak">📊 ST Depression:</label>
                  <input
                    id="oldpeak"
                    type="number"
                    step="0.1"
                    required
                    placeholder="0-6"
                    value={formData.oldpeak}
                    onChange={(e) => setFormData({...formData, oldpeak: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="slope">📈 Slope of ST:</label>
                  <select
                    id="slope"
                    value={formData.slope}
                    onChange={(e) => setFormData({...formData, slope: e.target.value})}
                  >
                    <option value="0">Upsloping</option>
                    <option value="1">Flat</option>
                    <option value="2">Downsloping</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="ca">🩸 Major Vessels (0-3):</label>
                  <input
                    id="ca"
                    type="number"
                    min="0"
                    max="3"
                    required
                    value={formData.ca}
                    onChange={(e) => setFormData({...formData, ca: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="thal">🧬 Thalassemia:</label>
                <select
                  id="thal"
                  value={formData.thal}
                  onChange={(e) => setFormData({...formData, thal: e.target.value})}
                >
                  <option value="0">Normal</option>
                  <option value="1">Fixed Defect</option>
                  <option value="2">Reversible Defect</option>
                </select>
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
                  {loading ? '🔄 Analyzing...' : '✨ Predict Heart Disease'}
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
                  🚨 <strong>EMERGENCY:</strong> Seek immediate medical attention!
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
                <h3 style={{ marginBottom: '20px' }}>🏥 Nearest Cardiac Care Centers</h3>
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
                      {hospital.emergency_services && <span className="badge">⚡ Emergency Services</span>}
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

export default HeartForm;