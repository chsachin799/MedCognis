# MedCognis Health - Run Instructions

This guide provides step-by-step instructions to run the MedCognis Health project manually on your local machine.

## Prerequisites

Ensure you have the following installed:
1.  **Python** (v3.10 or higher)
2.  **Node.js** (v18.0.0 or higher)
3.  **Git**
4.  **Ollama** (Optional, for AI Chat features)

---

## 🚀 Step 1: Start the Backend (FastAPI)

The backend handles the AI logic, database, and API endpoints.

1.  Open a **Terminal** (Command Prompt or PowerShell).
2.  Navigate to the project's `Models` directory:
    ```powershell
    cd path/to/medcogniss/Models
    ```
3.  (Optional but Recommended) Activate your virtual environment if you created one:
    ```powershell
    # Windows
    .venv\Scripts\activate
    # Mac/Linux
    source .venv/bin/activate
    ```
4.  Run the application server:
    ```powershell
    python app.py
    ```
    *You should see output indicating the server is running on `http://0.0.0.0:8000`.*

---

## 🌐 Step 2: Start the Frontend (Next.js)

The frontend is the web interface you interact with.

1.  Open a **New Terminal** window (do not close the backend terminal).
2.  Navigate to the project root directory:
    ```powershell
    cd path/to/medcogniss
    ```
3.  Install dependencies (only if running for the first time):
    ```powershell
    npm install
    ```
4.  Start the development server:
    ```powershell
    npm run dev
    ```
    *You should see output indicating the server is ready on `http://localhost:3000`.*

---

## ✅ Step 3: Access the Application

1.  Open your web browser (Chrome, Edge, etc.).
2.  Go to **[http://localhost:3000](http://localhost:3000)**.

---

## 🛠️ Troubleshooting

*   **Backend Address:** If the frontend cannot connect to the backend, ensure the backend is running on port `8000`.
*   **Dependencies:** If you see "Module not found" errors:
    *   Backend: Run `pip install -r requirements.txt` in the `Models` folder.
    *   Frontend: Run `npm install` in the root folder.
*   **Ollama Error:** If the AI chat fails, make sure Ollama is running (`ollama serve`).

## ⚠️ Common Issues
*   **Port Conflicts:** Ensure ports 3000 and 8000 are not being used by other applications.
