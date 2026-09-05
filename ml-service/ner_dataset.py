"""
Geospatial Data & Training Dataset Generator for North Eastern Region (NER)
States covered: Assam, Meghalaya, Arunachal Pradesh, Sikkim, Nagaland, Manipur, Mizoram, Tripura
"""
import numpy as np
import pandas as pd

# High-risk landslide zones across all 8 NER states
NER_MONITORING_STATIONS = [
    {
        "id": "NER-MEGH-01",
        "name": "Cherrapunji (Sohra)",
        "state": "Meghalaya",
        "district": "East Khasi Hills",
        "lat": 25.2986,
        "lng": 91.5822,
        "elevation_m": 1430,
        "slope_deg": 38.5,
        "soil_type": "Clayey Sand over Sandstone",
        "lithology_code": 3,
        "baseline_ndvi": 0.65,
        "high_risk_threshold_mm": 180.0
    },
    {
        "id": "NER-SIKK-01",
        "name": "Gangtok - Deorali Slopes",
        "state": "Sikkim",
        "district": "East Sikkim",
        "lat": 27.3389,
        "lng": 88.6065,
        "elevation_m": 1650,
        "slope_deg": 42.0,
        "soil_type": "Phyllites & Schists (Gneissic)",
        "lithology_code": 4,
        "baseline_ndvi": 0.58,
        "high_risk_threshold_mm": 140.0
    },
    {
        "id": "NER-MIZO-01",
        "name": "Aizawl (Ramhlun / Hunthar)",
        "state": "Mizoram",
        "district": "Aizawl",
        "lat": 23.7271,
        "lng": 92.7176,
        "elevation_m": 1132,
        "slope_deg": 36.2,
        "soil_type": "Shale & Siltstone Bedrock",
        "lithology_code": 4,
        "baseline_ndvi": 0.52,
        "high_risk_threshold_mm": 130.0
    },
    {
        "id": "NER-NAGA-01",
        "name": "Kohima - Zubza Corridor",
        "state": "Nagaland",
        "district": "Kohima",
        "lat": 25.6751,
        "lng": 94.1086,
        "elevation_m": 1444,
        "slope_deg": 34.8,
        "soil_type": "Disang Shale / Weathered Mudstone",
        "lithology_code": 4,
        "baseline_ndvi": 0.61,
        "high_risk_threshold_mm": 125.0
    },
    {
        "id": "NER-ARUN-01",
        "name": "Itanagar - Papum Pare Hills",
        "state": "Arunachal Pradesh",
        "district": "Papum Pare",
        "lat": 27.0844,
        "lng": 93.6053,
        "elevation_m": 750,
        "slope_deg": 31.4,
        "soil_type": "Siwalik Sediments (Unconsolidated)",
        "lithology_code": 3,
        "baseline_ndvi": 0.72,
        "high_risk_threshold_mm": 150.0
    },
    {
        "id": "NER-ARUN-02",
        "name": "Tawang Mountain Pass",
        "state": "Arunachal Pradesh",
        "district": "Tawang",
        "lat": 27.5861,
        "lng": 91.8594,
        "elevation_m": 3048,
        "slope_deg": 46.0,
        "soil_type": "High Altitude Granitic Gneiss",
        "lithology_code": 5,
        "baseline_ndvi": 0.40,
        "high_risk_threshold_mm": 110.0
    },
    {
        "id": "NER-ASSA-01",
        "name": "Haflong - Dima Hasao Hill Slopes",
        "state": "Assam",
        "district": "Dima Hasao",
        "lat": 25.1762,
        "lng": 93.0189,
        "elevation_m": 512,
        "slope_deg": 28.5,
        "soil_type": "Tertiary Sandstones & Shale",
        "lithology_code": 3,
        "baseline_ndvi": 0.68,
        "high_risk_threshold_mm": 160.0
    },
    {
        "id": "NER-ASSA-02",
        "name": "Guwahati - Kamakhya Foothills",
        "state": "Assam",
        "district": "Kamrup Metropolitan",
        "lat": 26.1445,
        "lng": 91.7362,
        "elevation_m": 120,
        "slope_deg": 22.0,
        "soil_type": "Red Loamy Soil over Granite",
        "lithology_code": 2,
        "baseline_ndvi": 0.48,
        "high_risk_threshold_mm": 170.0
    },
    {
        "id": "NER-MANI-01",
        "name": "Imphal - Noney Railway Sector",
        "state": "Manipur",
        "district": "Noney",
        "lat": 24.8167,
        "lng": 93.6000,
        "elevation_m": 880,
        "slope_deg": 35.0,
        "soil_type": "Fractured Shale Formations",
        "lithology_code": 4,
        "baseline_ndvi": 0.55,
        "high_risk_threshold_mm": 120.0
    },
    {
        "id": "NER-TRIP-01",
        "name": "Jampui Hills - North Tripura",
        "state": "Tripura",
        "district": "North Tripura",
        "lat": 23.9500,
        "lng": 92.2667,
        "elevation_m": 930,
        "slope_deg": 24.5,
        "soil_type": "Sandy Clay Loam",
        "lithology_code": 2,
        "baseline_ndvi": 0.70,
        "high_risk_threshold_mm": 175.0
    },
    {
        "id": "NER-MEGH-02",
        "name": "Shillong Peak & Bypass",
        "state": "Meghalaya",
        "district": "East Khasi Hills",
        "lat": 25.5788,
        "lng": 91.8933,
        "elevation_m": 1961,
        "slope_deg": 32.0,
        "soil_type": "Quartzites & Metasediments",
        "lithology_code": 3,
        "baseline_ndvi": 0.63,
        "high_risk_threshold_mm": 165.0
    },
    {
        "id": "NER-SIKK-02",
        "name": "Mangan - North Sikkim Highway",
        "state": "Sikkim",
        "district": "North Sikkim",
        "lat": 27.5050,
        "lng": 88.5288,
        "elevation_m": 1310,
        "slope_deg": 44.5,
        "soil_type": "Highly Crushed Gneiss",
        "lithology_code": 5,
        "baseline_ndvi": 0.50,
        "high_risk_threshold_mm": 115.0
    }
]


def generate_training_data(n_samples: int = 3500, random_state: int = 42) -> pd.DataFrame:
    """
    Generates a realistic synthetic training dataset based on hydrological and geomorphological
    thresholds observed in the North Eastern Himalayan landslide inventory.
    """
    np.random.seed(random_state)
    
    # 1. Slope angle (degrees: 5° to 60°)
    slope = np.random.uniform(5.0, 58.0, n_samples)
    
    # 2. Cumulative 24-hour rainfall (mm: 0 to 350mm)
    rainfall_24h = np.random.exponential(scale=45.0, size=n_samples)
    rainfall_24h = np.clip(rainfall_24h, 0.0, 380.0)
    
    # 3. Cumulative 72-hour antecedent rainfall (mm: rainfall_24h up to 600mm)
    rainfall_72h = rainfall_24h + np.random.exponential(scale=65.0, size=n_samples)
    rainfall_72h = np.clip(rainfall_72h, rainfall_24h, 700.0)
    
    # 4. Soil moisture index (0.0 = bone dry, 1.0 = fully saturated)
    # Soil moisture correlates with 72h rainfall and soil drainage
    soil_moisture = np.clip(
        0.15 + (rainfall_72h / 500.0) * 0.7 + np.random.normal(0, 0.05, n_samples),
        0.05, 0.99
    )
    
    # 5. Elevation (meters: 80m up to 3500m)
    elevation = np.random.uniform(80.0, 3400.0, n_samples)
    
    # 6. Lithology susceptibility code (1: Hard Granite/Stable, 5: Crushed Fractured Shale/Highly Unstable)
    lithology = np.random.choice([1, 2, 3, 4, 5], size=n_samples, p=[0.15, 0.25, 0.30, 0.20, 0.10])
    
    # 7. NDVI (Normalized Difference Vegetation Index: 0.1 to 0.85). Higher vegetation = stronger root cohesion
    ndvi = np.random.uniform(0.15, 0.85, n_samples)
    
    # Landslide Physics Risk Function:
    # Trigger factor: Rainfall + Soil Saturation
    # Susceptibility factor: Slope steepness + Lithology weakness - Root cohesion (NDVI)
    trigger_score = (
        (rainfall_24h / 150.0) * 35.0 +
        (rainfall_72h / 350.0) * 20.0 +
        (soil_moisture ** 2) * 25.0
    )
    
    terrain_factor = (
        (slope / 50.0) * 30.0 +
        (lithology / 5.0) * 15.0 -
        (ndvi * 15.0) +
        (elevation / 3000.0) * 5.0
    )
    
    combined_score = trigger_score + terrain_factor + np.random.normal(0, 4.0, n_samples)
    
    # Assign labels:
    # 0 = Low Risk (Safe)
    # 1 = Moderate Risk (Advisory / Yellow)
    # 2 = High Risk (Warning / Orange)
    # 3 = Severe Risk (Immediate Evacuation / Red)
    labels = np.zeros(n_samples, dtype=int)
    labels[combined_score >= 35.0] = 1
    labels[combined_score >= 55.0] = 2
    labels[combined_score >= 75.0] = 3
    
    df = pd.DataFrame({
        "slope_deg": slope.round(1),
        "rainfall_24h_mm": rainfall_24h.round(1),
        "rainfall_72h_mm": rainfall_72h.round(1),
        "soil_moisture": soil_moisture.round(3),
        "elevation_m": elevation.round(1),
        "lithology_code": lithology,
        "ndvi": ndvi.round(3),
        "landslide_risk_level": labels
    })
    
    return df
