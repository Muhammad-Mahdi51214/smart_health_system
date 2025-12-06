import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os

os.makedirs('models', exist_ok=True)

# Load heart disease dataset
print("Loading heart disease dataset...")
df = pd.read_csv('heart.csv')

# Features and target
X = df.drop('target', axis=1)  # Assuming 'target' is the outcome column
y = df['target']

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42, stratify=y
)

# Train model
print("Training Heart Disease model...")
rf_model = RandomForestClassifier(
    n_estimators=150,
    max_depth=12,
    random_state=42
)

rf_model.fit(X_train, y_train)

# Evaluate
y_pred = rf_model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print(f"\n✅ Model Accuracy: {accuracy * 100:.2f}%")
print("\nClassification Report:")
print(classification_report(y_test, y_pred))

# Save model
joblib.dump(rf_model, 'models/heart_rf_model.pkl')
print("\n✅ Model saved to: models/heart_rf_model.pkl")