from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List

from ..ml.timetable_optimizer_ml import TimetableOptimizerML
from ..services.timetable_service import TimetableService
from ..schemas.timetable import Teacher, Room, Subject, Class

router = APIRouter(
    prefix="/ml",
    tags=["machine learning"],
    responses={404: {"description": "Not found"}},
)

def get_timetable_service():
    """Dependency injection for TimetableService"""
    return TimetableService()

def get_ml_optimizer():
    """Dependency injection for TimetableOptimizerML"""
    return TimetableOptimizerML()

@router.get("/{timetable_id}/suggestions", response_model=List[Dict[str, Any]])
async def get_timetable_suggestions(
    timetable_id: str,
    timetable_service: TimetableService = Depends(get_timetable_service),
    ml_optimizer: TimetableOptimizerML = Depends(get_ml_optimizer)
):
    """
    Get ML-based suggestions for improving a timetable
    """
    # Get the timetable
    timetable = await timetable_service.get_timetable(timetable_id)
    if not timetable:
        raise HTTPException(status_code=404, detail=f"Timetable with ID {timetable_id} not found")
    
    # Generate suggestions
    suggestions = ml_optimizer.suggest_improvements(timetable)
    
    return suggestions

@router.post("/train")
async def train_ml_models(
    teachers: List[Teacher],
    rooms: List[Room],
    subjects: List[Subject],
    classes: List[Class],
    num_samples: int = 10,
    ml_optimizer: TimetableOptimizerML = Depends(get_ml_optimizer)
):
    """
    Train the ML models using synthetic data
    """
    # Generate synthetic training data
    timetables = ml_optimizer.generate_synthetic_training_data(
        teachers, rooms, subjects, classes, num_samples
    )
    
    # Train the models
    ml_optimizer.train_room_allocation_model(timetables)
    ml_optimizer.train_teacher_load_model(timetables)
    
    return {"status": "success", "message": f"Models trained on {num_samples} synthetic timetables"}

@router.post("/predict/room-optimization")
async def predict_room_optimization(
    timetable_id: str,
    timetable_service: TimetableService = Depends(get_timetable_service),
    ml_optimizer: TimetableOptimizerML = Depends(get_ml_optimizer)
):
    """
    Get room optimization suggestions for a timetable
    """
    # Get the timetable
    timetable = await timetable_service.get_timetable(timetable_id)
    if not timetable:
        raise HTTPException(status_code=404, detail=f"Timetable with ID {timetable_id} not found")
    
    # Extract features
    features = ml_optimizer._extract_features_from_timetable(timetable)
    
    # Check if model is trained
    if not ml_optimizer.room_allocation_model:
        raise HTTPException(status_code=400, detail="Room allocation model is not trained yet")
    
    # Predict optimal room utilization
    X = [[
        features["total_classes"],
        features["total_teachers"],
        sum(features["class_movements"].values()) / len(features["class_movements"]),
        0.0  # Std dev placeholder
    ]]
    
    predicted_utilization = ml_optimizer.room_allocation_model.predict(X)[0].tolist()
    
    # Compare with actual utilization
    room_ids = list(features["room_utilization"].keys())
    actual_utilization = [features["room_utilization"][room_id] for room_id in room_ids]
    
    return {
        "room_ids": room_ids,
        "actual_utilization": actual_utilization,
        "predicted_optimal_utilization": predicted_utilization
    } 