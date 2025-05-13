import numpy as np
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestRegressor
from typing import List, Dict, Any, Tuple
import pandas as pd
from datetime import datetime, time
import random

from ..schemas.timetable import GeneratedTimetable, Teacher, Room, Subject, Class

class TimetableOptimizerML:
    """
    Machine learning model for timetable optimization suggestions
    """
    
    def __init__(self):
        self.room_allocation_model = None
        self.teacher_load_model = None
    
    def _extract_features_from_timetable(
        self, timetable: GeneratedTimetable
    ) -> Dict[str, Any]:
        """
        Extract features from a timetable for use in machine learning models
        
        Args:
            timetable: The timetable to extract features from
            
        Returns:
            Dictionary of features
        """
        features = {}
        
        # Calculate teacher workload distribution
        teacher_loads = {}
        for teacher_id, teacher_tt in timetable.teacher_timetables.items():
            # Count classes per day
            classes_per_day = [0] * 5  # Assuming 5 days a week
            for entry in teacher_tt.entries:
                classes_per_day[entry.day] += 1
            
            # Calculate workload metrics
            teacher_loads[teacher_id] = {
                "total_classes": len(teacher_tt.entries),
                "max_classes_per_day": max(classes_per_day),
                "std_dev_classes": np.std(classes_per_day),
                "consecutive_classes": self._count_consecutive_classes(teacher_tt.entries)
            }
        
        features["teacher_loads"] = teacher_loads
        
        # Calculate room utilization
        room_utilization = {}
        for room_id, entries in timetable.room_allocations.items():
            room_utilization[room_id] = len(entries) / (5 * 8)  # Assuming 5 days, 8 hours per day
        
        features["room_utilization"] = room_utilization
        
        # Calculate class movement (how often classes change rooms)
        class_movements = {}
        for class_id, class_tt in timetable.class_timetables.items():
            # Sort entries by day and time
            sorted_entries = sorted(
                class_tt.entries,
                key=lambda e: (e.day, e.slot.start_time)
            )
            
            # Count room changes
            room_changes = 0
            prev_room = None
            prev_day = None
            for entry in sorted_entries:
                if prev_room and prev_day == entry.day and prev_room != entry.room_id:
                    room_changes += 1
                prev_room = entry.room_id
                prev_day = entry.day
            
            class_movements[class_id] = room_changes
        
        features["class_movements"] = class_movements
        
        # Calculate overall stats
        features["total_classes"] = sum(len(ct.entries) for ct in timetable.class_timetables.values())
        features["total_rooms"] = len(timetable.room_allocations)
        features["total_teachers"] = len(timetable.teacher_timetables)
        
        return features
    
    def _count_consecutive_classes(self, entries: List) -> int:
        """Count the maximum number of consecutive classes for a teacher"""
        # Group entries by day
        entries_by_day = {}
        for entry in entries:
            if entry.day not in entries_by_day:
                entries_by_day[entry.day] = []
            entries_by_day[entry.day].append(entry)
        
        # Sort entries in each day by time
        for day, day_entries in entries_by_day.items():
            entries_by_day[day] = sorted(
                day_entries,
                key=lambda e: e.slot.start_time
            )
        
        # Count consecutive classes
        max_consecutive = 0
        for day, day_entries in entries_by_day.items():
            current_consecutive = 1
            for i in range(1, len(day_entries)):
                # Check if classes are consecutive
                # This is a simplification - in reality, we'd need to check actual times
                prev_end = day_entries[i-1].slot.end_time
                current_start = day_entries[i].slot.start_time
                
                if current_start == prev_end:  # Simplified check
                    current_consecutive += 1
                else:
                    max_consecutive = max(max_consecutive, current_consecutive)
                    current_consecutive = 1
            
            max_consecutive = max(max_consecutive, current_consecutive)
        
        return max_consecutive
    
    def train_room_allocation_model(self, timetables: List[GeneratedTimetable]):
        """
        Train a model to predict optimal room allocations
        
        Args:
            timetables: List of timetables to train on
        """
        # Extract features from timetables
        features_list = []
        room_util_list = []
        
        for timetable in timetables:
            features = self._extract_features_from_timetable(timetable)
            features_list.append([
                features["total_classes"],
                features["total_teachers"],
                np.mean(list(features["class_movements"].values())),
                np.std(list(features["class_movements"].values()))
            ])
            room_util_list.append(list(features["room_utilization"].values()))
        
        # Convert to numpy arrays
        X = np.array(features_list)
        y = np.array(room_util_list)
        
        # Train model
        self.room_allocation_model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.room_allocation_model.fit(X, y)
    
    def train_teacher_load_model(self, timetables: List[GeneratedTimetable]):
        """
        Train a model to predict optimal teacher load distributions
        
        Args:
            timetables: List of timetables to train on
        """
        # Extract features and teacher loads
        features_list = []
        teacher_load_list = []
        
        for timetable in timetables:
            features = self._extract_features_from_timetable(timetable)
            
            # Extract teacher load features
            teacher_features = []
            for teacher_id, load in features["teacher_loads"].items():
                teacher_features.append([
                    load["total_classes"],
                    load["max_classes_per_day"],
                    load["std_dev_classes"],
                    load["consecutive_classes"]
                ])
            
            # Use clustering to group similar teacher loads
            if teacher_features:
                kmeans = KMeans(n_clusters=min(3, len(teacher_features)), random_state=42)
                clusters = kmeans.fit_predict(teacher_features)
                
                # Count teachers in each cluster
                cluster_counts = np.bincount(clusters, minlength=3)
                features_list.append(list(cluster_counts))
                
                # Calculate average load for each cluster
                cluster_loads = []
                for i in range(min(3, len(teacher_features))):
                    cluster_indices = np.where(clusters == i)[0]
                    if len(cluster_indices) > 0:
                        avg_load = np.mean([teacher_features[j][0] for j in cluster_indices])
                        cluster_loads.append(avg_load)
                    else:
                        cluster_loads.append(0)
                
                teacher_load_list.append(cluster_loads)
        
        # Convert to numpy arrays
        X = np.array(features_list)
        y = np.array(teacher_load_list)
        
        # Train model
        self.teacher_load_model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.teacher_load_model.fit(X, y)
    
    def suggest_improvements(
        self, timetable: GeneratedTimetable
    ) -> List[Dict[str, Any]]:
        """
        Suggest improvements for a timetable
        
        Args:
            timetable: The timetable to suggest improvements for
            
        Returns:
            List of improvement suggestions
        """
        suggestions = []
        features = self._extract_features_from_timetable(timetable)
        
        # Check for room optimization opportunities
        if self.room_allocation_model:
            # Create input features
            X = np.array([[
                features["total_classes"],
                features["total_teachers"],
                np.mean(list(features["class_movements"].values())),
                np.std(list(features["class_movements"].values()))
            ]])
            
            # Predict optimal room utilization
            predicted_room_util = self.room_allocation_model.predict(X)[0]
            
            # Compare with actual room utilization
            actual_room_util = list(features["room_utilization"].values())
            
            # Find rooms with significant deviation
            for i, (room_id, util) in enumerate(features["room_utilization"].items()):
                if i < len(predicted_room_util) and abs(util - predicted_room_util[i]) > 0.1:
                    if util < predicted_room_util[i]:
                        suggestions.append({
                            "type": "room_underutilized",
                            "room_id": room_id,
                            "current_utilization": util,
                            "suggested_utilization": predicted_room_util[i],
                            "recommendation": "Consider allocating more classes to this room"
                        })
                    else:
                        suggestions.append({
                            "type": "room_overutilized",
                            "room_id": room_id,
                            "current_utilization": util,
                            "suggested_utilization": predicted_room_util[i],
                            "recommendation": "Consider reducing the number of classes in this room"
                        })
        
        # Check for teacher load balancing opportunities
        teacher_loads = features["teacher_loads"]
        
        # Calculate statistics
        total_classes = sum(load["total_classes"] for load in teacher_loads.values())
        avg_classes_per_teacher = total_classes / len(teacher_loads) if teacher_loads else 0
        
        # Find teachers with significant deviation from average
        for teacher_id, load in teacher_loads.items():
            if abs(load["total_classes"] - avg_classes_per_teacher) > 2:
                if load["total_classes"] > avg_classes_per_teacher + 2:
                    suggestions.append({
                        "type": "teacher_overloaded",
                        "teacher_id": teacher_id,
                        "current_load": load["total_classes"],
                        "average_load": avg_classes_per_teacher,
                        "recommendation": "Consider reducing the teaching load for this teacher"
                    })
                else:
                    suggestions.append({
                        "type": "teacher_underloaded",
                        "teacher_id": teacher_id,
                        "current_load": load["total_classes"],
                        "average_load": avg_classes_per_teacher,
                        "recommendation": "Consider increasing the teaching load for this teacher"
                    })
            
            # Check for poor distribution across days
            if load["std_dev_classes"] > 1.0:
                suggestions.append({
                    "type": "uneven_teacher_schedule",
                    "teacher_id": teacher_id,
                    "std_dev": load["std_dev_classes"],
                    "recommendation": "Consider redistributing classes more evenly across days"
                })
        
        # Check for excessive class movement
        class_movements = features["class_movements"]
        avg_movements = sum(class_movements.values()) / len(class_movements) if class_movements else 0
        
        for class_id, movements in class_movements.items():
            if movements > avg_movements + 1:
                suggestions.append({
                    "type": "excessive_room_changes",
                    "class_id": class_id,
                    "room_changes": movements,
                    "average_changes": avg_movements,
                    "recommendation": "Consider reducing the number of room changes for this class"
                })
        
        return suggestions
    
    def generate_synthetic_training_data(
        self,
        teachers: List[Teacher],
        rooms: List[Room],
        subjects: List[Subject],
        classes: List[Class],
        num_samples: int = 10
    ) -> List[GeneratedTimetable]:
        """
        Generate synthetic timetable data for training the ML models
        
        Args:
            teachers: List of teachers
            rooms: List of rooms
            subjects: List of subjects
            classes: List of classes
            num_samples: Number of synthetic timetables to generate
            
        Returns:
            List of synthetic timetables
        """
        # This is a placeholder for generating synthetic data
        # In a real implementation, this would use more sophisticated methods
        
        synthetic_timetables = []
        
        for _ in range(num_samples):
            timetable = self._generate_random_timetable(teachers, rooms, subjects, classes)
            synthetic_timetables.append(timetable)
        
        return synthetic_timetables
    
    def _generate_random_timetable(
        self,
        teachers: List[Teacher],
        rooms: List[Room],
        subjects: List[Subject],
        classes: List[Class]
    ) -> GeneratedTimetable:
        """Generate a random timetable for training purposes"""
        # This is a very simplified random timetable generator
        # In a real implementation, this would be more sophisticated
        
        class_timetables = {}
        teacher_timetables = {}
        room_allocations = {}
        
        for class_obj in classes:
            entries = []
            class_id = class_obj.id
            
            for subject_id in class_obj.subjects:
                subject = next((s for s in subjects if s.id == subject_id), None)
                if not subject:
                    continue
                
                # Assign random number of hours (1-5) for this subject
                hours = random.randint(1, min(5, subject.hours_per_week))
                
                for _ in range(hours):
                    # Choose random day and slot
                    day = random.randint(0, 4)  # 0-4 for Monday-Friday
                    hour = random.randint(8, 15)  # 8 AM to 3 PM
                    slot = {"start_time": f"{hour}:00", "end_time": f"{hour}:50"}
                    
                    # Choose random teacher from preferred teachers
                    valid_teachers = [t for t in teachers if t.id in subject.preferred_teachers]
                    if not valid_teachers:
                        valid_teachers = teachers  # Fallback to all teachers
                    
                    teacher = random.choice(valid_teachers)
                    
                    # Choose random room
                    valid_rooms = [r for r in rooms if r.capacity >= class_obj.students_count]
                    if not valid_rooms:
                        valid_rooms = rooms  # Fallback to all rooms
                    
                    room = random.choice(valid_rooms)
                    
                    # Create entry
                    entry = {
                        "day": day,
                        "slot": slot,
                        "subject_id": subject_id,
                        "teacher_id": teacher.id,
                        "room_id": room.id,
                        "class_id": class_id
                    }
                    
                    entries.append(entry)
            
            # Add to class timetables
            class_timetables[class_id] = {
                "class_id": class_id,
                "class_name": class_obj.name,
                "entries": entries
            }
            
            # Add to teacher timetables
            for entry in entries:
                teacher_id = entry["teacher_id"]
                if teacher_id not in teacher_timetables:
                    teacher_name = next((t.name for t in teachers if t.id == teacher_id), "Unknown")
                    teacher_timetables[teacher_id] = {
                        "teacher_id": teacher_id,
                        "teacher_name": teacher_name,
                        "entries": []
                    }
                
                teacher_timetables[teacher_id]["entries"].append(entry)
            
            # Add to room allocations
            for entry in entries:
                room_id = entry["room_id"]
                if room_id not in room_allocations:
                    room_allocations[room_id] = []
                
                room_allocations[room_id].append(entry)
        
        # Create timetable
        timetable = {
            "class_timetables": class_timetables,
            "teacher_timetables": teacher_timetables,
            "room_allocations": room_allocations,
            "conflicts": [],
            "stats": {}
        }
        
        return GeneratedTimetable(**timetable) 