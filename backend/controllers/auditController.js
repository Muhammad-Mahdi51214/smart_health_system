const db = require('../config/db');

exports.getAuditLogs = async (req, res) => {
  try {
    const { userType, actionCategory, startDate, endDate, limit = 100 } = req.query;
    
    let query = `
      SELECT 
        al.*,
        u.username as user_name,
        au.username as admin_name
      FROM audit_log al
      LEFT JOIN users u ON al.user_id = u.user_id
      LEFT JOIN admin_users au ON al.admin_id = au.admin_id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (userType) {
      query += ' AND al.user_type = ?';
      params.push(userType);
    }
    
    if (actionCategory) {
      query += ' AND al.action_category = ?';
      params.push(actionCategory);
    }
    
    if (startDate) {
      query += ' AND al.timestamp >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND al.timestamp <= ?';
      params.push(endDate);
    }
    
   query += ` ORDER BY al.timestamp DESC LIMIT ${limit}`;
    params.push(parseInt(limit));
    
    const [logs] = await db.execute(query, params);
    
    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
};

exports.getUserActivityLog = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const query = `
      SELECT * FROM audit_log 
      WHERE user_id = ? 
      ORDER BY timestamp DESC 
      LIMIT 50
    `;
    
    const [logs] = await db.execute(query, [userId]);
    
    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user activity' });
  }
};

exports.getAuditStats = async (req, res) => {
  try {
    // Actions by category
    const [categoryStats] = await db.execute(`
      SELECT action_category, COUNT(*) as count
      FROM audit_log
      WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY action_category
    `);
    
    // Actions by day (last 7 days)
    const [dailyStats] = await db.execute(`
      SELECT DATE(timestamp) as date, COUNT(*) as count
      FROM audit_log
      WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(timestamp)
      ORDER BY date
    `);
    
    // Most active users
    const [activeUsers] = await db.execute(`
      SELECT u.username, COUNT(*) as action_count
      FROM audit_log al
      JOIN users u ON al.user_id = u.user_id
      WHERE al.timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY al.user_id
      ORDER BY action_count DESC
      LIMIT 10
    `);
    
    res.json({
      categoryStats,
      dailyStats,
      activeUsers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch audit stats' });
  }
};