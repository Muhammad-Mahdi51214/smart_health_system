
const db = require('../config/db');
const auditLogger = require('../middleware/auditLogger.js');
const mlService = require('../ml_service/mlService');


// Helper function to classify severity
function classifySeverity(disease, confidence, prediction) {

  if(prediction === 0) {
    return { level: 'Mild', emergency: false };
  }

  if (disease === 'diabetes' ) {
    if (confidence >= 0.75) return { level: 'Critical', emergency: true };
    if (confidence >= 0.50) return { level: 'Urgent', emergency: false };
    return { level: 'Mild', emergency: false };
  } else if (disease === 'heart_disease') {
    if (confidence >= 0.70) return { level: 'Critical', emergency: true };
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

    // ✅ CALL PYTHON THROUGH mlService (CLEAN)
    const result = await mlService.runPrediction('diabetes', [
      glucose, bmi, age, insulin, pregnancies, bloodPressure, skinThickness, dpf
    ]);
 console.log(result);
    const severity = classifySeverity('diabetes', result.confidence, result.prediction);
    const recommendations = getRecommendations('diabetes', severity.level);

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

    const diabetesQuery = `
      INSERT INTO diabetes_records 
      (prediction_id, glucose_level, bmi, age, insulin_level, pregnancies, blood_pressure, skin_thickness, diabetes_pedigree_function) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.execute(diabetesQuery, [
      predictionId, glucose, bmi, age, insulin, pregnancies, bloodPressure, skinThickness, dpf
    ]);

    let nearbyHospitals = [];
    if (severity.emergency) {
      const [hospitals] = await db.execute(`
        SELECT *
        FROM hospitals
        WHERE (specialties LIKE '%Endocrinology%' OR specialties LIKE '%Diabetes%')
        AND is_active = 1
        AND emergency_services = 1
        LIMIT 5
      `);

      nearbyHospitals = hospitals;

      if (hospitals.length > 0) {
        await db.execute(
          'UPDATE predictions SET recommended_hospital_id = ? WHERE prediction_id = ?',
          [hospitals[0].hospital_id, predictionId]
        );
      }
    }

    await auditLogger.logUserAction(
      req,
      'DIABETES_PREDICTION',
      'PREDICTION',
      'predictions',
      predictionId,
      `Diabetes prediction made - ${predictionResult}`
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

    const result = await mlService.runPrediction('heart', [
      age, sex, cp, trestbps, chol, fbs, restecg, thalach, exang, oldpeak, slope, ca, thal
    ]);
    console.log(result);
    const severity = classifySeverity('heart_disease', result.confidence,result.prediction);
    const recommendations = getRecommendations('heart_disease', severity.level);

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

    let nearbyHospitals = [];
    if (severity.emergency) {
      const [hospitals] = await db.execute(`
        SELECT *
        FROM hospitals
        WHERE specialties LIKE '%Cardiology%'
        AND is_active = 1
        AND emergency_services = 1
        LIMIT 5
      `);

      nearbyHospitals = hospitals;
    }

    await auditLogger.logUserAction(
      req,
      'HEART_PREDICTION',
      'PREDICTION',
      'predictions',
      predictionId,
      `Heart prediction made - ${predictionResult}`
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