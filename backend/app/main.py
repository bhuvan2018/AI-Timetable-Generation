from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging
import os

from .routes import timetable, ml, database

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("ai-timetable")
logger.setLevel(logging.INFO)

# Check for datasets directory
current_dir = os.path.dirname(os.path.abspath(__file__))
datasets_dir = os.path.abspath(os.path.join(current_dir, "../../datasets"))
if not os.path.exists(datasets_dir):
    logger.warning(f"Datasets directory not found at {datasets_dir}")
    # Try to create datasets directory
    try:
        os.makedirs(datasets_dir, exist_ok=True)
        logger.info(f"Created datasets directory at {datasets_dir}")
    except Exception as e:
        logger.error(f"Failed to create datasets directory: {str(e)}")

# Create exports directory if it doesn't exist
exports_dir = os.path.abspath(os.path.join(current_dir, "../../exports"))
try:
    os.makedirs(exports_dir, exist_ok=True)
    logger.info(f"Ensured exports directory exists at {exports_dir}")
except Exception as e:
    logger.error(f"Failed to create exports directory: {str(e)}")

app = FastAPI(
    title="AI Timetable Generator",
    description="Intelligent system for generating optimized school/college timetables",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(timetable.router)
app.include_router(ml.router)
app.include_router(database.router)

@app.get("/")
async def root():
    return {"message": "Welcome to AI Timetable Generator API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 