import { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/predict/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setPredictions(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch predictions:', error);
      setLoading(false);
    }
  };

  const getSeverityClass = (severity) => {
    const classes = {
      'Critical': 'severity-critical',
      'Urgent': 'severity-urgent',
      'Moderate Risk': 'severity-moderate',
      'Mild': 'severity-mild'
    };
    return classes[severity] || '';
  };

  const getSeverityIcon = (severity) => {
    const icons = {
      'Critical': '🚨',
      'Urgent': '⚠️',
      'Moderate Risk': '⚡',
      'Mild': '✅'
    };
    return icons[severity] || '📊';
  };

  if (loading) {
    return <div className="container"><div className="loading">Loading Dashboard...</div></div>;
  }

  return (
    <div className="container">
      <div className="dashboard-container">
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '2rem', color: '#2c3e50', marginBottom: '5px' }}> Welcome, {user.username}!</h2>
          <p style={{ color: '#7f8c8d' }}>Here's your health prediction overview</p>
        </div>
        
        <div className="stats-grid">
          <div className="stat-card">
            <h3>📊 Total Predictions</h3>
            <p className="stat-number">{predictions.length}</p>
            <p style={{ fontSize: '0.9rem', color: '#95a5a6', marginTop: '10px' }}>Health assessments completed</p>
          </div>
          
          <div className="stat-card">
            <h3>🚨 High Risk Results</h3>
            <p className="stat-number">
              {predictions.filter(p => p.severity_level === 'Critical' || p.severity_level === 'Urgent').length}
            </p>
            <p style={{ fontSize: '0.9rem', color: '#95a5a6', marginTop: '10px' }}>Requiring attention</p>
          </div>
          
          <div className="stat-card">
            <h3>📅 Recent Predictions</h3>
            <p className="stat-number">
              {predictions.filter(p => {
                const date = new Date(p.prediction_date);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return date >= weekAgo;
              }).length}
            </p>
            <p style={{ fontSize: '0.9rem', color: '#95a5a6', marginTop: '10px' }}>Last 7 days</p>
          </div>
        </div>

        <h3 style={{ marginTop: '40px', marginBottom: '20px', color: '#2c3e50' }}>📋 Your Prediction History</h3>
        
        {predictions.length === 0 ? (
          <div style={{
            background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
            padding: '40px',
            borderRadius: '12px',
            textAlign: 'center',
            color: '#2c3e50'
          }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '15px' }}>🎯 No predictions yet</p>
            <p style={{ color: '#7f8c8d' }}>Start by making a disease prediction to see your results here.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="predictions-table">
              <thead>
                <tr>
                  <th>📅 Date</th>
                  <th>🏥 Disease</th>
                  <th>🔍 Result</th>
                  <th>📈 Confidence</th>
                  <th>⚠️ Severity</th>
                  <th>🏨 Hospital</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((pred, index) => (
                  <tr key={pred.prediction_id} style={{ animation: `slideInLeft ${0.3 + index * 0.1}s ease-out` }}>
                    <td>{new Date(pred.prediction_date).toLocaleDateString()}</td>
                    <td style={{ fontWeight: '600' }}>{pred.disease_name}</td>
                    <td className={pred.prediction_result === 'Positive' ? 'result-positive' : 'result-negative'}>
                      {pred.prediction_result === 'Positive' ? '❌ Positive' : '✅ Negative'}
                    </td>
                    <td>
                      <div style={{
                        background: 'linear-gradient(90deg, #3498db 0%, #2980b9 100%)',
                        backgroundSize: `${pred.confidence_score * 100}% 100%`,
                        backgroundRepeat: 'no-repeat',
                        padding: '5px 10px',
                        borderRadius: '5px',
                        color: '#fff',
                        fontWeight: '600'
                      }}>
                        {(pred.confidence_score * 100).toFixed(1)}%
                      </div>
                    </td>
                    <td>
                      <span className={`severity-badge ${getSeverityClass(pred.severity_level)}`}>
                        {getSeverityIcon(pred.severity_level)} {pred.severity_level}
                      </span>
                    </td>
                    <td>{pred.hospital_name || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;