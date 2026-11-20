# Predictive Fault Detection in Medical Devices Using Sensor Data and Deep Learning

## Project Overview

This project is a software-based medical analytics system designed to detect abnormal and fault patterns in medical-device sensor data using a deep learning pipeline. It provides a comprehensive, interactive dashboard for clinicians and biomedical technicians to conduct in-depth data analysis. 

The system clearly distinguishes between two critical aspects of monitoring:
- **Medical Device Fault/Anomaly Detection:** Identifying hardware or sensor malfunctions (e.g., transducer decoupling, optical decay, motor occlusion, or noise artifact injection) before they impact clinical telemetry.
- **Patient Risk Analysis:** Detecting physiological irregularities or critical stability deviations (e.g., hypoxia, tachycardia, bradycardia) from ingested telemetry data.

*Note: This system serves strictly as a decision-support and demonstration interface. It is **not** an autonomous medical diagnosis system.*

## Project Workflow

```text
       CSV / Excel Dataset
                ↓
    Data Validation & Schema
                ↓
 Data Preprocessing (Savitzky-Golay / SQI)
                ↓
  1D-CNN + BiLSTM + Isolation Forest
                ↓
Fault / Anomaly & Patient Risk Detection
                ↓
       Analysis & Results
                ↓
       Dashboard / Reports
```

## Key Features

- **Multi-Format Dataset Ingestion:** Drag-and-drop support for CSV, XLS, and XLSX medical telemetry files.
- **Pre-Inference Validation:** Automatic schema mapping, sampling rate estimation, missing value interpolation, and IEEE-754 precision checks.
- **Signal Quality Index (SQI):** Evaluates sensor coupling stability to distinguish probe motion artifacts from true physiological distress.
- **Dual-Path Inference:**
  - `dual`: Concurrent prediction of both device hardware fault and patient risk.
  - `fault_only`: Focused evaluation of transducer noise, lead detachment, and electrical drift.
  - `risk_only`: Focused evaluation of patient vital stability flags.
- **Interactive Telemetry Visualizations:** Multi-channel Recharts visualization with highlighted anomaly intervals.
- **Persistent Audit Log:** SQLite persistence ensuring full report fidelity after page reloads.
- **Empirical Benchmarks:** 10-fold cross validation comparison across 1D-CNN + BiLSTM, Random Forest, SVM, and Isolation Forest.

## Technology Stack

### Frontend
- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19, Tailwind CSS
- **Visualizations:** Recharts, Lucide React
- **Language:** TypeScript

### Backend
- **Framework:** FastAPI
- **Server:** Uvicorn
- **Persistence:** SQLite (`backend/data/storage/med_fault.db`)
- **Data Ingestion:** Pandas, Python-Multipart

### AI / ML
- **Temporal Deep Learning:** 1D-CNN (Local Feature Extraction) + BiLSTM (Bidirectional Sequential State Updates)
- **Outlier Head:** Scikit-Learn Isolation Forest Ensemble
- **Digital Signal Processing:** SciPy (Savitzky-Golay filtering, baseline correction, Signal Quality Index)

---

## Getting Started

### 1. Prerequisites
- **Node.js:** v18.0.0 or later (v20+ recommended)
- **Python:** v3.10 or later

### 2. Environment Configuration
Create or update `frontend/.env.local` (default fallback is `http://localhost:8000/api`):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 3. Dependency Installation

```bash
# Install frontend packages
cd frontend
npm install
cd ..

# Install backend packages
pip install -r backend/requirements.txt
```

### 4. Running the Project (One-Command Startup)

To run both the Next.js frontend (port 3000) and the FastAPI backend (port 8000) simultaneously:

```bash
npm run dev:all
```

Alternatively, you can start the services in separate terminals:

```bash
# Terminal 1: Backend
npm run dev:backend
# (or: cd backend && python run.py)

# Terminal 2: Frontend
npm run dev
# (or: cd frontend && npm run dev)
```

Open your browser and navigate to:
- **Frontend Dashboard:** [http://localhost:3000](http://localhost:3000)
- **Backend API & Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Quick Demo Walkthrough

1. Open **[http://localhost:3000/upload](http://localhost:3000/upload)**.
2. Under **"benchmark clinical telemetry dataset"**, select `ICU_MultiParameter_Telemetry_A4.csv`.
3. Select **"Dual Multi-Task Inference"** as the execution mode.
4. Click **"Execute Deep Learning Pipeline"**.
5. You will be redirected to `/analysis?id=<run_id>`. Inspect:
   - Overall Device Status (`Possible Anomaly`) and Patient Risk (`Moderate`).
   - The multi-channel telemetry chart with flagged anomaly intervals (SpO2 desaturation at 10:33–10:41 and thermal drift at 11:35–11:42).
6. **Refresh the page**: Notice that the full report, telemetry series, and findings are safely loaded from the persistent SQLite database.
7. Open **Prediction History** ([http://localhost:3000/history](http://localhost:3000/history)) to view the saved run and reopen its report.

---

## Production Build

To verify the frontend production build:

```bash
npm run build
```

---

## Disclaimer

This system is intended for **academic, research, and demonstration purposes only**. It should not be treated as a substitute for professional medical diagnosis, certified medical hardware, or clinical decision-making protocols.
