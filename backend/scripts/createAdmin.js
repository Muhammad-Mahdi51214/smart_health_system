const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function createAdmin() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'smart_health_system'
  });
  
  const hashedPassword = await bcrypt.hash('Admin@123', 10);
  
  const query = `
    INSERT INTO admin_users (username, email, password_hash, role, permissions) 
    VALUES (?, ?, ?, ?, ?)
  `;
  
  const permissions = {
    users: ['view', 'edit', 'delete'],
    hospitals: ['view', 'edit', 'add'],
    messages: ['view', 'respond'],
    predictions: ['view'],
    audit: ['view']
  };
  
  await connection.execute(query, [
    'admin',
    'admin@smarthealthsystem.com',
    hashedPassword,
    'super_admin',
    JSON.stringify(permissions)
  ]);
  
  console.log('✅ Admin user created successfully!');
  console.log('Email: admin@smarthealthsystem.com');
  console.log('Password: Admin@123');
  
  connection.end();
}

createAdmin().catch(console.error);