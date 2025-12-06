import sys
import json
import joblib
import numpy as np
import os

def classify_severity(disease, confidence, prediction):
    """Classify severity based on disease type and confidence, only if prediction is positive"""
    if prediction != 1:
        return 'Mild', False  # Negative result is always Mild

    if disease == 'diabetes':
        if confidence >= 0.75:
            return 'Critical', True
        elif confidence >= 0.50:
            return 'Urgent', False
        else:
            return 'Mild', False
    elif disease == 'heart':
        if confidence >= 0.70:
            return 'Critical', True
        elif confidence >= 0.50:
            return 'Urgent', True
        else:
            return 'Mild', False

    return 'Mild', False


def predict_disease(disease_type, features):
    """Load model and make prediction"""
    try:
        # Get absolute path to this script
        BASE_DIR = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(BASE_DIR, 'models', f'{disease_type}_rf_model.pkl')

        if not os.path.exists(model_path):
            return {
                'error': f'Model not found: {model_path}',
                'prediction': 0,
                'confidence': 0.5
            }

        # Load model
        model = joblib.load(model_path)

        # Convert features to numpy array and reshape correctly
        features_array = np.array([features], dtype=float)

        # Make prediction
        prediction = model.predict(features_array)[0]

        # Get confidence (probability)
        try:
            probabilities = model.predict_proba(features_array)[0]
            confidence = float(max(probabilities))
        except:
            # Fallback if model does not support predict_proba
            confidence = 0.7 if prediction == 1 else 0.3

        # Classify severity
        severity, emergency = classify_severity(disease_type, confidence,prediction)

        # Ensure severity is not "Urgent" if prediction is negative
        if prediction == 0:
            severity, emergency = 'Mild', False

        return {
            'prediction': int(prediction),
            'confidence': float(confidence),
            'severity': severity,
            'emergency_required': emergency,
            'risk_percentage': float(confidence * 100)
        }

    except Exception as e:
        return {
            'error': str(e),
            'prediction': 0,
            'confidence': 0.5
        }

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print(json.dumps({'error': 'Missing arguments'}))
        sys.exit(1)

    disease_type = sys.argv[1]
    features = [float(x) for x in sys.argv[2:]]

    result = predict_disease(disease_type, features)
    print(json.dumps(result))
