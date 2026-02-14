## MedCognis Health is a high-performance clinical triage and command center platform engineered for modern healthcare environments.

The system addresses a core operational challenge in emergency and inpatient care: accurate, transparent, and real-time patient prioritization.

![image alt](https://github.com/prashantvyahutwork-droid/MedCognis-Hackathon---pragyan26-/blob/main/Screenshot%202026-02-15%20025821.png)

## By combining:

Machine Learning (XGBoost)
Rule-based clinical safety overrides
Explainable AI (SHAP)
Local LLM-powered clinical assistance (Llama 3 via Ollama)
MedCognis delivers interpretable, data-driven risk scoring to support faster clinical decisions and optimized patient flow.

## 🚀 Key Features

🧠 Hybrid Risk Scoring Engine
XGBoost-based triage classification
Hard-coded safety overrides (critical BP, SpO₂, HR thresholds)
Multi-layer prioritization logic

![image alt](https://github.com/prashantvyahutwork-droid/MedCognis-Hackathon---pragyan26-/blob/main/Features.png)


## 🔍 Explainable AI (XAI)

Integrated SHAP (SHapley Additive exPlanations)
Feature-level transparency for every prediction
Clinician-readable reasoning outputs

![image alt](https://github.com/prashantvyahutwork-droid/MedCognis-Hackathon---pragyan26-/blob/main/Analysis%20diagnosis-1.png)
![image alt](https://github.com/prashantvyahutwork-droid/MedCognis-Hackathon---pragyan26-/blob/main/Analysis%20diagnosis-2.png)

## 🩺 Diagnostic Mapping

Symptom-vital correlation engine
Condition prediction
Specialist recommendation routing

![image alt](https://github.com/prashantvyahutwork-droid/MedCognis-Hackathon---pragyan26-/blob/main/Screenshot%202026-02-15%20025859.png)

## 📊 Real-Time Command Center

Glassmorphism-inspired UI
ICU load tracking
Department capacity visibility
Vital trend radar & bar charts

## 📄 Automated EHR Parsing

Heuristic PDF/Text ingestion
Rapid structured data extraction
In-memory preprocessing pipeline

## 🤖 Local LLM Integration

![image alt](https://github.com/prashantvyahutwork-droid/MedCognis-Hackathon---pragyan26-/blob/main/Chatbot.png)

Secure, on-premise clinical assistant
Powered by Llama 3 via Ollama
No external data transmission

## 🏗 System Architecture

MedCognis follows a decoupled, service-oriented architecture optimized for low-latency clinical operations.

# 1️⃣ Frontend Layer – Next.js 16

Framework: Next.js (App Router)
UI Styling: Tailwind CSS v4
Data Visualization: Recharts
Animations: Framer Motion
Icons: Lucide React
State Management: React hooks integrated with triage utilities

# 2️⃣ Backend API Layer – FastAPI

RESTful API architecture
# Orchestration between:

Frontend 
ML models
Database

# Key Endpoints:

1.Patient registration
2.Risk prediction
3.Model retraining
4.Clinical AI chat
5.Intelligence Layer
6.Predictive Model
7.XGBoost classifier
8.Trained on structured clinical features
9.SHAP-based interpretability module

# 💬 Clinical AI Assistant

Local LLM endpoint
Ollama runtime
Offline inference capability
Persistence Layer – SQLite
Transactional local database
Patient records storage
Role-Based Access Control (RBAC)
Visit history tracking

# 🛠 Technology Stack
Layer	Technologies 

Frontend	Next.js 16, Tailwind CSS v4, Recharts, Framer Motion, Lucide React
Backend	Python 3.10+, FastAPI, Uvicorn
AI / ML	XGBoost, SHAP, Scikit-Learn, Pandas, NumPy
Local LLM	Ollama (Llama 3)
Database	SQLite 3
Dev Tools	npm, pip

⚙ Installation Guide
📌 Prerequisites

Node.js ≥ 18
Python ≥ 3.10
Ollama installed and running

🔹 Backend Setup
cd Models
python -m venv .venv
source .venv/bin/activate     # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py

![image alt](https://github.com/prashantvyahutwork-droid/MedCognis-Hackathon---pragyan26-/blob/main/Screenshot%202026-02-15%20031519.png)

#🔹 Frontend Setup
cd ..
npm install
npm run dev

![image alt](https://github.com/prashantvyahutwork-droid/MedCognis-Hackathon---pragyan26-/blob/main/Screenshot%202026-02-15%20025821.png)


#🔹 Ollama Setup

Ensure Ollama daemon is active:

ollama pull llama3

![image alt](https://github.com/prashantvyahutwork-droid/MedCognis-Hackathon---pragyan26-/blob/main/Ollama.png)


Default endpoint:

http://localhost:11434

# 🧪 Usage Guide

1️⃣ Access Dashboard
Open:

http://localhost:3000

2️⃣ Patient Triage

Navigate to Patient Records
Upload CSV / JSON / PDF
Trigger AI risk assessment

3️⃣ Analytics View

Inspect SHAP explanations
Review risk breakdown
Examine recommended specialists

![image alt](https://github.com/prashantvyahutwork-droid/MedCognis-Hackathon---pragyan26-/blob/main/Analysis%20diagnosis-1.png)
![image alt](https://github.com/prashantvyahutwork-droid/MedCognis-Hackathon---pragyan26-/blob/main/Analysis%20diagnosis-2.png)

4️⃣ Clinical Assistant

Access Support & Help
Interact with local LLM for structured guidance

![image alt](https://github.com/prashantvyahutwork-droid/MedCognis-Hackathon---pragyan26-/blob/main/Chatbot.png)

# 📂 Folder Structure
├── app/                 # Next.js App Router
├── Models/              # Backend & ML Logic
│   ├── app.py
│   ├── triage_logic.py
│   └── triage_xgboost.pkl
├── components/          # Reusable UI Components
├── lib/                 # Frontend utilities
├── public/              # Static assets
├── types/               # TypeScript interfaces
└── README.md

## 🔮 Future Enhancements

DICOM imaging integration (MRI/CT)
Predictive bed capacity forecasting
Federated learning model updates
Multi-branch hospital synchronization
Advanced anomaly detection in vitals

## 👥 Contributors

# Project Lead: Phoenixphones
Clinical AI Lead: Phoenixphones

Member Name: 

1.Naveen (leader)
2.Prashant gupta(frontend developer)
3.Sachin chauhan(Synthesis Data vault generation and Research work)
4.Bibek Kumar Sah(Resources generator and idea Creator )
Clinical AI Lead: Phoenixphones

# 📜 License

Licensed under the MIT License.
See LICENSE file for details.

# ⚠ Disclaimer

MedCognis Health is a clinical decision support system.
It is not a substitute for licensed medical judgment and must be used under professional supervision.
