"""FastAPI Microservice for AI-Based Landslide Risk Prediction (NER India)"""
import os, joblib, pandas as pd
from typing import List
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from ner_dataset import NER_MONITORING_STATIONS
from train_model import train_and_save, MODEL_FILE, FEATURE_COLUMNS, RISK_LABELS

app = FastAPI(title="NER Landslide Early Warning ML Microservice")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

MODEL_BUNDLE = None

def get_model():
    global MODEL_BUNDLE
    if not MODEL_BUNDLE:
        if not os.path.exists(MODEL_FILE):
            train_and_save()
        MODEL_BUNDLE = joblib.load(MODEL_FILE)
    return MODEL_BUNDLE

@app.on_event("startup")
def startup_event():
    get_model()

class LandslidePredictionRequest(BaseModel):
    slope_deg: float = Field(..., example=38.5)
    rainfall_24h_mm: float = Field(..., example=145.0)
    rainfall_72h_mm: float = Field(..., example=260.0)
    soil_moisture: float = Field(..., example=0.82)
    elevation_m: float = Field(..., example=1430.0)
    lithology_code: int = Field(..., example=4)
    ndvi: float = Field(..., example=0.55)

class PredictionResult(BaseModel):
    risk_level: int
    risk_code: str
    risk_label: str
    risk_score_percentage: float
    confidence_probabilities: dict
    recommended_action: str
    factors_summary: List[str]

ACTIONS = [
    "🟢 GREEN (SAFE): Normal conditions. Continuous automated monitoring active.",
    "🟡 YELLOW ADVISORY: Moderate Susceptibility. Increase telemetry monitoring frequency.",
    "⚠️ ORANGE ALERT: High Landslide Probability. Issue SMS advisory to hill-slope residents.",
    "🚨 RED ALERT: Trigger Immediate Citizen Evacuation SMS. Mobilize SDRF/NDRF search & rescue."
]

LEVEL_CODES = ["LOW", "MODERATE", "HIGH", "SEVERE"]
COLOR_MAP = {0: "#10B981", 1: "#F59E0B", 2: "#F97316", 3: "#EF4444"}

@app.get("/")
def root():
    bundle = get_model()
    return {"service": "NER Landslide AI Risk Microservice", "status": "Online", "model": "Random Forest", "accuracy": f"{bundle.get('accuracy', 0.94) * 100:.2f}%"}

@app.get("/health")
def health():
    return {"status": "healthy", "model_loaded": MODEL_BUNDLE is not None}

@app.get("/feature-importance")
def feature_importance():
    return {"features": get_model().get("feature_importances", {})}

@app.post("/predict", response_model=PredictionResult)
def predict_landslide_risk(req: LandslidePredictionRequest):
    model = get_model()["model"]
    row = pd.DataFrame([req.dict()])[FEATURE_COLUMNS]
    pred_level = int(model.predict(row)[0])
    probs = model.predict_proba(row)[0]
    risk_score = round(min(100.0, max(0.0, sum(p * w for p, w in zip(probs, [5.0, 35.0, 70.0, 100.0])))), 1)

    drivers = []
    if req.rainfall_24h_mm > 100: drivers.append(f"Heavy 24h Rain: {req.rainfall_24h_mm} mm (Exceeds critical saturation)")
    if req.slope_deg > 35: drivers.append(f"Steep Slope Gradient: {req.slope_deg}° (High gravitational shear)")
    if req.soil_moisture > 0.75: drivers.append(f"High Pore Water Saturation: {int(req.soil_moisture * 100)}%")
    if req.lithology_code >= 4: drivers.append("Weak Fractured Bedrock / Weathered Shale")
    if req.ndvi < 0.45: drivers.append("Sparse Vegetation Cover / Reduced Root Cohesion")
    if not drivers: drivers.append("All geological and meteorological parameters within safe baseline limits.")

    return PredictionResult(
        risk_level=pred_level,
        risk_code=LEVEL_CODES[pred_level],
        risk_label=RISK_LABELS[pred_level],
        risk_score_percentage=risk_score,
        confidence_probabilities={"Low": round(float(probs[0]), 3), "Moderate": round(float(probs[1]), 3), "High": round(float(probs[2]), 3), "Severe": round(float(probs[3]), 3) if len(probs) > 3 else 0.0},
        recommended_action=ACTIONS[pred_level],
        factors_summary=drivers
    )

@app.get("/ner-risk-points")
def get_all_ner_risk_points(rainfall_multiplier: float = 1.0):
    model = get_model()["model"]
    results = []
    for st in NER_MONITORING_STATIONS:
        sim_24h = min(350.0, round(st.get("high_risk_threshold_mm", 120.0) * 0.45 * rainfall_multiplier, 1))
        sim_72h = min(600.0, round(sim_24h * 1.85, 1))
        sim_moisture = min(0.98, max(0.20, round(0.35 + (sim_72h / 500.0) * 0.55, 2)))
        row = pd.DataFrame([{"slope_deg": st["slope_deg"], "rainfall_24h_mm": sim_24h, "rainfall_72h_mm": sim_72h, "soil_moisture": sim_moisture, "elevation_m": st["elevation_m"], "lithology_code": st["lithology_code"], "ndvi": st["baseline_ndvi"]}])[FEATURE_COLUMNS]
        pred_level = int(model.predict(row)[0])
        probs = model.predict_proba(row)[0]
        score = round(min(100.0, max(0.0, sum(p * w for p, w in zip(probs, [5.0, 35.0, 70.0, 100.0])))), 1)
        results.append({
            "station_id": st["id"], "name": st["name"], "state": st["state"], "district": st["district"],
            "lat": st["lat"], "lng": st["lng"], "elevation_m": st["elevation_m"], "slope_deg": st["slope_deg"],
            "soil_type": st["soil_type"], "current_rainfall_24h_mm": sim_24h, "current_rainfall_72h_mm": sim_72h,
            "soil_moisture": sim_moisture, "risk_level": pred_level, "risk_code": LEVEL_CODES[pred_level],
            "risk_label": RISK_LABELS[pred_level], "risk_score_percentage": score, "color": COLOR_MAP[pred_level],
            "recommended_action": ACTIONS[pred_level]
        })
    return {"region": "North Eastern Region (NER) India", "station_count": len(results), "rainfall_simulation_multiplier": rainfall_multiplier, "stations": results}
