import os, joblib, pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from ner_dataset import generate_training_data

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_FILE = os.path.join(MODEL_DIR, "model.joblib")

FEATURE_COLUMNS = ["slope_deg", "rainfall_24h_mm", "rainfall_72h_mm", "soil_moisture", "elevation_m", "lithology_code", "ndvi"]
RISK_LABELS = {
    0: "LOW (Normal)",
    1: "MODERATE (Advisory - Yellow)",
    2: "HIGH (Warning - Orange)",
    3: "SEVERE (Immediate Evacuation - Red)"
}

def train_and_save():
    df = generate_training_data(n_samples=4000, random_state=42)
    X, y = df[FEATURE_COLUMNS], df["landslide_risk_level"]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    rf_model = RandomForestClassifier(n_estimators=120, max_depth=12, min_samples_split=4, min_samples_leaf=2, random_state=42, n_jobs=-1)
    rf_model.fit(X_train, y_train)
    acc = accuracy_score(y_test, rf_model.predict(X_test))
    importances = pd.Series(rf_model.feature_importances_, index=FEATURE_COLUMNS).sort_values(ascending=False).to_dict()

    bundle = {
        "model": rf_model,
        "feature_names": FEATURE_COLUMNS,
        "risk_labels": RISK_LABELS,
        "accuracy": acc,
        "feature_importances": importances
    }
    joblib.dump(bundle, MODEL_FILE)
    print(f"✅ Random Forest model trained. Accuracy: {acc*100:.2f}%. Saved to {MODEL_FILE}")
    return bundle

if __name__ == "__main__":
    train_and_save()
