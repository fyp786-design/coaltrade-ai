# CoalTrade AI — Intelligent Coal Trading Platform

> **FYP Project** — Department of CS & IT, The University of Lahore  
> Session: BSCS Fall 2021–2026 | Advisor: M. Ahmed Zia

**Team Members:**
| Name | Roll No |
|------|---------|
| Hammad Ahmed | 70134871 |
| M. Hassan Shahid | 70131951 |
| Muzamil Naseer | 70126896 |

---

## 📖 Project Overview

CoalTrade AI is a modern digital marketplace for coal trading. It allows users to:
- Post coal listings (buy/sell)
- Browse the marketplace with filters
- Send/receive trade requests
- Get **AI-powered coal price predictions** using Machine Learning
- Admin panel for user and listing management

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 18, React Router v6, Recharts |
| Backend | Node.js, Express.js, JWT Auth, bcryptjs |
| Database | PostgreSQL |
| AI Model | Python Flask, scikit-learn (RF + GB Ensemble) |
| Security | Helmet, rate-limiting, CORS |

---

## 📁 Project Structure

```
coaltrade-ai/
├── frontend/          # React.js frontend
│   ├── src/
│   │   ├── pages/     # All page components
│   │   ├── components/ # Reusable components (Navbar, Footer)
│   │   ├── context/   # AuthContext
│   │   └── services/  # API service layer
│   └── public/
├── backend/           # Node.js/Express.js API
│   ├── routes/        # API routes
│   ├── controllers/   # Business logic
│   ├── middleware/    # JWT auth middleware
│   └── config/        # DB config
├── ai-model/          # Python Flask AI service
│   ├── app.py         # Flask API server
│   ├── train_model.py # ML model training
│   └── models/        # Saved model files (generated)
└── database/
    └── schema.sql     # PostgreSQL schema
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js >= 18
- PostgreSQL >= 14
- Python >= 3.9

---

### Step 1 — PostgreSQL Database Setup

```bash
# Create database
psql -U postgres -c "CREATE DATABASE coaltrade_db;"

# Run schema
psql -U postgres -d coaltrade_db -f database/schema.sql
```

---

### Step 2 — Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your DB credentials and JWT secret

npm install
npm run dev
# Backend runs on http://localhost:5000
```

---

### Step 3 — AI Model Setup

```bash
cd ai-model
pip install -r requirements.txt

# Train the ML model first (generates models/ directory)
python train_model.py

# Start the Flask server
python app.py
# AI model runs on http://localhost:5001
```

---

### Step 4 — Frontend Setup

```bash
cd frontend
npm install
npm start
# Frontend runs on http://localhost:3000
```

---

## 🔑 Default Admin Account

After running `database/schema.sql`, create your admin by registering normally at `/register`, then update the role in psql:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/profile | Update profile |
| PUT | /api/auth/change-password | Change password |

### Listings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/listings | Get all listings (with filters) |
| GET | /api/listings/:id | Get single listing |
| GET | /api/listings/my/listings | Get my listings |
| POST | /api/listings | Create listing |
| PUT | /api/listings/:id | Update listing |
| DELETE | /api/listings/:id | Delete listing |

### Trade Requests
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/trade | Send trade request |
| GET | /api/trade/my | Get my trade requests |
| PUT | /api/trade/:id/status | Accept/reject request |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/ai/predict | Price prediction |
| GET | /api/ai/market-insights | Market statistics |
| GET | /api/ai/status | AI model status |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/dashboard | Dashboard stats |
| GET | /api/admin/users | All users |
| PUT | /api/admin/users/:id/toggle-status | Activate/deactivate |
| PUT | /api/admin/users/:id/role | Change role |
| DELETE | /api/admin/users/:id | Delete user |
| GET | /api/admin/listings | All listings |

---

## 🤖 AI Model Details

- **Algorithm:** Ensemble of Random Forest + Gradient Boosting
- **Training Data:** 2,000 synthetic coal price records based on international market data
- **Features:** Coal type, calorific value, ash %, moisture %, sulfur %, quantity
- **Target:** Price per ton (USD)
- **Accuracy:** ~97% R² score
- **Framework:** scikit-learn, Flask API

---

## 🌍 Deployment

| Service | Platform |
|---------|---------|
| Frontend | Vercel |
| Backend | Vercel.com |
| AI Model | Hugginfface.co |
| Database | Neon PostgreSQL |

---

## 📄 License

© 2026 Department of CS & IT, The University of Lahore.  
Final Year Project — CoalTrade AI: Intelligent Coal Trading.
