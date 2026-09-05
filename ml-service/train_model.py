"""
Trains the landslide Random Forest model.

Two models are trained so we can honestly compare them:
  A. synthetic_only  -> trained ONLY on invented (synthetic) data   (the old baseline)
  B. hybrid          -> trained on synthetic data PLUS real GSI landslide events
                        from the North-Eastern states (see real_data.py)

Both models are tested on the SAME held-out real events (real landslides the model
never saw), which is the honest way to answer "how well does this actually work?".

The deployed model (model.joblib) is the HYBRID one.
"""
import os
import json
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, recall_score
from ner_dataset import generate_training_data
from real_data import load_real_training_rows

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_FILE = os.path.join(MODEL_DIR, "model.joblib")                # deployed = hybrid
MODEL_SYNTHETIC_FILE = os.path.join(MODEL_DIR, "model_synthetic.joblib")  # baseline, kept for comparison
COMPARISON_JSON = os.path.join(MODEL_DIR, "data", "training_comparison.json")

FEATURE_COLUMNS = ["slope_deg", "rainfall_24h_mm", "rainfall_72h_mm", "soil_moisture",
                   "elevation_m", "lithology_code", "ndvi"]
RISK_LABELS = {
    0: "LOW (Normal)",
    1: "MODERATE (Advisory - Yellow)",
    2: "HIGH (Warning - Orange)",
    3: "SEVERE (Immediate Evacuation - Red)"
}


def _build_rf():
    """One Random Forest builder shared by both models."""
    return RandomForestClassifier(n_estimators=120, max_depth=12,
                                  min_samples_split=4, min_samples_leaf=2,
                                  random_state=42, n_jobs=-1)


def _evaluate(model, X, y_true):
    """Accuracy, recall and over-alert stats for a model on any test set."""
    y_pred = model.predict(X)
    acc = accuracy_score(y_true, y_pred)
    # macro recall averages recall over the classes that actually exist in y_true
    macro_recall = recall_score(y_true, y_pred, average="macro", zero_division=0)
    return {
        "accuracy": round(float(acc), 4),
        "macro_recall": round(float(macro_recall), 4),
        "flagged_high_or_severe_rate": round(float((y_pred >= 2).mean()), 4),
        "severe_recall": round(float(recall_score(y_true, y_pred, labels=[3],
                                                  average=None, zero_division=0)[0]), 4),
        "n": int(len(y_true))
    }


def _save_bundle(model, accuracy, extra):
    """A model bundle has the exact keys main.py already expects, plus new ones."""
    bundle = {
        "model": model,
        "feature_names": FEATURE_COLUMNS,
        "risk_labels": RISK_LABELS,
        "accuracy": accuracy,
        "feature_importances": pd.Series(model.feature_importances_,
                                         index=FEATURE_COLUMNS).sort_values(
                                             ascending=False).to_dict(),
        **extra
    }
    return bundle


def train_and_save():
    """Train hybrid + synthetic-only models, print the comparison, save both."""
    # ------------------------------------------------------------------
    # 1. Synthetic data (unchanged from the old baseline)
    # ------------------------------------------------------------------
    synth = generate_training_data(n_samples=4000, random_state=42)
    Xs, ys = synth[FEATURE_COLUMNS], synth["landslide_risk_level"]
    Xs_train, Xs_test, ys_train, ys_test = train_test_split(
        Xs, ys, test_size=0.15, random_state=42, stratify=ys)

    # ------------------------------------------------------------------
    # 2. Real GSI data (from real_data.py) — a holdout is set aside FIRST
    # ------------------------------------------------------------------
    real = load_real_training_rows()
    use_real = len(real) >= 30
    real_train, real_test = None, None
    if use_real:
        Xr, yr = real[FEATURE_COLUMNS], real["landslide_risk_level"]
        Xr_train, Xr_test, yr_train, yr_test = train_test_split(
            Xr, yr, test_size=0.30, random_state=42)
        real_train = (Xr_train, yr_train)
        real_test = (Xr_test, yr_test)
        print(f"[train] real rows: {len(real)} | train: {len(Xr_train)} | "
              f"holdout test: {len(Xr_test)}")
        print(f"[train] real holdout label mix: "
              f"{yr_test.value_counts().sort_index().to_dict()}")

    # ------------------------------------------------------------------
    # 3. Model A — synthetic only (old baseline)
    # ------------------------------------------------------------------
    print("\n--- training synthetic-only model (old baseline) ---")
    model_synth = _build_rf()
    model_synth.fit(Xs_train, ys_train)
    evals_a = {
        "synthetic_test": _evaluate(model_synth, Xs_test, ys_test),
        "real_test": _evaluate(model_synth, Xr_test, yr_test) if use_real else None
    }

    # ------------------------------------------------------------------
    # 4. Model B — hybrid (synthetic + real GSI events)
    # ------------------------------------------------------------------
    print("--- training hybrid model (synthetic + real GSI) ---")
    Xh_train = Xs_train
    yh_train = ys_train
    if use_real:
        Xh_train = pd.concat([Xs_train, real_train[0]], ignore_index=True)
        yh_train = pd.concat([ys_train, real_train[1]], ignore_index=True)
    model_hybrid = _build_rf()
    model_hybrid.fit(Xh_train, yh_train)
    evals_b = {
        "synthetic_test": _evaluate(model_hybrid, Xs_test, ys_test),
        "real_test": _evaluate(model_hybrid, Xr_test, yr_test) if use_real else None
    }

    # ------------------------------------------------------------------
    # 5. Print the comparison table
    # ------------------------------------------------------------------
    def cell(e, key):
        if e is None:
            return "n/a"
        return f"{e[key] * 100:.1f}%"

    rows = [
        ("synthetic test accuracy", "synthetic_test", "accuracy"),
        ("REAL GSI holdout — exact-match accuracy", "real_test", "accuracy"),
        ("REAL GSI holdout — macro recall", "real_test", "macro_recall"),
        ("REAL GSI holdout — SEVERE(3) recall", "real_test", "severe_recall"),
        ("REAL GSI holdout — flagged HIGH/SEVERE", "real_test", "flagged_high_or_severe_rate"),
    ]

    print("\n==============================================================")
    print("REAL vs SYNTHETIC DATA — MODEL COMPARISON (same test sets)")
    print("==============================================================")
    print(f"{'metric':<40} {'A: synthetic-only':<20} B: hybrid")
    print("-" * 78)
    for label, test_key, metric_key in rows:
        a, b = evals_a[test_key], evals_b[test_key]
        print(f"{label:<40} {cell(a, metric_key):<20} {cell(b, metric_key)}")
    print("==============================================================\n")

    # ------------------------------------------------------------------
    # 6. Save both models + a machine-readable comparison for the report
    # ------------------------------------------------------------------
    joblib.dump(_save_bundle(model_hybrid, evals_b["synthetic_test"]["accuracy"], {
        "data_provenance": "hybrid: 4000 synthetic rows + real GSI NER landslide inventory",
        "eval": evals_b,
        "training_data": {"synthetic_rows": len(synth),
                          "real_rows": len(real) if use_real else 0,
                          "real_holdout_rows": len(real_test[1]) if use_real else 0},
        "trained_at": pd.Timestamp.now().isoformat()
    }), MODEL_FILE)

    joblib.dump(_save_bundle(model_synth, evals_a["synthetic_test"]["accuracy"], {
        "data_provenance": "synthetic only (baseline)",
        "eval": evals_a,
        "training_data": {"synthetic_rows": len(synth),
                          "real_rows": 0, "real_holdout_rows": 0},
        "trained_at": pd.Timestamp.now().isoformat()
    }), MODEL_SYNTHETIC_FILE)

    summary = {
        "synthetic_only": evals_a,
        "hybrid": evals_b,
        "real_rows_used": len(real) if use_real else 0
    }
    os.makedirs(os.path.dirname(COMPARISON_JSON), exist_ok=True)
    with open(COMPARISON_JSON, "w") as f:
        json.dump(summary, f, indent=2)

    print(f"✅ Saved deployed hybrid model -> {MODEL_FILE}")
    print(f"✅ Saved baseline (synthetic-only) -> {MODEL_SYNTHETIC_FILE}")
    print(f"✅ Comparison JSON -> {COMPARISON_JSON}")
    return summary


if __name__ == "__main__":
    train_and_save()
