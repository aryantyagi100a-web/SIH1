"""
REAL landslide data for the NER states — GSI (Geological Survey of India).

What this file does, in one line:
    Downloads/loads real GSI landslide records → keeps the North-Eastern states →
    gives every event the 7 features our model needs → saves a CSV the trainer uses.

Where the real data comes from:
    GSI_Landslide_Inventory.parquet (30,842 real landslide records, India-wide).
    The copy used here is the open mirror hosted by bharatlas:
    https://bharatlas.com/view/gsi_landslide_inventory
    (original source: Geological Survey of India landslide inventory).

Which features are REAL for each event:
    - location (lat/lng)        : REAL, from GSI
    - state + district          : REAL, from GSI
    - lithology_code            : REAL-ish, converted from GSI's geology text
                                    (e.g. "Shale" -> weak rock -> code 4)
    - elevation_m               : REAL, fetched from the Open-Meteo elevation API
    - slope_deg / ndvi          : APPROXIMATE, taken from the nearest of our 12
                                    named monitoring stations (the GSI file has no
                                    slope/vegetation columns; a DEM would be the
                                    full upgrade path)
    - rainfall_24h/72h + soil   : ESTIMATED. The public GSI inventory only gives
                                    the EVENT YEAR, not the day, so we cannot fetch
                                    "the rain that fell that day". Instead we use
                                    each station's documented monsoon risk
                                    threshold (these are inventoried = they really
                                    happened under heavy rain) and model rain at
                                    ~0.85x / 1.55x of that threshold. This is a
                                    documented estimate, not fake "live" data.

Labels (risk level 0-3):
    Every real event really happened, so it is at least HIGH (2).
    If the GSI record lists deaths, we mark it SEVERE (3).
"""
import os
import re
import json
import math
import numpy as np
import pandas as pd
import requests

# ---------------------------------------------------------------------------
# Paths — everything this script creates lives in ml-service/data/
# ---------------------------------------------------------------------------
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
INVENTORY_PARQUET = os.path.join(DATA_DIR, "gsi_landslide_inventory.parquet")
RAW_EVENTS_CSV = os.path.join(DATA_DIR, "gsi_ner_events.csv")        # cleaned real events
FEATURED_CSV = os.path.join(DATA_DIR, "real_training_rows.csv")      # ready for training
ELEVATION_CACHE_JSON = os.path.join(DATA_DIR, "elevation_cache.json")

NER_STATES = ["Assam", "Meghalaya", "Arunachal Pradesh", "Sikkim",
              "Nagaland", "Manipur", "Mizoram", "Tripura"]

# 12 named monitoring stations (their slope/ndvi/threshold are used as proxies).
from ner_dataset import NER_MONITORING_STATIONS  # noqa: E402

ELEVATION_API = "https://api.open-meteo.com/v1/elevation"
MAX_EVENTS = 1500          # keep training balanced with the synthetic set
TARGET_HOLD = 400          # real events we set aside just for testing (in the trainer)
BATCH = 20                 # safe batch size for the elevation API (50 failed)


# ---------------------------------------------------------------------------
# Small helpers
# ---------------------------------------------------------------------------
def _haversine_km(lat1, lng1, lat2, lng2):
    """Straight-line distance between two coordinates, in kilometres."""
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lng2 - lng1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def _nearest_station(lat, lng):
    """Find the closest of our 12 monitoring stations to any real event."""
    return min(NER_MONITORING_STATIONS,
               key=lambda st: _haversine_km(lat, lng, st["lat"], st["lng"]))


def _geology_to_lithology(geology_text):
    """
    Turn GSI geology text into our 1-5 lithology code (1 = hard stable rock,
    5 = crushed/fractured weak rock). Simple keyword rules — good enough for a
    first version, and clearly better than guessing.
    """
    t = (geology_text or "").lower()
    if len(t.strip()) < 2:
        return None  # caller will fall back to the nearest station

    weak_words = ["shale", "mudstone", "siltstone", "phyllite", "schist", "coal",
                  "fireclay", "clay", "colluvium", "debris", "talus", "slate"]
    strong_words = ["granite", "basalt", "gneiss", "quartzite", "dolomite",
                    "limestone", "charnockite", "pegmatite"]

    has_weak = any(w in t for w in weak_words)
    has_strong = any(w in t for w in strong_words)
    degraded = any(w in t for w in ["weathered", "crushed", "fractured",
                                    "highly", "sheared", "soft"])

    code = 3                      # start neutral
    if has_weak:
        code = 4
    if has_strong and not has_weak:
        code = 2
    if degraded:
        code = min(5, code + 1)   # degraded rock is more dangerous, up to 5
    return code


def _extract_year(slide_no):
    """GSI slide numbers look like 'MEGH/SGH/78K12/2007/D-21' — pull out 2007."""
    m = re.search(r"(19|20)\d{2}", str(slide_no))
    return int(m.group(0)) if m else None


def _estimate_soil_moisture(rain72):
    """Same saturation curve used for the synthetic data + the live map."""
    raw = 0.15 + (rain72 / 500.0) * 0.7
    return round(min(0.98, max(0.2, raw)), 2)


def _estimate_rainfall(station):
    """
    The public GSI inventory gives the event YEAR only, so the day-level rain is
    unknown. These events really happened under monsoon rain, so we model rain at
    a fraction of the station's documented risk threshold (the amount that station
    considers "dangerous"). Honest estimate — documented in MODEL_REPORT.md.
    """
    threshold = float(station.get("high_risk_threshold_mm", 130.0))
    rain24 = round(threshold * 0.85, 1)
    rain72 = round(threshold * 1.55, 1)
    return {
        "rainfall_24h_mm": rain24,
        "rainfall_72h_mm": rain72,
        "soil_moisture": _estimate_soil_moisture(rain72)
    }


def _load_elevation_cache():
    if os.path.exists(ELEVATION_CACHE_JSON):
        with open(ELEVATION_CACHE_JSON) as f:
            return json.load(f)
    return {}


def _save_elevation_cache(cache):
    with open(ELEVATION_CACHE_JSON, "w") as f:
        json.dump(cache, f)


# ---------------------------------------------------------------------------
# Step 1 — prepare clean real events (NER states only)
# ---------------------------------------------------------------------------
def prepare_raw_events(force_refresh=False):
    """Filter the GSI inventory down to the 8 NER states and cache the result."""
    if os.path.exists(RAW_EVENTS_CSV) and not force_refresh:
        return pd.read_csv(RAW_EVENTS_CSV)

    df = pd.read_parquet(INVENTORY_PARQUET)
    ner = df[df["STATE"].isin(NER_STATES)].copy()

    ner = ner[ner["LATITUDE"].between(21, 30) & ner["LONGITUDE"].between(87, 98)]
    ner["year"] = ner["SLIDE_NO"].map(_extract_year)
    ner = ner[ner["year"].notna()]
    # Avoid counting the same spot many times (route-wise surveys repeat coords).
    ner = ner.drop_duplicates(subset=["LATITUDE", "LONGITUDE"])

    # Deaths -> SEVERE(3); all other real events -> HIGH(2). np.where keeps it simple.
    deaths = ner["PERSONS_DEATH"].astype(str).str.extract(r"(\d+)")[0].astype(float)
    ner["label"] = np.where(deaths.fillna(0) > 0, 3, 2)

    # Keep a balanced, state-representative slice so real data does not drown
    # out the synthetic set during training.
    counts = ner["STATE"].value_counts()
    picked = []
    for state, total in counts.items():
        target = max(5, round(MAX_EVENTS * total / len(ner)))
        state_df = ner[ner["STATE"] == state]
        n = min(len(state_df), target)
        picked.append(state_df.sample(n=n, random_state=42))
    ner = pd.concat(picked)

    out = ner[["SLIDE_NO", "STATE", "DISTRICT", "LATITUDE", "LONGITUDE",
               "GEOLOGY", "year", "label"]].rename(columns={
        "SLIDE_NO": "event_id", "STATE": "state", "DISTRICT": "district",
        "LATITUDE": "lat", "LONGITUDE": "lng", "GEOLOGY": "geology"})
    out = out.reset_index(drop=True)
    out.to_csv(RAW_EVENTS_CSV, index=False)
    print(f"[real_data] saved {len(out)} real NER events -> {RAW_EVENTS_CSV}")
    return out


# ---------------------------------------------------------------------------
# Step 2 — add elevation (REAL, Open-Meteo) and the rest of the features
# ---------------------------------------------------------------------------
def _fetch_elevation_batch(lats, lngs):
    url = (f"{ELEVATION_API}?latitude={','.join(map(str, lats))}"
           f"&longitude={','.join(map(str, lngs))}")
    resp = requests.get(url, timeout=15)
    resp.raise_for_status()
    return resp.json()["elevation"]


def fetch_all_elevations(events):
    """Fetch real elevation for every unique event coordinate (cached to disk)."""
    cache = _load_elevation_cache()
    keys = [f"{round(lat, 2)},{round(lng, 2)}" for lat, lng in zip(events["lat"], events["lng"])]
    missing = sorted({k for k in keys if k not in cache})
    print(f"[real_data] elevations: {len(keys) - len(missing)} cached, "
          f"{len(missing)} to fetch...")

    for i in range(0, len(missing), BATCH):
        chunk = missing[i:i + BATCH]
        ok = False
        for attempt in range(2):
            try:
                lats = [float(c.split(",")[0]) for c in chunk]
                lngs = [float(c.split(",")[1]) for c in chunk]
                elevations = _fetch_elevation_batch(lats, lngs)
                for c, e in zip(chunk, elevations):
                    cache[c] = e
                ok = True
                break
            except Exception:
                pass  # try again once, then leave the coords uncached for next run
        if not ok:
            print(f"[real_data] elevation fetch failed for {len(chunk)} coords "
                  f"(will retry next run / fall back to station elevation)")
    _save_elevation_cache(cache)
    return [cache.get(k) for k in keys]


def build_featured_rows(force_refresh=False):
    """Turn raw real events into training rows with all 7 model features."""
    if os.path.exists(FEATURED_CSV) and not force_refresh:
        return pd.read_csv(FEATURED_CSV)

    events = prepare_raw_events(force_refresh=force_refresh)
    elevations = fetch_all_elevations(events)

    rows = []
    for (_, ev), elevation in zip(events.iterrows(), elevations):
        station = _nearest_station(ev["lat"], ev["lng"])
        rainfall = _estimate_rainfall(station)
        lithology = _geology_to_lithology(ev["geology"]) or station["lithology_code"]

        rows.append({
            # model features
            "slope_deg": station["slope_deg"],
            "rainfall_24h_mm": rainfall["rainfall_24h_mm"],
            "rainfall_72h_mm": rainfall["rainfall_72h_mm"],
            "soil_moisture": rainfall["soil_moisture"],
            "elevation_m": round(elevation, 1) if elevation else station["elevation_m"],
            "lithology_code": lithology,
            "ndvi": station["baseline_ndvi"],
            "landslide_risk_level": int(ev["label"]),
            # provenance — kept so we can trace and audit every row
            "event_id": ev["event_id"], "state": ev["state"],
            "district": ev["district"], "lat": ev["lat"], "lng": ev["lng"],
            "year": int(ev["year"]), "data_source": "GSI_REAL"
        })

    out = pd.DataFrame(rows)
    out.to_csv(FEATURED_CSV, index=False)
    print(f"[real_data] saved {len(out)} real training rows -> {FEATURED_CSV}")
    return out


def load_real_training_rows():
    """The trainer calls this. Returns an empty frame if real data is missing,
    so training still works (synthetic only) on machines without the download."""
    if not os.path.exists(FEATURED_CSV):
        print("[real_data] WARNING: no real data cached — run build_featured_rows() "
              "once to download/enrich the GSI inventory, or train synthetic-only.")
        return pd.DataFrame()
    return pd.read_csv(FEATURED_CSV)


if __name__ == "__main__":
    build_featured_rows()
