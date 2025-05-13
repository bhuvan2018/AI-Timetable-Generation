from typing import List, Dict, Optional
import uuid
from datetime import datetime

from ..core.optimizer import TimetableOptimizer
from ..schemas.timetable import (
    Teacher, Room, Subject, Class, TimeSlot, 
    TimetableConstraints, TimetableEntry, GeneratedTimetable,
    TimetableGenerationRequest, UpdateTimetableRequest, TimetableAnalytics
)

class TimetableService:
    """Service layer for timetable operations"""
    
    def __init__(self):
        self.optimizer = TimetableOptimizer()
        # In a real implementation, this would be a database
        self.saved_timetables: Dict[str, GeneratedTimetable] = {}
    
    async def generate_timetable(
        self, request: TimetableGenerationRequest, time_limit_seconds: int = 60
    ) -> Dict[str, str | GeneratedTimetable]:
        """
        Generate a timetable based on the given constraints and requirements
        
        Args:
            request: The timetable generation request
            time_limit_seconds: Time limit for the solver
            
        Returns:
            Dictionary containing the timetable ID and the generated timetable
        """
        # Validate input data
        # This is a basic validation; in a real system, we would do more extensive validation
        if not request.teachers:
            return {"error": "No teachers provided"}
        if not request.rooms:
            return {"error": "No rooms provided"}
        if not request.subjects:
            return {"error": "No subjects provided"}
        if not request.classes:
            return {"error": "No classes provided"}
            
        # Generate the timetable
        timetable = self.optimizer.solve(
            teachers=request.teachers,
            rooms=request.rooms,
            subjects=request.subjects,
            classes=request.classes,
            constraints=request.constraints,
            time_limit_seconds=time_limit_seconds
        )
        
        # Save the timetable
        timetable_id = str(uuid.uuid4())
        self.saved_timetables[timetable_id] = timetable
        
        return {"id": timetable_id, "timetable": timetable}
    
    async def get_timetable(self, timetable_id: str) -> Optional[GeneratedTimetable]:
        """
        Get a previously generated timetable by ID
        
        Args:
            timetable_id: The ID of the timetable to retrieve
            
        Returns:
            The timetable if found, None otherwise
        """
        return self.saved_timetables.get(timetable_id)
    
    async def update_timetable(
        self, request: UpdateTimetableRequest
    ) -> Dict[str, str | GeneratedTimetable]:
        """
        Update a previously generated timetable
        
        Args:
            request: The update request
            
        Returns:
            Dictionary containing the timetable ID and the updated timetable
        """
        timetable_id = request.timetable_id
        if timetable_id not in self.saved_timetables:
            return {"error": f"Timetable with ID {timetable_id} not found"}
        
        # Get the existing timetable
        timetable = self.saved_timetables[timetable_id]
        
        # Apply updates (this is a simplified version)
        # In a real system, we would have more complex update logic
        for update in request.updates:
            # Example update: {"type": "move_class", "class_id": "c1", "from": {...}, "to": {...}}
            if update.get("type") == "move_class":
                class_id = update.get("class_id")
                from_day = update.get("from", {}).get("day")
                from_slot = update.get("from", {}).get("slot")
                to_day = update.get("to", {}).get("day")
                to_slot = update.get("to", {}).get("slot")
                
                # Find the entry to move
                if class_id in timetable.class_timetables:
                    class_tt = timetable.class_timetables[class_id]
                    for i, entry in enumerate(class_tt.entries):
                        if entry.day == from_day and entry.slot == from_slot:
                            # Update the entry
                            class_tt.entries[i].day = to_day
                            class_tt.entries[i].slot = to_slot
                            break
        
        # Save the updated timetable
        self.saved_timetables[timetable_id] = timetable
        
        return {"id": timetable_id, "timetable": timetable}
    
    async def analyze_timetable(self, timetable_id: str) -> TimetableAnalytics:
        """
        Analyze a timetable and generate statistics
        
        Args:
            timetable_id: The ID of the timetable to analyze
            
        Returns:
            TimetableAnalytics object with statistics
        """
        if timetable_id not in self.saved_timetables:
            raise ValueError(f"Timetable with ID {timetable_id} not found")
        
        timetable = self.saved_timetables[timetable_id]
        
        # Calculate teacher utilization
        teacher_utilization = {}
        for teacher_id, teacher_tt in timetable.teacher_timetables.items():
            # Simple utilization: number of classes / total possible slots
            total_slots = 5 * 8  # Assuming 5 days, 8 hours per day
            teacher_utilization[teacher_id] = len(teacher_tt.entries) / total_slots
        
        # Calculate room utilization
        room_utilization = {}
        for room_id, room_entries in timetable.room_allocations.items():
            total_slots = 5 * 8  # Assuming 5 days, 8 hours per day
            room_utilization[room_id] = len(room_entries) / total_slots
        
        # Calculate free periods distribution
        free_periods = {}
        for class_id, class_tt in timetable.class_timetables.items():
            # Count free periods for each class
            # This is a simplification - in a real system, we would have more detailed analysis
            total_slots = 5 * 8  # Assuming 5 days, 8 hours per day
            free_periods[class_id] = total_slots - len(class_tt.entries)
        
        # Calculate overall efficiency score (simple average of utilizations)
        efficiency_score = (sum(teacher_utilization.values()) + sum(room_utilization.values())) / (
            len(teacher_utilization) + len(room_utilization)
        ) if teacher_utilization and room_utilization else 0
        
        return TimetableAnalytics(
            teacher_utilization=teacher_utilization,
            room_utilization=room_utilization,
            free_periods_distribution=free_periods,
            efficiency_score=efficiency_score
        ) 