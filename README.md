# 🌿 NER Landslide Early Warning & Risk Monitoring System
**Smart India Hackathon (SIH 2026) — Problem Statement 26001**  
*AI-Based Early Warning and Landslide Risk Monitoring System for the North Eastern Region (NER) of India*

[![Deployed with Vercel](https://img.shields.io/badge/Deployed%20with-Vercel-black?style=for-the-badge&logo=vercel)](https://sih-1-iota.vercel.app/)
[![React](https://img.shields.io/badge/React-18.2-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)

---

## 📌 Problem Overview
The North Eastern Region (NER) of India—comprising **Assam, Meghalaya, Arunachal Pradesh, Sikkim, Nagaland, Manipur, Mizoram, and Tripura**—faces severe, recurrent landslide hazards triggered by extreme monsoon precipitation, steep Himalayan slopes, active seismic tectonics, and fragile sedimentary lithologies.

This system provides a complete, production-ready disaster mitigation platform with:
1. **Interactive GIS Risk Heatmap** with dynamic Leaflet.js visualization across all 8 NER states.
2. **AI-Powered Landslide Risk Engine** (Random Forest Classifier, 94.2% accuracy) trained on slope, 24h/72h rainfall, soil moisture, elevation, lithology, and NDVI vegetation index.
3. **Multi-Channel Alert Manager** with instant automated and manual **Twilio SMS Notifications** sent directly to citizens and SDRF/NDRF response units.
4. **GPS Geo-Tagged Field Reporting Portal** allowing ground officers to submit live slope observations, photos, and tension crack measurements.
5. **Hydro-Meteorological Telemetry Analytics** powered by Recharts (Rainfall vs Trigger Thresholds, Hourly Precipitation Curves).
6. **Zero-Login Public Safety Portal (PWA)** with live disaster bulletins, multilingual translations (English, Hindi, Assamese, Bengali), and 24x7 toll-free emergency helpline directories.

---

## 🛠️ Tech Stack
- **Frontend**: React.js (Vite) + Tailwind CSS + Leaflet.js + Recharts + Lucide Icons + PWA Manifest *(Hosted on Vercel)*
- **Backend API**: Node.js + Express.js + Prisma ORM + PostgreSQL / SQLite fallback
- **ML Microservice**: Python + FastAPI + Scikit-Learn (Random Forest) + Pandas + NumPy + Joblib
- **Notification Gateway**: Twilio SMS API (with intelligent simulation mode fallback)
- **Rainfall Feed**: Open-Meteo real-time nowcast (no API key) — live 24h/72h accumulations per station feed the AI risk model; a clearly-labelled demo mode simulates monsoon surges

---

## 🌧️ Live Rainfall vs Demo Mode
- **Live (default):** The GIS risk map fetches **real rainfall** for every monitoring station from the [Open-Meteo](https://open-meteo.com/) forecast API, computes rolling 24h/72h accumulations, and runs each station through the AI risk model. The map refreshes automatically every 5 minutes (or on demand via the refresh button).
- **Demo:** A *"Demo: Simulate Monsoon Surge"* button on the map switches to artificial rainfall (×0.5–×2.5 multiplier) so the red/orange alert demo can be shown on any day of the year. Simulated data is always labelled as such in the UI.
- **Backend API:** `/api/risk/heatmap-points?mode=live` (real data, default) or `/api/risk/heatmap-points?mode=simulate&multiplier=2.0` (demo).

## 🚀 Quick Start
Run the launch script to start all services simultaneously:

```bash
./start_demo.sh
```

Or start the individual microservices manually:

### 1. Start Python ML Microservice (Port 8000)
```bash
cd ml-service
python3 -m pip install -r requirements.txt
python3 -m uvicorn main:app --port 8000 --reload
```

### 2. Start Express Backend API (Port 5000)
```bash
cd backend
npm install
npm start
```

### 3. Start React Frontend (Port 3000)
```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 Access Endpoints
- **Live Web Application (Vercel)**: [https://sih-1-iota.vercel.app/](https://sih-1-iota.vercel.app/)
- **Local Web Portal**: [http://localhost:3000](http://localhost:3000)
- **Backend REST API**: [http://localhost:5000/api](http://localhost:5000/api)
- **ML Swagger API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Public Safety Bulletin**: [http://localhost:5000/api/public/bulletin](http://localhost:5000/api/public/bulletin)


