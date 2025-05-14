import csv
import os
import logging
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
        self.logger = logging.getLogger(__name__)
    
    def _safe_open_csv(self, file_name: str):
        """Safely attempt to open CSV files with proper error handling"""
        file_path = os.path.join(self.data_dir, file_name)
        try:
            # Try the direct path first
            if os.path.exists(file_path):
                return open(file_path, 'r')
            
            # If not found, try to find it relative to current directory
            current_dir = os.path.dirname(os.path.abspath(__file__))
            absolute_path = os.path.abspath(os.path.join(current_dir, "../../../datasets", file_name))
            
            self.logger.info(f"Attempting to open file: {absolute_path}")
            if os.path.exists(absolute_path):
                return open(absolute_path, 'r')
            
            # Last resort: try to find it anywhere in the workspace
            for root, _, files in os.walk(os.path.abspath(os.path.join(current_dir, "../../.."))):
                if file_name in files:
                    found_path = os.path.join(root, file_name)
                    self.logger.info(f"Found file at: {found_path}")
                    return open(found_path, 'r')
                    
            raise FileNotFoundError(f"Could not find {file_name} in any location")
            
        except Exception as e:
            self.logger.error(f"Error opening {file_name}: {str(e)}")
            # Return empty data rather than crashing
            return None
    
    def load_teachers(self) -> List[Teacher]:
        """Load teacher data from CSV"""
        teachers = []
        
        file_handle = self._safe_open_csv("teachers.csv")
        if not file_handle:
            self.logger.warning("Returning empty teachers list due to file access error")
            return teachers
            
        with file_handle:
            reader = csv.DictReader(file_handle)
            for row in reader:
                try:
                    # Parse subjects
                    subjects = [s.strip() for s in row.get('subjects', '').split(',') if s.strip()]
                    
                    # Parse unavailable slots
                    unavailable_slots = []
                    if row.get('unavailable_slots'):
                        for slot_str in row['unavailable_slots'].split(','):
                            if '-' in slot_str:
                                parts = slot_str.split('-')
                                if len(parts) >= 3:
                                    day, start, end = parts[0], parts[1], parts[2]
                                    unavailable_slots.append({
                                        'day': day,
                                        'start_time': start,
                                        'end_time': end
                                    })
                    
                    teacher = Teacher(
                        id=row.get('teacher_id', f"t{len(teachers)+1}"),
                        name=row.get('name', f"Teacher {len(teachers)+1}"),
                        subjects=subjects,
                        max_hours_per_day=int(row.get('max_hours_per_day', 6)),
                        max_consecutive_classes=int(row.get('max_consecutive_classes', 3)),
                        unavailable_slots=unavailable_slots
                    )
                    teachers.append(teacher)
                except Exception as e:
                    self.logger.error(f"Error parsing teacher row: {str(e)}")
        
        return teachers
    
    def load_rooms(self) -> List[Room]:
        """Load room data from CSV"""
        rooms = []
        
        file_handle = self._safe_open_csv("rooms.csv")
        if not file_handle:
            self.logger.warning("Returning empty rooms list due to file access error")
            return rooms
            
        with file_handle:
            reader = csv.DictReader(file_handle)
            for row in reader:
                try:
                    # Parse features
                    features = []
                    if row.get('features'):
                        features = [f.strip() for f in row['features'].split(',') if f.strip()]
                    
                    room = Room(
                        id=row.get('room_id', f"r{len(rooms)+1}"),
                        name=row.get('name', f"Room {len(rooms)+1}"),
                        capacity=int(row.get('capacity', 30)),
                        features=features
                    )
                    rooms.append(room)
                except Exception as e:
                    self.logger.error(f"Error parsing room row: {str(e)}")
        
        return rooms
    
    def load_subjects(self) -> List[Subject]:
        """Load subject data from CSV"""
        subjects = []
        
        file_handle = self._safe_open_csv("subjects.csv")
        if not file_handle:
            self.logger.warning("Returning empty subjects list due to file access error")
            return subjects
            
        with file_handle:
            reader = csv.DictReader(file_handle)
            for row in reader:
                try:
                    # Parse required features
                    requires_features = []
                    if row.get('requires_features'):
                        requires_features = [f.strip() for f in row['requires_features'].split(',') if f.strip()]
                    
                    # Parse preferred teachers
                    preferred_teachers = []
                    if row.get('preferred_teachers'):
                        preferred_teachers = [t.strip() for t in row['preferred_teachers'].split(',') if t.strip()]
                    
                    subject = Subject(
                        id=row.get('subject_id', f"s{len(subjects)+1}"),
                        name=row.get('name', f"Subject {len(subjects)+1}"),
                        hours_per_week=int(row.get('hours_per_week', 4)),
                        requires_features=requires_features,
                        preferred_teachers=preferred_teachers
                    )
                    subjects.append(subject)
                except Exception as e:
                    self.logger.error(f"Error parsing subject row: {str(e)}")
        
        return subjects
    
    def load_classes(self) -> List[Class]:
        """Load class data from CSV"""
        classes = []
        
        file_handle = self._safe_open_csv("classes.csv")
        if not file_handle:
            self.logger.warning("Returning empty classes list due to file access error")
            return classes
            
        with file_handle:
            reader = csv.DictReader(file_handle)
            for row in reader:
                try:
                    # Parse subjects
                    subjects = []
                    if row.get('subjects'):
                        subjects = [s.strip() for s in row['subjects'].split(',') if s.strip()]
                    
                    class_obj = Class(
                        id=row.get('class_id', f"c{len(classes)+1}"),
                        name=row.get('name', f"Class {len(classes)+1}"),
                        subjects=subjects,
                        students_count=int(row.get('students_count', 25))
                    )
                    classes.append(class_obj)
                except Exception as e:
                    self.logger.error(f"Error parsing class row: {str(e)}")
        
        return classes
    
    def load_all_data(self) -> Dict[str, List[Any]]:
        """Load all dataset files"""
        try:
            return {
                'teachers': self.load_teachers(),
                'rooms': self.load_rooms(),
                'subjects': self.load_subjects(),
                'classes': self.load_classes()
            }
        except Exception as e:
            self.logger.error(f"Error loading all data: {str(e)}")
            # Return empty data rather than crashing
            return {
                'teachers': [],
                'rooms': [],
                'subjects': [],
                'classes': []
            } 