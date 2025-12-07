const { spawn } = require('child_process');
const db = require('../config/db');
const auditLogger = require('../middleware/auditLogger.js');

// Helper function to classify severity
function classifySeverity(disease, confidence) {
  if (disease === 'diabetes') {
    if (confidence >= 0.75) return { level: 'Critical', emergency: true };
    if (confidence >= 0.50) return { level: 'Urgent', emergency: false };
    return { level: 'Mild', emergency: false };
  } else if (disease === 'heart_disease') {
    if (confidence >= 0.70) return { level: 'Critical', emergency: true };
    if (confidence >= 0.50) return { level: 'Urgent', emergency: true };
    return { level: 'Mild', emergency: false };
  } else if (disease === 'dengue') {
    if (confidence >= 0.70) return { level: 'Critical', emergency: true };
    if (confidence >= 0.50) return { level: 'Urgent', emergency: false };
    return { level: 'Mild', emergency: false };
  } else if (disease === 'breast_cancer') {
    if (confidence >= 0.75) return { level: 'Critical', emergency: true };
    if (confidence >= 0.50) return { level: 'Urgent', emergency: true };
    return { level: 'Mild', emergency: false };
  }
  return { level: 'Mild', emergency: false };
}

// Helper function to get recommendations
function getRecommendations(disease, severity) {
  const recommendations = {
    diabetes: {
      Critical: 'Immediate medical attention required. Visit endocrinologist within 24 hours.',
      Urgent: 'Schedule appointment with endocrinologist within 3-5 days. Monitor blood sugar levels.',
      Mild: 'Maintain healthy diet and exercise. Schedule routine checkup.'
    },
    heart_disease: {
      Critical: 'EMERGENCY: Visit nearest hospital immediately. Call emergency services.',
      Urgent: 'See cardiologist within 24-48 hours. Avoid strenuous activity.',
      Mild: 'Schedule cardiology consultation. Maintain heart-healthy lifestyle.'
    }
  };
  
  return recommendations[disease][severity] || 'Consult with healthcare provider.';
}

// Diabetes Prediction
exports.predictDiabetes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { glucose, bmi, age, insulin, pregnancies, bloodPressure, skinThickness, dpf } = req.body;
    
    // Call Python ML model
    const python = spawn('python', [
      'ml_service/predict.py',
      'diabetes',
      glucose, bmi, age, insulin, pregnancies, bloodPressure, skinThickness, dpf
    ]);
    
    let resultData = '';
    let errorData = '';
    
    python.stdout.on('data', (data) => {
      resultData += data.toString();
    });
    
    python.stderr.on('data', (data) => {
      errorData += data.toString();
    });
    
    python.on('close', async (code) => {
      if (code !== 0) {
        console.error('Python error:', errorData);
        return res.status(500).json({ error: 'Prediction failed' });
      }
      
      try {
        const result = JSON.parse(resultData);
        const severity = classifySeverity('diabetes', result.confidence);
        const recommendations = getRecommendations('diabetes', severity.level);
        
        // Save prediction to database
        const predictionQuery = `
          INSERT INTO predictions 
          (user_id, disease_type_id, prediction_result, confidence_score, risk_percentage, severity_level, emergency_required, ml_model_version, recommendations) 
          VALUES (?, 1, ?, ?, ?, ?, ?, 'v1.0', ?)
        `;
        
        const predictionResult = result.prediction === 1 ? 'Positive' : 'Negative';
        const riskPercentage = result.confidence * 100;
        
        const [predictionInsert] = await db.execute(predictionQuery, [
          userId,
          predictionResult,
          result.confidence,
          riskPercentage,
          severity.level,
          severity.emergency,
          recommendations
        ]);
        
        const predictionId = predictionInsert.insertId;
        
        // Save diabetes-specific data
        const diabetesQuery = `
          INSERT INTO diabetes_records 
          (prediction_id, glucose_level, bmi, age, insulin_level, pregnancies, blood_pressure, skin_thickness, diabetes_pedigree_function) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        await db.execute(diabetesQuery, [
          predictionId, glucose, bmi, age, insulin, pregnancies, bloodPressure, skinThickness, dpf
        ]);
        
        // Find nearest hospitals if critical/urgent
        let nearbyHospitals = [];
        if (severity.emergency) {
          try {
            const hospitalQuery = `
              SELECT *
              FROM hospitals
              WHERE (specialties LIKE '%Endocrinology%' OR specialties LIKE '%Diabetes%') AND is_active = 1 AND emergency_services = 1
              LIMIT 5
            `;
            
            const [hospitals] = await db.execute(hospitalQuery);
            
            nearbyHospitals = hospitals;
            
            // Update recommended hospital
            if (hospitals.length > 0) {
              await db.execute(
                'UPDATE predictions SET recommended_hospital_id = ? WHERE prediction_id = ?',
                [hospitals[0].hospital_id, predictionId]
              );
            }
          } catch (err) {
            console.log('Hospital search unavailable:', err.message);
            nearbyHospitals = [];
          }
        }
        
        // Log audit
        await auditLogger.logUserAction(
          req, 
          'DIABETES_PREDICTION', 
          'PREDICTION', 
          'predictions', 
          predictionId, 
          `Diabetes prediction made - Result: ${predictionResult}, Confidence: ${(result.confidence * 100).toFixed(2)}%`
        );
        
        res.json({
          predictionId,
          prediction: predictionResult,
          confidence: result.confidence,
          riskPercentage: riskPercentage.toFixed(2),
          severity: severity.level,
          emergencyRequired: severity.emergency,
          recommendations,
          nearbyHospitals
        });
      } catch (parseError) {
        console.error('Parse error:', parseError);
        res.status(500).json({ error: 'Failed to parse prediction result' });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Prediction failed' });
  }
};

// Heart Disease Prediction
exports.predictHeart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { age, sex, cp, trestbps, chol, fbs, restecg, thalach, exang, oldpeak, slope, ca, thal } = req.body;
    
    const python = spawn('python', [
      'ml_service/predict.py',
      'heart',
      age, sex, cp, trestbps, chol, fbs, restecg, thalach, exang, oldpeak, slope, ca, thal
    ]);
    
    let resultData = '';
    
    python.stdout.on('data', (data) => {
      resultData += data.toString();
    });
    
    python.on('close', async (code) => {
      if (code !== 0) {
        return res.status(500).json({ error: 'Prediction failed' });
      }
      
      const result = JSON.parse(resultData);
      const severity = classifySeverity('heart_disease', result.confidence);
      const recommendations = getRecommendations('heart_disease', severity.level);
      
      // Save to database (similar to diabetes)
      const predictionQuery = `
        INSERT INTO predictions 
        (user_id, disease_type_id, prediction_result, confidence_score, risk_percentage, severity_level, emergency_required, ml_model_version, recommendations) 
        VALUES (?, 2, ?, ?, ?, ?, ?, 'v1.0', ?)
      `;
      
      const predictionResult = result.prediction === 1 ? 'Positive' : 'Negative';
      const riskPercentage = result.confidence * 100;
      
      const [predictionInsert] = await db.execute(predictionQuery, [
        userId, predictionResult, result.confidence, riskPercentage, severity.level, severity.emergency, recommendations
      ]);
      
      const predictionId = predictionInsert.insertId;
      
      // Save heart-specific data
      const heartQuery = `
        INSERT INTO heart_disease_records 
        (prediction_id, age, sex, chest_pain_type, resting_blood_pressure, cholesterol, fasting_blood_sugar, 
         resting_ecg, max_heart_rate, exercise_induced_angina, st_depression, slope_of_st, num_major_vessels, thalassemia) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const chestPainType = ['Typical Angina', 'Atypical Angina', 'Non-anginal Pain', 'Asymptomatic'][cp] || 'Asymptomatic';
      const restingEcg = ['Normal', 'ST-T Abnormality', 'LV Hypertrophy'][restecg] || 'Normal';
      const slopeOfSt = ['Upsloping', 'Flat', 'Downsloping'][slope] || 'Flat';
      const thalassemiaType = ['Normal', 'Fixed Defect', 'Reversible Defect'][thal] || 'Normal';
      
      await db.execute(heartQuery, [
        predictionId, age, sex, chestPainType, trestbps, chol, fbs, restingEcg, 
        thalach, exang, oldpeak, slopeOfSt, ca, thalassemiaType
      ]);
      
      // Find nearest hospitals
      let nearbyHospitals = [];
      if (severity.emergency) {
        const [user] = await db.execute('SELECT latitude, longitude FROM users WHERE user_id = ?', [userId]);
        
        if (user.length > 0 && user[0].latitude && user[0].longitude) {
          const [hospitals] = await db.execute(`
            SELECT *, 
            (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance
            FROM hospitals
            WHERE specialties LIKE '%Cardiology%' AND is_active = 1
            ORDER BY distance
            LIMIT 5
          `, [user[0].latitude, user[0].longitude, user[0].latitude]);
          
          nearbyHospitals = hospitals;
        }
      }
      
      // Log audit
      await auditLogger.logUserAction(req, 'HEART_PREDICTION', 'PREDICTION', 'predictions', predictionId, 
        `Heart disease prediction made - Result: ${predictionResult}`);
      
      res.json({
        predictionId,
        prediction: predictionResult,
        confidence: result.confidence,
        riskPercentage: riskPercentage.toFixed(2),
        severity: severity.level,
        emergencyRequired: severity.emergency,
        recommendations,
        nearbyHospitals
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Prediction failed' });
  }
};

// Get Prediction History
exports.getPredictionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const query = `
      SELECT 
        p.*,
        dt.disease_name,
        h.hospital_name,
        h.address as hospital_address
      FROM predictions p
      JOIN disease_types dt ON p.disease_type_id = dt.disease_type_id
      LEFT JOIN hospitals h ON p.recommended_hospital_id = h.hospital_id
      WHERE p.user_id = ?
      ORDER BY p.prediction_date DESC
      LIMIT 50
    `;
    
    const [predictions] = await db.execute(query, [userId]);
    
    res.json(predictions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch prediction history' });
  }
};