const db = require('../config/db');
const auditLogger = require('../middleware/auditLogger');

exports.submitMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    const userId = req.user ? req.user.id : null;
    
    const query = `
      INSERT INTO contact_messages (user_id, name, email, subject, message, status, priority) 
      VALUES (?, ?, ?, ?, ?, 'Pending', 'Medium')
    `;
    
    const [result] = await db.execute(query, [userId, name, email, subject, message]);
    
    // Log audit
    if (req.user) {
      await auditLogger.logUserAction(
        req, 
        'SUBMIT_CONTACT', 
        'CONTACT', 
        'contact_messages', 
        result.insertId, 
        `Contact message submitted: ${subject}`
      );
    }
    
    res.status(201).json({ 
      message: 'Message submitted successfully', 
      messageId: result.insertId 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit message' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const status = req.query.status || 'Pending';
    
    const query = `
      SELECT cm.*, u.username 
      FROM contact_messages cm 
      LEFT JOIN users u ON cm.user_id = u.user_id 
      WHERE cm.status = ? 
      ORDER BY cm.created_at DESC
    `;
    
    const [messages] = await db.execute(query, [status]);
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

exports.respondToMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { response, status } = req.body;
    const adminId = req.admin.id;
    
    const query = `
      UPDATE contact_messages 
      SET admin_response = ?, status = ?, responded_by = ?, responded_at = NOW() 
      WHERE message_id = ?
    `;
    
    await db.execute(query, [response, status, adminId, messageId]);
    
    // Log admin audit
    await auditLogger.logAdminAction(
      req, 
      'RESPOND_TO_CONTACT', 
      'CONTACT', 
      'contact_messages', 
      messageId, 
      `Admin responded to message #${messageId}`
    );
    
    res.json({ message: 'Response sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to respond to message' });
  }
};