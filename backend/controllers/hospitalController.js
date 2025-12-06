const db = require('../config/db');

exports.findNearestHospitals = async (req, res) => {
  try {
    const { latitude, longitude, specialty, limit = 5 } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }
    
    let query = `
      SELECT *, 
      (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance
      FROM hospitals
      WHERE is_active = 1
    `;
    
    const params = [latitude, longitude, latitude];
    
    if (specialty) {
      query += ' AND specialties LIKE ?';
      params.push(`%${specialty}%`);
    }
    
    query += ' ORDER BY distance LIMIT ?';
    params.push(parseInt(limit));
    
    const [hospitals] = await db.execute(query, params);
    
    res.json(hospitals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to find hospitals' });
  }
};

exports.getAllHospitals = async (req, res) => {
  try {
    const [hospitals] = await db.execute('SELECT * FROM hospitals WHERE is_active = 1 ORDER BY hospital_name');
    res.json(hospitals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch hospitals' });
  }
};

exports.getHospitalById = async (req, res) => {
  try {
    const { id } = req.params;
    const [hospitals] = await db.execute('SELECT * FROM hospitals WHERE hospital_id = ? AND is_active = 1', [id]);
    
    if (hospitals.length === 0) {
      return res.status(404).json({ error: 'Hospital not found' });
    }
    
    res.json(hospitals[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch hospital' });
  }
};