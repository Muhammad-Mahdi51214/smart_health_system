
import { Link, Outlet, useNavigate } from 'react-router-dom';

function AdminLayout() {
  const navigate = useNavigate();
  const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <h2> Admin Panel</h2>
          <p>{adminData.username}</p>
        </div>
        
        <nav className="admin-nav">
          <Link to="/admin/dashboard" className="admin-nav-link">
            📊 Dashboard
          </Link>
          <Link to="/admin/users" className="admin-nav-link">
            👥 User Management
          </Link>
          <Link to="/admin/messages" className="admin-nav-link">
            💬 Messages
          </Link>
          <Link to="/admin/audit-logs" className="admin-nav-link">
            📋 Audit Logs
          </Link>
        </nav>
        
        <div className="admin-footer">
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </aside>
      
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;