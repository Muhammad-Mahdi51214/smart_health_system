const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const auditLogger = require('../middleware/auditLogger');

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
   
    const [admins] = await db.execute(
      'SELECT * FROM admin_users WHERE email = ? AND is_active = 1', 
      [email]
    );
    console.log(admins)
    
    if (admins.length === 0) {
      return res.status(401).json({ error: 'Admin Not Found' });
    }
    
    const admin = admins[0];
    
    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }
    
    // Update last login
    await db.execute('UPDATE admin_users SET last_login = NOW() WHERE admin_id = ?', [admin.admin_id]);
    
    const token = await jwt.sign(
      { id: admin.admin_id, email: admin.email, role: admin.role }, 
      process.env.JWT_ADMIN_SECRET, 
      { expiresIn: '24h' }
    );
    
    // Log admin audit
    req.admin = { id: admin.admin_id };
    await auditLogger.logAdminAction(
      req, 
      'ADMIN_LOGIN', 
      'AUTH', 
      'admin_users', 
      admin.admin_id, 
      `Admin logged in: ${admin.username}`
    );
    
    res.json({ 
      message: 'Admin login successful', 
      token, 
      admin: {
        id: admin.admin_id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        permissions: typeof admin.permissions === 'string'
  ? JSON.parse(admin.permissions)
  : admin.permissions

      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Admin login failed' });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    // Total users
    const [users] = await db.execute('SELECT COUNT(*) as total FROM users WHERE is_active = 1');
    
    // Total predictions
    const [predictions] = await db.execute('SELECT COUNT(*) as total FROM predictions');
    
    // Predictions by disease
    const [diseaseStats] = await db.execute(`
      SELECT dt.disease_name, COUNT(p.prediction_id) as count 
      FROM predictions p 
      JOIN disease_types dt ON p.disease_type_id = dt.disease_type_id 
      GROUP BY dt.disease_name
    `);
    
    // Pending messages
    const [messages] = await db.execute('SELECT COUNT(*) as total FROM contact_messages WHERE status = "Pending"');
    
    // Recent predictions
    const [recentPredictions] = await db.execute(`
      SELECT p.*, u.username, dt.disease_name 
      FROM predictions p 
      JOIN users u ON p.user_id = u.user_id 
      JOIN disease_types dt ON p.disease_type_id = dt.disease_type_id 
      ORDER BY p.prediction_date DESC 
      LIMIT 10
    `);
    
    // Critical cases
    const [criticalCases] = await db.execute(`
      SELECT COUNT(*) as total FROM predictions 
      WHERE severity_level IN ('Critical', 'Urgent') AND prediction_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);
    
    res.json({
      totalUsers: users[0].total,
      totalPredictions: predictions[0].total,
      diseaseStats,
      pendingMessages: messages[0].total,
      criticalCases: criticalCases[0].total,
      recentPredictions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.execute(`
      SELECT 
        user_id, username, email, first_name, last_name, city, created_at, is_active,
        (SELECT COUNT(*) FROM predictions WHERE user_id = users.user_id) as total_predictions
      FROM users 
      ORDER BY created_at DESC
    `);
    
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    await db.execute('DELETE FROM users WHERE user_id = ?', [userId]);
    
    // Log admin audit
    await auditLogger.logAdminAction(
      req, 
      'DELETE_USER', 
      'ADMIN', 
      'users', 
      userId, 
      `Admin deleted user #${userId}`
    );
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;
    
    await db.execute('UPDATE users SET is_active = ? WHERE user_id = ?', [isActive, userId]);
    
    await auditLogger.logAdminAction(
      req, 
      'TOGGLE_USER_STATUS', 
      'ADMIN', 
      'users', 
      userId, 
      `Admin ${isActive ? 'activated' : 'deactivated'} user #${userId}`
    );
    
    res.json({ message: 'User status updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
};