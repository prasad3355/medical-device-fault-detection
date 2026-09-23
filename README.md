# Predictive Fault Detection in Medical Devices Using Sensor Data and Deep Learning

## Project Overview

This project is a software-based medical analytics system designed to detect abnormal and fault patterns in medical-device sensor data using a deep learning pipeline. It provides a comprehensive, interactive dashboard for clinicians and technicians to conduct in-depth data analysis. 

The system clearly distinguishes between two critical aspects of monitoring:
- **Medical Device Fault/Anomaly Detection:** Identifying hardware or sensor malfunctions (e.g., transducer anomalies, signal dropping, or noise artifact injection) before they impact patient care.
- **Patient Risk Analysis:** Detecting physiological irregularities or critical stability deviations from the ingested telemetry data.

*Note: This system serves strictly as a decision-support and demonstration interface. It is **not** an autonomous medical diagnosis system.*

## Project Workflow

```text
       CSV / Excel Dataset
                ↓
         Data Validation
                ↓
       Data Preprocessing
                ↓
 CNN / LSTM Deep Learning Model
                ↓
   Fault / Anomaly Detection
                ↓
       Analysis & Results
                ↓
      Dashboard / Reports
```

## Key Features

- Dataset upload
- Dataset validation
- Medical device anomaly/fault detection
- Patient risk analysis module
- Interactive analytics dashboard
- Sensor intelligence visualization
- Prediction history
- Model performance visualization
- ML pipeline visualization
- Analysis reports
- Responsive dark medical analytics UI

## Technology Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- Recharts
- Lucide React
- Motion / animation library

### Backend
*Backend and API integration are handled separately by the backend engineering team.*

### AI/ML
- CNN (Convolutional Neural Networks)
- LSTM (Long Short-Term Memory Networks)
- Data preprocessing
- Model evaluation
- Anomaly/fault detection

### Database / Data
*Currently utilizing static mock data for front-end demonstration. Database/storage architecture will be finalized and integrated by the backend team.*

## Frontend Architecture

```text
frontend/
├── app/
│   ├── dashboard/
│   ├── upload/
│   ├── analysis/
│   ├── history/
│   ├── model-performance/
│   ├── ml-pipeline/
│   └── about/
├── components/
│   ├── dashboard/
│   ├── upload/
│   ├── analysis/
│   ├── history/
│   ├── models/
│   ├── pipeline/
│   ├── about/
│   ├── layout/
│   └── ui/
├── data/
├── lib/
├── types/
└── public/
```

## Application Pages

| Page | Purpose |
|---|---|
| Dashboard | Overall system analytics and status |
| Upload Dataset | Upload and inspect CSV/Excel datasets |
| Analysis & Results | Display fault/anomaly and risk analysis |
| Prediction History | Previous prediction records |
| Model Performance | Model metrics and performance |
| ML Pipeline | Visualization of the ML workflow |
| About Project | Project information and architecture |

## Team

- **Prasad Swain** — Frontend + Deployment
- **Susil Kumar Sahu** — Backend + API
- **Mahesh Kumar Bhuyan** — Data Engineering
- **Nigamananda Parida** — AI/ML
- **Advisor:** Prof. Rabindra Kumar Shial

## Development Branches

The repository utilizes the following branch topology for structured collaboration:

```text
main
├── feat/frontend
├── feat/backend
├── feat/data
└── feat/ai-ml
```

**Development Workflow Rule:**
Feature branches → Pull Request → Review/Testing → main

## Getting Started

To run the Next.js frontend application locally:

```bash
cd frontend
npm install
npm run dev
```

Then, open your browser and navigate to:
http://localhost:3000

## Production Build

To generate an optimized production build for the frontend:

```bash
cd frontend
npm run build
```

## Deployment

The frontend application is natively designed for serverless deployment on **Vercel**. 
The deployment targets the directory:
`frontend/`

## Current Status

- **Frontend UI completed.**
- **Next.js migration completed.** (All static components ported to Next.js App Router).
- **All frontend routes implemented.**
- **Production build verified successfully.**
- Backend/ML integration will be connected through the finalized API contract in a future milestone.

## Important Scope

This project is strictly **software and data-driven.**

It explicitly **DOES NOT** require:
- ESP32 or Raspberry Pi
- Arduino
- MQTT Protocols
- Physical IoT sensors
- Hardware control

Furthermore:
- No authentication is currently required for system operation.
- No payment, subscription, or billing system is part of the project scope.

## Disclaimer

This system is intended for **academic, research, and demonstration purposes only**. It should absolutely not be treated as a substitute for professional medical diagnosis, certified medical hardware, or clinical decision-making protocols.