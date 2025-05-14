import csv
import os
from typing import List, Dict, Any, Optional
from pathlib import Path

from ..schemas.timetable import (
    Teacher, Room, Subject, Class,
    TimeSlot
)

class CSVDataLoader:
    """
    Loads and parses CSV data files for the AI Timetable Generator
    """
    
    def __init__(self, data_dir: str = "../../datasets"):
        self.data_dir = data_dir
    
    def load_teachers(self) -> List[Teacher]:
        """Load teacher data from CSV"""
        teachers = []
        file_path = os.path.join(self.data_dir, "teachers.csv")
        
        with open(file_path, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Parse subjects
                subjects = [s.strip() for s in row['subjects'].split(',')]
                
                # Parse unavailable slots
                unavailable_slots = []
                if row['unavailable_slots']:
                    for slot_str in row['unavailable_slots'].split(','):
                        day, start, end = slot_str.split('-')
                        unavailable_slots.append({
                            'day': day,
                            'start_time': start,
                            'end_time': end
                        })
                
                teacher = Teacher(
                    id=row['teacher_id'],
                    name=row['name'],
                    subjects=subjects,
                    max_hours_per_day=int(row['max_hours_per_day']),
                    max_consecutive_classes=int(row['max_consecutive_classes']),
                    unavailable_slots=unavailable_slots
                )
                teachers.append(teacher)
        
        return teachers
    
    def load_rooms(self) -> List[Room]:
        """Load room data from CSV"""
        rooms = []
        file_path = os.path.join(self.data_dir, "rooms.csv")
        
        with open(file_path, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Parse features
                features = []
                if row['features']:
                    features = [f.strip() for f in row['features'].split(',')]
                
                room = Room(
                    id=row['room_id'],
                    name=row['name'],
                    capacity=int(row['capacity']),
                    features=features
                )
                rooms.append(room)
        
        return rooms
    
    def load_subjects(self) -> List[Subject]:
        """Load subject data from CSV"""
        subjects = []
        file_path = os.path.join(self.data_dir, "subjects.csv")
        
        with open(file_path, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Parse required features
                requires_features = []
                if row['requires_features']:
                    requires_features = [f.strip() for f in row['requires_features'].split(',')]
                
                # Parse preferred teachers
                preferred_teachers = []
                if row['preferred_teachers']:
                    preferred_teachers = [t.strip() for t in row['preferred_teachers'].split(',')]
                
                subject = Subject(
                    id=row['subject_id'],
                    name=row['name'],
                    hours_per_week=int(row['hours_per_week']),
                    requires_features=requires_features,
                    preferred_teachers=preferred_teachers
                )
                subjects.append(subject)
        
        return subjects
    
    def load_classes(self) -> List[Class]:
        """Load class data from CSV"""
        classes = []
        file_path = os.path.join(self.data_dir, "classes.csv")
        
        with open(file_path, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Parse subjects
                subjects = []
                if row['subjects']:
                    subjects = [s.strip() for s in row['subjects'].split(',')]
                
                class_obj = Class(
                    id=row['class_id'],
                    name=row['name'],
                    subjects=subjects,
                    students_count=int(row['students_count'])
                )
                classes.append(class_obj)
        
        return classes
    
    def load_all_data(self) -> Dict[str, List[Any]]:
        """Load all dataset files"""
        return {
            'teachers': self.load_teachers(),
            'rooms': self.load_rooms(),
            'subjects': self.load_subjects(),
            'classes': self.load_classes()
        } 