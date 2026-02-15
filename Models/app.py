import uvicorn
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from triage_logic import TriageEngine
from train_model_v2 import train_model
import os
import io
import re
from pypdf import PdfReader
import requests
import uuid
import datetime


import sqlite3
from collections import Counter

# --- Database Setup ---
DB_NAME = "patients.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    
    # Unified Users Table (RBAC)
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            role TEXT, -- 'doctor' or 'patient'
            name TEXT,
            specialty TEXT -- Nullable, for doctors
        )
    ''')

    # Create Patients Table
    c.execute('''
        CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_custom_id TEXT UNIQUE,
            name TEXT,
            user_id INTEGER,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            age INTEGER,
            gender TEXT,
            symptoms TEXT,
            bp INTEGER,
            heart_rate INTEGER,
            temp REAL,
            o2_sat INTEGER,
            pain_level INTEGER,
            consciousness TEXT,
            condition TEXT,
            risk_level TEXT,
            department TEXT,
            confidence REAL,
            visit_status TEXT DEFAULT 'Waiting'
        )
    ''')
    
    # Simple Migration: Add columns if they don't exist
    try:
        c.execute("ALTER TABLE patients ADD COLUMN patient_custom_id TEXT UNIQUE")
    except Exception:
        pass 
        
    try:
        c.execute("ALTER TABLE patients ADD COLUMN name TEXT")
    except Exception:
        pass
    
    # Seed default doctor if not exists
    c.execute("SELECT count(*) FROM users WHERE username='admin'")
    if c.fetchone()[0] == 0:
        c.execute("INSERT INTO users (username, password, role, name, specialty) VALUES (?, ?, ?, ?, ?)", 
                  ('admin', 'admin123', 'doctor', 'Dr. MedCognis Health', 'Chief Medical Officer'))
        print("✅ Default Doctor (admin) created.")

    conn.commit()
    conn.close()

# Initialize DB on startup
init_db()

app = FastAPI(title="MedCognis Health AI Triage System")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Engine
try:
    engine = TriageEngine()
except Exception as e:
    print(f"Failed to load model: {e}")
    engine = None

@app.get("/metrics")
async def get_metrics():
    """Return model performance metrics."""
    metrics = engine.calculate_benchmarks()
    return metrics

@app.get("/health")
async def health_check():
    return {"status": "healthy"}



from pydantic import BaseModel, Field

class PatientData(BaseModel):
    Name: str = Field(..., description="Patient Name")
    Age: int = Field(..., ge=0, le=120, description="Age must be between 0 and 120")
    Gender: str
    Symptoms: str
    Blood_Pressure: int = Field(..., ge=50, le=250, description="Syastolic BP must be between 50 and 250")
    Heart_Rate: int = Field(..., ge=30, le=300, description="Heart Rate must be between 30 and 300")
    Temperature: float = Field(..., ge=25.0, le=45.0, description="Temperature must be between 25.0 and 45.0")
    O2_Saturation: int = Field(..., ge=0, le=100, description="O2 Saturation must be between 0 and 100")
    Pain_Severity: int = Field(..., ge=0, le=10, description="Pain Severity must be between 0 and 10")
    Consciousness: str
    Pre_Existing_Conditions: str
    user_id: int = None  # Optional, links to registered user

class ChatRequest(BaseModel):
    message: str
    history: list = []


@app.post("/predict")
async def predict_risk(data: PatientData):
    if not engine:
        raise HTTPException(status_code=500, detail="Model engine not initialized.")
    

    # Convert Pydantic model to dict
    input_data = data.dict()
    
    # Get Prediction from Engine
    result = engine.predict_patient(input_data)
    # Generate System ID (e.g., PAT-8F2A)
    generated_id = f"PAT-{str(uuid.uuid4())[:8].upper()}"
    input_data['Patient_ID'] = generated_id
        
    # Save to Database
    try:
        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()
        c.execute('''
            INSERT INTO patients (patient_custom_id, name, user_id, age, gender, symptoms, bp, heart_rate, temp, o2_sat, pain_level, consciousness, condition, risk_level, department, confidence)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            input_data['Patient_ID'],
            input_data['Name'],
            input_data.get('user_id'),
            input_data['Age'], 
            input_data['Gender'], 
            input_data['Symptoms'], 
            input_data['Blood_Pressure'], 
            input_data['Heart_Rate'], 
            input_data['Temperature'],
            input_data.get('O2_Saturation', 98),
            input_data.get('Pain_Severity', 0),
            input_data.get('Consciousness', 'Alert'),
            input_data['Pre_Existing_Conditions'], 
            result['risk_level'], 
            result['department'], 
            result['confidence']
        ))
        conn.commit()
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail=f"Patient ID '{input_data['Patient_ID']}' already exists.")
    except Exception as e:
        print(f"DB Error: {e}")
        raise HTTPException(status_code=500, detail="Database error occurred.")
    finally:
        conn.close()

    return {**input_data, **result}

@app.get("/history/{user_id}")
async def get_patient_history(user_id: int):
    try:
        conn = sqlite3.connect(DB_NAME)
        conn.row_factory = sqlite3.Row
        c = conn.cursor()
        c.execute("SELECT * FROM patients WHERE user_id=? ORDER BY timestamp DESC", (user_id,))
        rows = c.fetchall()
        history = [dict(row) for row in rows]
        return {"status": "success", "history": history}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        conn.close()

@app.get("/admin/stats")
async def get_admin_stats():
    """Fetch analytics for Admin HQ."""
    try:
        conn = sqlite3.connect(DB_NAME)
        conn.row_factory = sqlite3.Row
        c = conn.cursor()
        
        # Risk Distribution
        c.execute("SELECT risk_level, COUNT(*) as count FROM patients GROUP BY risk_level")
        risks = {row['risk_level']: row['count'] for row in c.fetchall()}
        
        # Department Load
        c.execute("SELECT department, COUNT(*) as count FROM patients GROUP BY department")
        depts = {row['department']: row['count'] for row in c.fetchall()}
        
        # Recent Patients
        c.execute("SELECT * FROM patients ORDER BY timestamp DESC LIMIT 10")
        recent = [dict(row) for row in c.fetchall()]
        
        return {
            "status": "success",
            "risk_distribution": risks,
            "department_load": depts,
            "recent_patients": recent
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        conn.close()

@app.post("/parse_ehr")
async def parse_ehr(file: UploadFile = File(...)):
    try:
        content = await file.read()
        text = ""
        
        # Determine file type
        if file.filename.endswith(".pdf"):
            pdf_file = io.BytesIO(content)
            reader = PdfReader(pdf_file)
            for page in reader.pages:
                text += page.extract_text() + "\n"
        else:
            # Assume text
            text = content.decode("utf-8")
            
        # Simple Regex Extraction (Heuristic)
        data = {}
        
        # Age
        age_match = re.search(r"Age[:\s]+(\d+)", text, re.IGNORECASE)
        if age_match:
            data["Age"] = int(age_match.group(1))
            
        # Gender
        if re.search(r"Male", text, re.IGNORECASE):
            data["Gender"] = "Male"
        elif re.search(r"Female", text, re.IGNORECASE):
            data["Gender"] = "Female"
            
        # Symptoms (Keyword matching from known list)
        symptoms_list = ["Chest Pain", "Fever", "Cough", "Numbness", "Abdominal Pain", "Headache", "Breathlessness", "Vomiting"]
        for s in symptoms_list:
            if re.search(re.escape(s), text, re.IGNORECASE):
                data["Symptoms"] = s
                break
        
        # Vitals
        bp_match = re.search(r"BP[:\s]+(\d+)", text, re.IGNORECASE) # Systolic only for simplicity
        if bp_match:
            data["Blood_Pressure"] = int(bp_match.group(1))
            
        hr_match = re.search(r"Heart Rate[:\s]+(\d+)", text, re.IGNORECASE)
        if hr_match:
            data["Heart_Rate"] = int(hr_match.group(1))
            
        temp_match = re.search(r"Temp(?:erature)?[:\s]+(\d+\.?\d*)", text, re.IGNORECASE)
        if temp_match:
            data["Temperature"] = float(temp_match.group(1))
            
        # Pre-existing (Keyword matching)
        conditions_list = ["Hypertension", "Diabetes", "Asthma", "Heart Disease"]
        data["Pre_Existing_Conditions"] = "None"
        for c in conditions_list:
            if re.search(re.escape(c), text, re.IGNORECASE):
                data["Pre_Existing_Conditions"] = c
                break
                
        return {"status": "success", "data": data, "raw_text_preview": text[:200]}

    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/train")
async def train_new_model(file: UploadFile = File(...)):
    try:
        # Save uploaded CSV
        data_dir = "data"
        os.makedirs(data_dir, exist_ok=True)
        file_path = os.path.join(data_dir, "uploaded_training_data.csv")
        
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)
            
        # Train model
        success, result = train_model(data_path=file_path)
        
        if success:
            # Reload engine model
            if engine:
                engine.reload_model()
            return {"status": "success", "metrics": result}
        else:
            return {"status": "error", "message": result}
            
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/analyze-report")
async def analyze_report(data: dict):
    """
    Analyze a medical report text and return structured insights.
    """
    text = data.get("report", "")
    age = data.get("age", 30)
    gender = data.get("gender", "Male")
    
    # Simple extraction logic (can be improved with LLM)
    symptoms = []
    if "fever" in text.lower(): symptoms.append("Fever")
    if "cough" in text.lower(): symptoms.append("Cough")
    if "chest pain" in text.lower(): symptoms.append("Chest Pain")
    if "breath" in text.lower(): symptoms.append("Shortness of Breath")
    
    # Default vitals if not found
    vitals = {
        "heartRate": 85,
        "bloodPressure": "120/80",
        "spo2": 97,
        "temperature": 37.2
    }
    
    # Predict risk using engine
    risk_data = {
        "Age": age,
        "Gender": gender,
        "Symptoms": ";".join(symptoms) if symptoms else "None",
        "Blood_Pressure": 120, # Simplified
        "Heart_Rate": vitals["heartRate"],
        "Temperature": vitals["temperature"],
        "O2_Saturation": vitals["spo2"],
        "Pain_Severity": 3,
        "Consciousness": "Alert",
        "Pre_Existing_Conditions": "None"
    }
    
    try:
        prediction = engine.predict_patient(risk_data) if engine else {"risk_level": "Low", "risk_score": 10, "department": "General Medicine", "justification": ["Insufficient data"]}
        
        # Simple risk mapping for UI
        risk_level = prediction.get("risk_level", "Low")
        risk_score = 75 if risk_level == "High" else 45 if risk_level == "Medium" else 15
        chart_data = [
            {"time": "08:00", "hr": 78, "temp": 36.8},
            {"time": "12:00", "hr": 82, "temp": 37.1},
            {"time": "16:00", "hr": 88, "temp": 37.5},
            {"time": "20:00", "hr": 85, "temp": 37.2},
        ]
        
        insights = prediction.get("insights", [])
        default_summary = f"Patient presents with {', '.join(symptoms) if symptoms else 'mild symptoms'}."
        summary = insights[0] if insights else default_summary
        
        return {
            "status": "success",
            "analysis": {
                "name": data.get("name", "Unknown Patient"),
                "risk_level": risk_level,
                "risk_score": risk_score,
                "department": prediction.get("department", "General Medicine"),
                "predicted_disease": prediction.get("predicted_disease", "General Condition"),
                "recommended_specialist": prediction.get("recommended_specialist", "General Physician"),
                "curing_process": prediction.get("curing_process", ["Observation"]),
                "symptoms": symptoms,
                "summary": summary,
                "chartData": chart_data
            }
        }
    except Exception as e:
        print(f"Error in analyze_report: {e}")
        return {"status": "error", "message": f"Server error: {str(e)}"}

@app.post("/save-diagnosis")
async def save_diagnosis(data: dict):
    """Save the analyzed diagnosis to records."""
    # In a real app, this would save to a database.
    # For now, we'll return success with the saved details.
    return {
        "status": "success",
        "message": "Diagnosis saved to clinical records.",
        "saved_data": {
            "patient_name": data.get("name"),
            "description": data.get("summary"),
            "timestamp": data.get("timestamp")
        }
    }

@app.post("/chat")
async def chat_with_ai(data: ChatRequest):
    """Interact with Ollama AI Assistant with structured response format."""
    system_prompt = (
        "You are the MedCognis Health Support Assistant. Provide helpful, concise, and professional clinical support. "
        "Format your responses as follows:\n\n"
        "1. **Brief Description**: A short summary of the answer.\n"
        "2. **Actionable Steps**: Clear, numbered steps for the user to follow.\n\n"
        "Maintain an empathetic and clear tone."
    )
    
    messages = [{"role": "system", "content": system_prompt}]
    for item in data.history:
        # Pydantic models in history list might be dicts or objects depending on integration
        role = item.get("role") if isinstance(item, dict) else item.role
        content = item.get("content") if isinstance(item, dict) else item.content
        messages.append({"role": role, "content": content})
    
    messages.append({"role": "user", "content": data.message})
    
    try:
        # Connect to local Ollama instance
        response = requests.post(
            "http://localhost:11434/api/chat",
            json={
                "model": "llama3", # User can change this to their local model
                "messages": messages,
                "stream": False
            },
            timeout=15
        )
        
        if response.status_code == 200:
            result = response.json()
            ai_msg = result.get("message", {}).get("content", "I'm sorry, I couldn't process that.")
            return {"status": "success", "response": ai_msg}
        else:
            return {"status": "error", "message": f"Ollama error: {response.status_code}"}
            
    except requests.exceptions.ConnectionError:
        return {"status": "error", "message": "Ollama not reachable. Ensure it's running locally on port 11434."}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.get("/health")
def health_check():
    return {"status": "active", "model_loaded": engine is not None}




# --- Doctor Module Endpoints ---

# --- Auth Endpoints ---

class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    password: str
    name: str

@app.post("/login")
async def login(creds: LoginRequest):
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE username=? AND password=?", (creds.username, creds.password))
    user = c.fetchone()
    conn.close()
    
    if user:
        return {
            "status": "success", 
            "token": "fake-jwt-token", 
            "name": user['name'],
            "role": user['role'],
            "user_id": user['id']
        }
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@app.post("/register")
async def register(creds: RegisterRequest):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    try:
        c.execute("INSERT INTO users (username, password, role, name) VALUES (?, ?, ?, ?)",
                  (creds.username, creds.password, 'patient', creds.name))
        conn.commit()
        return {"status": "success", "message": "Account created"}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Username already exists")
    finally:
        conn.close()

@app.get("/doctor/queue")
async def get_queue():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    # Priority Order: High > Medium > Low, then by time
    # We use a CASE statement for custom sorting
    query = '''
        SELECT * FROM patients 
        WHERE visit_status = 'Waiting' 
        ORDER BY 
            CASE risk_level 
                WHEN 'High' THEN 1 
                WHEN 'Medium' THEN 2 
                WHEN 'Low' THEN 3 
                ELSE 4 
            END ASC,
            timestamp ASC
    '''
    c.execute(query)
    patients = [dict(row) for row in c.fetchall()]
    conn.close()
    return patients

@app.post("/doctor/next")
async def next_patient():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    # Find next patient
    query = '''
        SELECT id FROM patients 
        WHERE visit_status = 'Waiting' 
        ORDER BY 
            CASE risk_level 
                WHEN 'High' THEN 1 
                WHEN 'Medium' THEN 2 
                WHEN 'Low' THEN 3 
                ELSE 4 
            END ASC,
            timestamp ASC
        LIMIT 1
    '''
    c.execute(query)
    row = c.fetchone()
    
    if row:
        pid = row['id']
        c.execute("UPDATE patients SET visit_status='Consulting' WHERE id=?", (pid,))
        conn.commit()
        
        # Return the patient details
        c.execute("SELECT * FROM patients WHERE id=?", (pid,))
        patient = dict(c.fetchone())
        conn.close()
        return {"status": "success", "patient": patient}
    else:
        conn.close()
        return {"status": "empty", "message": "No patients in waiting queue."}

@app.post("/doctor/complete/{id}")
async def complete_patient(id: int):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("UPDATE patients SET visit_status='Completed' WHERE id=?", (id,))
    conn.commit()
    conn.close()
    return {"status": "success"}


# Mount static files for Frontend (Must be last to avoid shadowing API routes)
app.mount("/", StaticFiles(directory="static", html=True), name="static")

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
