#!/bin/bash
# CoalTrade AI — Full Setup Script
# Run from the root coaltrade-ai/ directory

set -e

echo "======================================================"
echo "  CoalTrade AI — Project Setup"
echo "  University of Lahore FYP"
echo "======================================================"

# 1. Backend
echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install
echo "✅ Backend dependencies installed"

# Copy .env if not exists
if [ ! -f .env ]; then
  cp .env.example .env
  echo "⚠  .env created from example. Please update DB_PASSWORD and JWT_SECRET!"
fi
cd ..

# 2. Frontend
echo ""
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
echo "✅ Frontend dependencies installed"
cd ..

# 3. Python AI
echo ""
echo "🐍 Installing Python dependencies..."
cd ai-model
pip install -r requirements.txt --break-system-packages 2>/dev/null || pip install -r requirements.txt
echo "✅ Python dependencies installed"

echo ""
echo "🤖 Training AI model (this takes ~30 seconds)..."
python train_model.py
echo "✅ AI model trained and saved"
cd ..

echo ""
echo "======================================================"
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Update backend/.env with your PostgreSQL credentials"
echo "  2. Run: psql -U postgres -d coaltrade_db -f database/schema.sql"
echo "  3. Start backend:   cd backend && npm run dev"
echo "  4. Start AI model:  cd ai-model && python app.py"
echo "  5. Start frontend:  cd frontend && npm start"
echo "======================================================"
