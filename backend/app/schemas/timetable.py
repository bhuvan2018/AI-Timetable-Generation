from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import time, datetime

class TimeSlot(BaseModel):
    start_time: time
    end_time: time
    
    class Config:
        json_encoders = {
            time: lambda t: t.strftime("%H:%M")
        }

class Teacher(BaseModel):
    id: str
    name: str
    subjects: List[str]
    unavailable_slots: List[TimeSlot] = []
    max_hours_per_day: int = 6
    max_consecutive_classes: int = 3

class Room(BaseModel):
    id: str
    name: str
    capacity: int
    available_slots: List[TimeSlot] = []
    features: List[str] = []  # like "projector", "lab equipment", etc.

class Subject(BaseModel):
    id: str
    name: str
    hours_per_week: int
    requires_features: List[str] = []  # Room features required for this subject
    preferred_teachers: List[str] = []

class Class(BaseModel):
    id: str
    name: str
    subjects: List[str]
    students_count: int
    
class TimetableConstraints(BaseModel):
    max_hours_per_day: int = 8
    days_per_week: int = 5
    break_slots: List[TimeSlot] = []
    allow_split_subjects: bool = False  # If hours for a subject can be split across days
    
class TimetableGenerationRequest(BaseModel):
    teachers: List[Teacher]
    rooms: List[Room]
    subjects: List[Subject]
    classes: List[Class]
    constraints: TimetableConstraints
    
class TimetableEntry(BaseModel):
    day: int
    slot: TimeSlot
    subject_id: str
    teacher_id: str
    room_id: str
    class_id: str

class ClassTimetable(BaseModel):
    class_id: str
    class_name: str
    entries: List[TimetableEntry]
    
class TeacherTimetable(BaseModel):
    teacher_id: str
    teacher_name: str
    entries: List[TimetableEntry]
    
class GeneratedTimetable(BaseModel):
    class_timetables: Dict[str, ClassTimetable]
    teacher_timetables: Dict[str, TeacherTimetable]
    room_allocations: Dict[str, List[TimetableEntry]]
    conflicts: List[str] = []
    stats: Dict[str, float] = {}
    
class UpdateTimetableRequest(BaseModel):
    timetable_id: str
    updates: List[Dict] # Changes to be made to the timetable
    
class TimetableAnalytics(BaseModel):
    teacher_utilization: Dict[str, float]
    room_utilization: Dict[str, float]
    free_periods_distribution: Dict[str, int]
    efficiency_score: float 