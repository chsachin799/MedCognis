# MedCognis Health

## MedCognis Health is a high-performance clinical triage and command center platform engineered for modern healthcare environments.

The system addresses a core operational challenge in emergency and inpatient care: accurate, transparent, and real-time patient prioritization.

![MedCognis Overview](https://raw.githubusercontent.com/chsachin799/MedCognis/main/Screenshot%202026-02-15%20025821.png)

## By combining:

- Machine Learning (XGBoost)
- Rule-based clinical safety overrides
- Explainable AI (SHAP)
- Local LLM-powered clinical assistance (Llama 3 via Ollama)

MedCognis delivers interpretable, data-driven risk scoring to support faster clinical decisions and optimized patient flow.

## 🚀 Key Features

🧠 **Hybrid Risk Scoring Engine**
- XGBoost-based triage classification
- Hard-coded safety overrides (critical BP, SpO₂, HR thresholds)
- Multi-layer prioritization logic

![Features](https://raw.githubusercontent.com/chsachin799/MedCognis/main/Features.png)

## 🧠 How the AI Engine Works

The core of MedCognis is its dual-layer AI engine that combines the predictive power of **XGBoost** with the clinical rigor of **Safety Overrides**.

1.  **Structured Data Analysis**: The engine processes 10+ clinical parameters (Age, BP, HR, SpO₂, etc.) to identify complex risk patterns.
2.  **Clinical Safety Overrides**: Before final scoring, the system checks for critical threshold violations (e.g., Temp > 40°C or SpO₂ < 90%) to ensure high-risk patients are never underestimated by purely statistical models.
3.  **Real-time Explainability**: Using **SHAP**, the engine identifies exactly which features (like high Heart Rate or Age) contributed most to the risk score, providing clinicians with immediate diagnostic context.

![AI Engine Input](https://raw.githubusercontent.com/chsachin799/MedCognis/main/Analysis%20diagnosis-2.png)
![AI Engine Results](https://raw.githubusercontent.com/chsachin799/MedCognis/main/Analysis%20diagnosis-1.png)

## 🔍 Explainable AI (XAI)

- Integrated SHAP (SHapley Additive exPlanations)
- Feature-level transparency for every prediction
- Clinician-readable reasoning outputs

![Analysis Insights](https://raw.githubusercontent.com/chsachin799/MedCognis/main/Analysis%20diagnosis-1.png)

## 🩺 Diagnostic Mapping

- Symptom-vital correlation engine
- Condition prediction
- Specialist recommendation routing

![Diagnostic Mapping](https://raw.githubusercontent.com/chsachin799/MedCognis/main/Screenshot%202026-02-15%20025859.png)

## 📊 Real-Time Command Center

- Glassmorphism-inspired UI
- ICU load tracking
- Department capacity visibility
- Vital trend radar & bar charts

![Dashboard](https://raw.githubusercontent.com/chsachin799/MedCognis/main/Homepage.png)

## 📄 Automated EHR Parsing

- Heuristic PDF/Text ingestion
- Rapid structured data extraction
- In-memory preprocessing pipeline

## 🤖 Local LLM Integration

![Clinical Chat](https://raw.githubusercontent.com/chsachin799/MedCognis/main/Chatbot.png)

- Secure, on-premise clinical assistant
- Powered by Llama 3 via Ollama
- No external data transmission

## 🏗 System Architecture

MedCognis follows a decoupled, service-oriented architecture optimized for low-latency clinical operations.

![Architecture Diagram](https://raw.githubusercontent.com/chsachin799/MedCognis/main/MedCognis_Full_Architecture_Diagram.png)

### 1️⃣ Frontend Layer – Next.js 16
- **Framework**: Next.js (App Router)
- **UI Styling**: Tailwind CSS v4
- **Data Visualization**: Recharts
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **State Management**: React hooks integrated with triage utilities

### 2️⃣ Backend Layer – FastAPI
Orchestration between Frontend, ML models, and Database.
**Key Endpoints**:
1. Patient registration
2. Risk prediction
3. Model retraining
4. Clinical AI chat

### 3️⃣ Intelligence Layer
- **Predictive Model**: XGBoost classifier
- **Data**: Trained on structured clinical features
- **Explainability**: SHAP-based interpretability module

### 💬 Clinical AI Assistant
- Local LLM endpoint
- Ollama runtime
- Offline inference capability

### 4️⃣ Persistence Layer – SQLite
- Transactional local database
- Patient records storage
- Role-Based Access Control (RBAC)
- Visit history tracking

## 🛠 Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 16, Tailwind CSS v4, Recharts, Framer Motion, Lucide React |
| **Backend** | Python 3.10+, FastAPI, Uvicorn |
| **AI / ML** | XGBoost, SHAP, Scikit-Learn, Pandas, NumPy |
| **Local LLM** | Ollama (Llama 3) |
| **Database** | SQLite 3 |
| **Dev Tools** | npm, pip |

## ⚙ Installation Guide

### 📌 Prerequisites
- Node.js ≥ 18
- Python ≥ 3.10
- Ollama installed and running

### 🔹 Backend Setup
```bash
cd Models
python -m venv .venv
source .venv/bin/activate     # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py
```
![Backend Startup](https://raw.githubusercontent.com/chsachin799/MedCognis/main/Screenshot%202026-02-15%20031519.png)

### 🔹 Frontend Setup
```bash
# From project root
npm install
npm run dev
```
![Frontend Startup](https://raw.githubusercontent.com/chsachin799/MedCognis/main/Screenshot%202026-02-15%20025821.png)

### 🔹 Ollama Setup
Ensure Ollama daemon is active:
```bash
ollama pull llama3
```
![Ollama Setup](https://raw.githubusercontent.com/chsachin799/MedCognis/main/Ollama.png)
Default endpoint: `http://localhost:11434`

## 🧪 Usage Guide

1️⃣ **Access Dashboard**
Open: `http://localhost:3000`

2️⃣ **Patient Triage**
- Navigate to Patient Records
- Upload CSV / JSON / PDF
- Trigger AI risk assessment

![Patient Records](https://raw.githubusercontent.com/chsachin799/MedCognis/main/Patient%20Records.png)

3️⃣ **Analytics View**
- Inspect SHAP explanations
- Review risk breakdown
- Examine recommended specialists

![Analysis Views](https://raw.githubusercontent.com/chsachin799/MedCognis/main/Analysis%20diagnosis-1.png)

4️⃣ **Clinical Assistant**
- Access Support & Help
- Interact with local LLM for structured guidance

![Chatbot Interface](https://raw.githubusercontent.com/chsachin799/MedCognis/main/Chatbot.png)

## 📂 Folder Structure
```
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
```

## 🔮 Future Enhancements
- DICOM imaging integration (MRI/CT)
- Predictive bed capacity forecasting
- Federated learning model updates
- Multi-branch hospital synchronization
- Advanced anomaly detection in vitals

## 👥 Contributors

**Team Name**: Phoenixphones
**Clinical AI Lead**: Phoenixphones teams

**Members**:
1. Naveen (Leader)
2. Prashant Gupta (Frontend Developer)
3. Sachin Chauhan (Synthesis Data Vault Generation and Research Work)
4. Bibek Kumar Sah (Resources Generator and Idea Creator)

## 📜 License
Licensed under the MIT License. See LICENSE file for details.

## ⚠ Disclaimer
MedCognis Health is a clinical decision support system. It is not a substitute for licensed medical judgment and must be used under professional supervision.