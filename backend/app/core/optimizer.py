from ortools.sat.python import cp_model
import numpy as np
from typing import Dict, List, Tuple, Set, Optional
import time
from ..schemas.timetable import (
    Teacher, Room, Subject, Class, TimeSlot, 
    TimetableConstraints, TimetableEntry, GeneratedTimetable,
    ClassTimetable, TeacherTimetable
)

class TimetableOptimizer:
    """
    Core optimization engine that uses constraint programming to generate timetables
    based on various constraints and requirements.
    """
    
    def __init__(self):
        self.model = None
        self.solver = None
        self.variables = {}
        self.solution = None
        
    def _create_time_slots(self, constraints: TimetableConstraints) -> List[TimeSlot]:
        """Generate time slots based on constraints"""
        # This is a placeholder - in a real implementation, we would generate
        # actual time slots based on the school's schedule
        slots = []
        for hour in range(8, 8 + constraints.max_hours_per_day):
            start = TimeSlot(start_time=f"{hour}:00", end_time=f"{hour}:50")
            slots.append(start)
        return slots
        
    def _initialize_model(
        self,
        teachers: List[Teacher],
        rooms: List[Room],
        subjects: List[Subject],
        classes: List[Class],
        constraints: TimetableConstraints
    ):
        """Initialize the constraint programming model"""
        self.model = cp_model.CpModel()
        self.teachers = {teacher.id: teacher for teacher in teachers}
        self.rooms = {room.id: room for room in rooms}
        self.subjects = {subject.id: subject for subject in subjects}
        self.classes = {class_.id: class_ for class_ in classes}
        self.constraints = constraints
        
        # Generate days and time slots
        self.days = list(range(constraints.days_per_week))
        self.time_slots = self._create_time_slots(constraints)
        self.num_slots = len(self.time_slots)
        
        # Create decision variables
        self._create_variables()
        
        # Add constraints
        self._add_basic_constraints()
        self._add_teacher_constraints()
        self._add_room_constraints()
        self._add_class_constraints()
        self._add_subject_constraints()
        
        # Add optimization objectives
        self._set_optimization_objectives()
    
    def _create_variables(self):
        """Create decision variables for the CP model"""
        # Main decision variables: (day, slot, class, subject, teacher, room)
        # 1 if this combination is selected, 0 otherwise
        for day in self.days:
            for slot_idx, _ in enumerate(self.time_slots):
                for class_id, class_obj in self.classes.items():
                    for subject_id in class_obj.subjects:
                        subject = self.subjects[subject_id]
                        for teacher_id in subject.preferred_teachers:
                            for room_id, room in self.rooms.items():
                                # Check if room has necessary features
                                if all(feature in room.features for feature in subject.requires_features):
                                    var_name = f"d{day}s{slot_idx}c{class_id}subj{subject_id}t{teacher_id}r{room_id}"
                                    self.variables[var_name] = self.model.NewBoolVar(var_name)
    
    def _add_basic_constraints(self):
        """Add basic constraints that must always be satisfied"""
        # A class can only have one subject at a time
        for day in self.days:
            for slot_idx in range(self.num_slots):
                for class_id in self.classes:
                    # Get all variables for this day, slot, class
                    slot_vars = []
                    for var_name, var in self.variables.items():
                        if f"d{day}s{slot_idx}c{class_id}" in var_name:
                            slot_vars.append(var)
                    
                    # At most one subject per slot for a class
                    if slot_vars:
                        self.model.Add(sum(slot_vars) <= 1)
        
        # A teacher can only teach one class at a time
        for day in self.days:
            for slot_idx in range(self.num_slots):
                for teacher_id in self.teachers:
                    # Get all variables for this day, slot, teacher
                    teacher_vars = []
                    for var_name, var in self.variables.items():
                        if f"d{day}s{slot_idx}" in var_name and f"t{teacher_id}" in var_name:
                            teacher_vars.append(var)
                    
                    # At most one class per slot for a teacher
                    if teacher_vars:
                        self.model.Add(sum(teacher_vars) <= 1)
        
        # A room can only be used by one class at a time
        for day in self.days:
            for slot_idx in range(self.num_slots):
                for room_id in self.rooms:
                    # Get all variables for this day, slot, room
                    room_vars = []
                    for var_name, var in self.variables.items():
                        if f"d{day}s{slot_idx}" in var_name and f"r{room_id}" in var_name:
                            room_vars.append(var)
                    
                    # At most one class per slot for a room
                    if room_vars:
                        self.model.Add(sum(room_vars) <= 1)
    
    def _add_teacher_constraints(self):
        """Add constraints related to teachers"""
        # Teachers shouldn't exceed max hours per day
        for teacher_id, teacher in self.teachers.items():
            for day in self.days:
                # Get all variables for this teacher on this day
                day_vars = []
                for var_name, var in self.variables.items():
                    if f"d{day}" in var_name and f"t{teacher_id}" in var_name:
                        day_vars.append(var)
                
                # Limit hours per day
                if day_vars:
                    self.model.Add(sum(day_vars) <= teacher.max_hours_per_day)
        
        # Teachers can only teach subjects they're qualified for
        for var_name, var in self.variables.items():
            # Parse the variable name to extract components
            parts = var_name.split('subj')
            if len(parts) > 1:
                subject_part = parts[1].split('t')[0]
                subject_id = subject_part
                
                teacher_part = parts[1].split('t')[1].split('r')[0]
                teacher_id = teacher_part
                
                # Check if this subject is in the teacher's subject list
                if subject_id not in self.teachers[teacher_id].subjects:
                    # If not qualified, constrain this variable to 0
                    self.model.Add(var == 0)
    
    def _add_room_constraints(self):
        """Add constraints related to rooms"""
        # Room capacity must be sufficient for the class
        for var_name, var in self.variables.items():
            # Parse variable name
            if 'c' in var_name and 'r' in var_name:
                # Extract class_id and room_id
                class_parts = var_name.split('c')[1].split('subj')[0]
                class_id = class_parts
                
                room_parts = var_name.split('r')[1]
                room_id = room_parts
                
                # If room capacity is less than class size, constrain to 0
                if self.rooms[room_id].capacity < self.classes[class_id].students_count:
                    self.model.Add(var == 0)
    
    def _add_class_constraints(self):
        """Add constraints related to classes"""
        # No more than max_hours_per_day for each class
        for class_id in self.classes:
            for day in self.days:
                # Get all variables for this class on this day
                day_vars = []
                for var_name, var in self.variables.items():
                    if f"d{day}" in var_name and f"c{class_id}" in var_name:
                        day_vars.append(var)
                
                # Limit hours per day
                if day_vars:
                    self.model.Add(sum(day_vars) <= self.constraints.max_hours_per_day)
    
    def _add_subject_constraints(self):
        """Add constraints related to subjects"""
        # Each subject must have the required number of hours per week
        for class_id, class_obj in self.classes.items():
            for subject_id in class_obj.subjects:
                subject = self.subjects[subject_id]
                
                # Get all variables for this class and subject
                subject_vars = []
                for var_name, var in self.variables.items():
                    if f"c{class_id}" in var_name and f"subj{subject_id}" in var_name:
                        subject_vars.append(var)
                
                # Ensure the right number of hours
                if subject_vars:
                    self.model.Add(sum(subject_vars) == subject.hours_per_week)
    
    def _set_optimization_objectives(self):
        """Set optimization objectives for the model"""
        # We can add various weights for different objectives
        # For now, let's use a simple objective: minimize the number of room changes for each class
        
        # Initialize the objective
        objective_terms = []
        
        # Add terms to minimize room changes for each class
        for class_id in self.classes:
            for day in self.days:
                for slot_idx in range(self.num_slots - 1):
                    # For each consecutive pair of slots
                    current_slot_room_vars = {}
                    next_slot_room_vars = {}
                    
                    # Get room assignments for current slot
                    for var_name, var in self.variables.items():
                        if f"d{day}s{slot_idx}c{class_id}" in var_name:
                            room_id = var_name.split('r')[1]
                            current_slot_room_vars[room_id] = var
                    
                    # Get room assignments for next slot
                    for var_name, var in self.variables.items():
                        if f"d{day}s{slot_idx+1}c{class_id}" in var_name:
                            room_id = var_name.split('r')[1]
                            next_slot_room_vars[room_id] = var
                    
                    # Create penalty variables for room changes
                    for room_id in self.rooms:
                        if room_id in current_slot_room_vars and room_id in next_slot_room_vars:
                            # Encourage staying in the same room with a reward
                            objective_terms.append(current_slot_room_vars[room_id] * next_slot_room_vars[room_id])
        
        # Set the objective to maximize the sum of these terms (minimizing room changes)
        if objective_terms:
            self.model.Maximize(sum(objective_terms))
    
    def solve(
        self,
        teachers: List[Teacher],
        rooms: List[Room],
        subjects: List[Subject],
        classes: List[Class],
        constraints: TimetableConstraints,
        time_limit_seconds: int = 60
    ) -> GeneratedTimetable:
        """
        Solve the timetable optimization problem
        
        Args:
            teachers: List of teachers
            rooms: List of rooms
            subjects: List of subjects
            classes: List of classes
            constraints: Timetable constraints
            time_limit_seconds: Time limit for solving
            
        Returns:
            GeneratedTimetable object with the solution
        """
        start_time = time.time()
        
        # Initialize the model with constraints
        self._initialize_model(teachers, rooms, subjects, classes, constraints)
        
        # Create the solver and solve
        self.solver = cp_model.CpSolver()
        self.solver.parameters.max_time_in_seconds = time_limit_seconds
        status = self.solver.Solve(self.model)
        
        end_time = time.time()
        solve_time = end_time - start_time
        
        # Process the solution
        if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
            return self._process_solution(solve_time)
        else:
            # Return an empty solution with conflict information
            return GeneratedTimetable(
                class_timetables={},
                teacher_timetables={},
                room_allocations={},
                conflicts=["No feasible solution found with current constraints"],
                stats={"solve_time": solve_time}
            )
    
    def _process_solution(self, solve_time: float) -> GeneratedTimetable:
        """Process the solution and create a GeneratedTimetable object"""
        # Initialize data structures for the result
        class_timetables = {}
        teacher_timetables = {}
        room_allocations = {}
        
        # Process all variables with value 1
        for var_name, var in self.variables.items():
            if self.solver.Value(var) == 1:
                # Parse the variable name to extract components
                # Format: d{day}s{slot_idx}c{class_id}subj{subject_id}t{teacher_id}r{room_id}
                parts = var_name.split('d')[1].split('s')
                day = int(parts[0])
                
                slot_parts = parts[1].split('c')
                slot_idx = int(slot_parts[0])
                
                class_parts = slot_parts[1].split('subj')
                class_id = class_parts[0]
                
                subject_parts = class_parts[1].split('t')
                subject_id = subject_parts[0]
                
                teacher_parts = subject_parts[1].split('r')
                teacher_id = teacher_parts[0]
                
                room_id = teacher_parts[1]
                
                # Create a TimetableEntry for this assignment
                entry = TimetableEntry(
                    day=day,
                    slot=self.time_slots[slot_idx],
                    subject_id=subject_id,
                    teacher_id=teacher_id,
                    room_id=room_id,
                    class_id=class_id
                )
                
                # Add to class timetable
                if class_id not in class_timetables:
                    class_timetables[class_id] = ClassTimetable(
                        class_id=class_id,
                        class_name=self.classes[class_id].name,
                        entries=[]
                    )
                class_timetables[class_id].entries.append(entry)
                
                # Add to teacher timetable
                if teacher_id not in teacher_timetables:
                    teacher_timetables[teacher_id] = TeacherTimetable(
                        teacher_id=teacher_id,
                        teacher_name=self.teachers[teacher_id].name,
                        entries=[]
                    )
                teacher_timetables[teacher_id].entries.append(entry)
                
                # Add to room allocations
                if room_id not in room_allocations:
                    room_allocations[room_id] = []
                room_allocations[room_id].append(entry)
        
        # Calculate statistics
        stats = {
            "solve_time": solve_time,
            "objective_value": self.solver.ObjectiveValue(),
            "conflicts": 0  # We'll count conflicts if any
        }
        
        # Return the completed timetable
        return GeneratedTimetable(
            class_timetables=class_timetables,
            teacher_timetables=teacher_timetables,
            room_allocations=room_allocations,
            conflicts=[],
            stats=stats
        ) 