import  { useState, useEffect } from 'react';
import axios from 'axios';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('http://localhost:5000/api/admin/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (!stats) {
    return <div className="error-message">Failed to load dashboard data</div>;
  }

  return (
    <div className="admin-dashboard">
      <h2>Dashboard Overview</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>Total Users</h3>
            <p className="stat-number">{stats.totalUsers}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🏥</div>
          <div className="stat-info">
            <h3>Total Predictions</h3>
            <p className="stat-number">{stats.totalPredictions}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💬</div>
          <div className="stat-info">
            <h3>Pending Messages</h3>
            <p className="stat-number">{stats.pendingMessages}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <h3>Critical Cases</h3>
            <p className="stat-number">{stats.criticalCases}</p>
          </div>
        </div>
      </div>

      <div className="admin-section">
        <h3>Disease-wise Predictions</h3>
        <div className="disease-stats">
          {stats.diseaseStats.map((disease) => (
            <div key={disease.disease_name} className="disease-stat-item">
              <span className="disease-name">{disease.disease_name}</span>
              <span className="disease-count">{disease.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-section">
        <h3>Recent Predictions</h3>
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Disease</th>
                <th>Result</th>
                <th>Severity</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentPredictions.map((pred) => (
                <tr key={pred.prediction_id}>
                  <td>{pred.username}</td>
                  <td>{pred.disease_name}</td>
                  <td className={pred.prediction_result === 'Positive' ? 'text-danger' : 'text-success'}>
                    {pred.prediction_result}
                  </td>
                  <td>
                    <span className={`severity-badge severity-${pred.severity_level.toLowerCase()}`}>
                      {pred.severity_level}
                    </span>
                  </td>
                  <td>{new Date(pred.prediction_date).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;