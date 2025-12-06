const db = require('../config/db');

const auditLogger = {
  // Log user action
  logUserAction: async (req, actionType, actionCategory, entityType = null, entityId = null, description = '') => {
    try {
      const userId = req.user ? req.user.id : null;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('user-agent');
      const method = req.method;
      const url = req.originalUrl;
      
      const query = `
        INSERT INTO audit_log 
        (user_id, user_type, action_type, action_category, entity_type, entity_id, 
         description, ip_address, user_agent, request_method, request_url, timestamp) 
        VALUES (?, 'user', ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;
      
      await db.execute(query, [
        userId, 
        actionType, 
        actionCategory, 
        entityType, 
        entityId, 
        description, 
        ipAddress, 
        userAgent, 
        method, 
        url
      ]);
      
      console.log(`✅ Audit log created: ${actionType} by user ${userId}`);
    } catch (error) {
      console.error('❌ Audit logging failed:', error);
    }
  },

  // Log admin action
  logAdminAction: async (req, actionType, actionCategory, entityType = null, entityId = null, description = '') => {
    try {
      const adminId = req.admin ? req.admin.id : null;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('user-agent');
      const method = req.method;
      const url = req.originalUrl;
      
      const query = `
        INSERT INTO audit_log 
        (admin_id, user_type, action_type, action_category, entity_type, entity_id, 
         description, ip_address, user_agent, request_method, request_url, timestamp) 
        VALUES (?, 'admin', ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;
      
      await db.execute(query, [
        adminId, 
        actionType, 
        actionCategory, 
        entityType, 
        entityId, 
        description, 
        ipAddress, 
        userAgent, 
        method, 
        url
      ]);
      
      console.log(`✅ Admin audit log created: ${actionType} by admin ${adminId}`);
    } catch (error) {
      console.error('❌ Admin audit logging failed:', error);
    }
  }
};

module.exports = auditLogger;