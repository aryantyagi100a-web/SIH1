#!/bin/bash
# ====================================================================
# NER Landslide Early Warning & Risk Monitoring System
# Service Startup Script
# ====================================================================

echo "===================================================================="
echo "🚀 STARTING NER LANDSLIDE EARLY WARNING PLATFORM"
echo "===================================================================="

# Check and kill existing processes on ports 8000, 5000, 3000
echo "🧹 Cleaning up existing ports..."
lsof -ti:8000 | xargs kill -9 2>/dev/null
lsof -ti:5000 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null

# 1. Start Python FastAPI ML Microservice
echo "🌿 [1/3] Starting Python FastAPI ML Microservice on port 8000..."
cd ml-service
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 &
ML_PID=$!
cd ..

sleep 2

# 2. Start Node.js Express Backend
echo "📡 [2/3] Starting Node.js Express Backend on port 5000..."
cd backend
node src/server.js &
BACKEND_PID=$!
cd ..

sleep 2

# 3. Start React Vite Frontend
echo "💻 [3/3] Starting React + Leaflet Frontend on port 3000..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "===================================================================="
echo "✅ ALL SERVICES RUNNING!"
echo "   • Frontend UI:    http://localhost:3000"
echo "   • Backend API:    http://localhost:5000"
echo "   • ML Microservice:http://localhost:8000 (Docs: http://localhost:8000/docs)"
echo "===================================================================="
echo "Press Ctrl+C to shut down all services."

trap "kill $ML_PID $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Services stopped.'; exit" INT TERM
wait
