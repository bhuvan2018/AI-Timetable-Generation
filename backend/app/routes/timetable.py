from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any

from ..services.timetable_service import TimetableService
from ..schemas.timetable import (
    TimetableGenerationRequest, GeneratedTimetable, 
    UpdateTimetableRequest, TimetableAnalytics
)

router = APIRouter(
    prefix="/timetable",
    tags=["timetable"],
    responses={404: {"description": "Not found"}},
)

def get_timetable_service():
    """Dependency injection for TimetableService"""
    return TimetableService()

@router.post("/generate", response_model=Dict[str, Any])
async def generate_timetable(
    request: TimetableGenerationRequest,
    time_limit_seconds: int = 60,
    service: TimetableService = Depends(get_timetable_service)
):
    """
    Generate a new timetable based on the provided constraints and requirements
    """
    result = await service.generate_timetable(request, time_limit_seconds)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.get("/{timetable_id}", response_model=GeneratedTimetable)
async def get_timetable(
    timetable_id: str,
    service: TimetableService = Depends(get_timetable_service)
):
    """
    Retrieve a previously generated timetable by ID
    """
    timetable = await service.get_timetable(timetable_id)
    if not timetable:
        raise HTTPException(status_code=404, detail=f"Timetable with ID {timetable_id} not found")
    return timetable

@router.put("/update", response_model=Dict[str, Any])
async def update_timetable(
    request: UpdateTimetableRequest,
    service: TimetableService = Depends(get_timetable_service)
):
    """
    Update a previously generated timetable
    """
    result = await service.update_timetable(request)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.get("/{timetable_id}/analytics", response_model=TimetableAnalytics)
async def get_timetable_analytics(
    timetable_id: str,
    service: TimetableService = Depends(get_timetable_service)
):
    """
    Get analytics for a timetable
    """
    try:
        return await service.analyze_timetable(timetable_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) 