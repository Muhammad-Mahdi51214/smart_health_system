const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db.js');
const auditLogger = require('../middleware/auditLogger.js');

exports.register = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, phone, city } = req.body;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user
    const query = `
      INSERT INTO users (username, email, password_hash, first_name, last_name, phone_number, city) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [
      username, email, hashedPassword, firstName, lastName, phone, city
    ]);
    
    // Log audit
    req.user = { id: result.insertId };
    await auditLogger.logUserAction(
      req, 
      'REGISTER', 
      'AUTH', 
      'users', 
      result.insertId, 
      `New user registered: ${username}`
    );
    
    res.status(201).json({ 
      message: 'User registered successfully', 
      userId: result.insertId 
    });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log(req.body)
    // Find user
    const [users] = await db.execute('SELECT * FROM users WHERE email = ? AND is_active = 1', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = users[0];
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate token
    const token = jwt.sign(
      { id: user.user_id, email: user.email }, 
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Log audit
    req.user = { id: user.user_id };
    await auditLogger.logUserAction(
      req, 
      'LOGIN', 
      'AUTH', 
      'users', 
      user.user_id, 
      `User logged in: ${user.username}`
    );
    
    res.json({ 
      message: 'Login successful', 
      token, 
      user: {
        id: user.user_id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        city: user.city,
        latitude: user.latitude,
        longitude: user.longitude
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [users] = await db.execute(
      'SELECT user_id, username, email, first_name, last_name, phone_number, city FROM users WHERE user_id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      console.log(error);
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(users[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};