from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as api_router
from app.core.config import CORS_ORIGINS
from app.ml.synthetic_generator import populate_sample_datasets

app = FastAPI(
    title="MedFault AI - Medical Device Fault Detection & ML API",
    description="Backend microservice providing deep learning anomaly detection for medical device sensor data and patient stability risk modeling.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.on_event("startup")
async def startup_event():
    # Ensure sample datasets exist on startup
    populate_sample_datasets()

@app.get("/")
def root():
    return {
        "message": "MedFault AI Backend & Deep Learning API is running.",
        "documentation": "/docs",
        "health": "/api/health"
    }
