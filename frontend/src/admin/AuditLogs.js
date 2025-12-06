import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({
    userType: '',
    actionCategory: '',
    limit: 100
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const queryParams = new URLSearchParams(filters).toString();
      const response = await axios.get(
        `http://localhost:5000/api/audit/logs?${queryParams}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setLogs(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading audit logs...</div>;
  }

  return (
    <div className="admin-section">
      <h2>Audit Logs</h2>
      
      <div className="filters">
        <select 
          value={filters.userType}
          onChange={(e) => setFilters({...filters, userType: e.target.value})}
        >
          <option value="">All Users</option>
          <option value="user">Users</option>
          <option value="admin">Admins</option>
        </select>
        
        <select 
          value={filters.actionCategory}
          onChange={(e) => setFilters({...filters, actionCategory: e.target.value})}
        >
          <option value="">All Actions</option>
          <option value="AUTH">Authentication</option>
          <option value="PREDICTION">Predictions</option>
          <option value="CONTACT">Contact</option>
          <option value="ADMIN">Admin Actions</option>
        </select>
        
        <select 
          value={filters.limit}
          onChange={(e) => setFilters({...filters, limit: e.target.value})}
        >
          <option value="50">Last 50</option>
          <option value="100">Last 100</option>
          <option value="200">Last 200</option>
        </select>
      </div>
      
      <div className="table-container">
        <table className="admin-table audit-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>User</th>
              <th>Type</th>
              <th>Action</th>
              <th>Category</th>
              <th>Description</th>
              <th>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.log_id}>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
                <td>
                  {log.user_type === 'user' ? log.user_name : log.admin_name}
                </td>
                <td>
                  <span className={`user-type-badge ${log.user_type}`}>
                    {log.user_type}
                  </span>
                </td>
                <td>{log.action_type}</td>
                <td>
                  <span className={`category-badge ${log.action_category.toLowerCase()}`}>
                    {log.action_category}
                  </span>
                </td>
                <td className="description-cell">{log.description}</td>
                <td>{log.ip_address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AuditLogs;