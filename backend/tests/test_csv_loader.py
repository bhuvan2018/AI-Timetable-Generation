import os
import unittest
import tempfile
from pathlib import Path

# Adjust the import path to make it work
import sys
sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.database.csv_loader import CSVDataLoader


class TestCSVLoader(unittest.TestCase):
    def setUp(self):
        # Create a temporary directory to store test CSV files
        self.temp_dir = tempfile.TemporaryDirectory()
        self.data_dir = self.temp_dir.name
        
        # Create test CSV files
        self._create_test_csv_files()
        
        # Initialize the loader with the temp directory
        self.loader = CSVDataLoader(data_dir=self.data_dir)
    
    def tearDown(self):
        # Clean up the temporary directory
        self.temp_dir.cleanup()
    
    def _create_test_csv_files(self):
        """Create test CSV files in the temporary directory"""
        # Teachers CSV
        teachers_csv = os.path.join(self.data_dir, "teachers.csv")
        with open(teachers_csv, 'w') as f:
            f.write("teacher_id,name,subjects,max_hours_per_day,max_consecutive_classes,unavailable_slots\n")
            f.write('T001,Test Teacher,"Math,Science",5,2,"Monday-08:00-09:00,Friday-15:00-16:00"\n')
            f.write('T002,Another Teacher,"English,History",4,3,""\n')
        
        # Rooms CSV
        rooms_csv = os.path.join(self.data_dir, "rooms.csv")
        with open(rooms_csv, 'w') as f:
            f.write("room_id,name,capacity,features\n")
            f.write('R001,Test Room,30,"projector,whiteboard"\n')
            f.write('R002,Another Room,25,"computer"\n')
        
        # Subjects CSV
        subjects_csv = os.path.join(self.data_dir, "subjects.csv")
        with open(subjects_csv, 'w') as f:
            f.write("subject_id,name,hours_per_week,requires_features,preferred_teachers\n")
            f.write('S001,Math,5,"whiteboard","T001"\n')
            f.write('S002,Science,4,"lab_equipment","T001"\n')
        
        # Classes CSV
        classes_csv = os.path.join(self.data_dir, "classes.csv")
        with open(classes_csv, 'w') as f:
            f.write("class_id,name,subjects,students_count\n")
            f.write('C001,Test Class,"S001,S002",25\n')
            f.write('C002,Another Class,"S001",20\n')
    
    def test_load_teachers(self):
        """Test loading teachers from CSV"""
        teachers = self.loader.load_teachers()
        
        # Check that we loaded 2 teachers
        self.assertEqual(len(teachers), 2)
        
        # Check first teacher's data
        self.assertEqual(teachers[0].id, "T001")
        self.assertEqual(teachers[0].name, "Test Teacher")
        self.assertEqual(teachers[0].subjects, ["Math", "Science"])
        self.assertEqual(teachers[0].max_hours_per_day, 5)
        self.assertEqual(teachers[0].max_consecutive_classes, 2)
        self.assertEqual(len(teachers[0].unavailable_slots), 2)
        
        # Check second teacher
        self.assertEqual(teachers[1].id, "T002")
        self.assertEqual(teachers[1].unavailable_slots, [])
    
    def test_load_rooms(self):
        """Test loading rooms from CSV"""
        rooms = self.loader.load_rooms()
        
        # Check that we loaded 2 rooms
        self.assertEqual(len(rooms), 2)
        
        # Check first room's data
        self.assertEqual(rooms[0].id, "R001")
        self.assertEqual(rooms[0].name, "Test Room")
        self.assertEqual(rooms[0].capacity, 30)
        self.assertEqual(rooms[0].features, ["projector", "whiteboard"])
    
    def test_load_subjects(self):
        """Test loading subjects from CSV"""
        subjects = self.loader.load_subjects()
        
        # Check that we loaded 2 subjects
        self.assertEqual(len(subjects), 2)
        
        # Check first subject's data
        self.assertEqual(subjects[0].id, "S001")
        self.assertEqual(subjects[0].name, "Math")
        self.assertEqual(subjects[0].hours_per_week, 5)
        self.assertEqual(subjects[0].requires_features, ["whiteboard"])
        self.assertEqual(subjects[0].preferred_teachers, ["T001"])
    
    def test_load_classes(self):
        """Test loading classes from CSV"""
        classes = self.loader.load_classes()
        
        # Check that we loaded 2 classes
        self.assertEqual(len(classes), 2)
        
        # Check first class's data
        self.assertEqual(classes[0].id, "C001")
        self.assertEqual(classes[0].name, "Test Class")
        self.assertEqual(classes[0].subjects, ["S001", "S002"])
        self.assertEqual(classes[0].students_count, 25)
    
    def test_load_all_data(self):
        """Test loading all data at once"""
        data = self.loader.load_all_data()
        
        # Check that all data categories are present
        self.assertIn('teachers', data)
        self.assertIn('rooms', data)
        self.assertIn('subjects', data)
        self.assertIn('classes', data)
        
        # Check counts for each category
        self.assertEqual(len(data['teachers']), 2)
        self.assertEqual(len(data['rooms']), 2)
        self.assertEqual(len(data['subjects']), 2)
        self.assertEqual(len(data['classes']), 2)


if __name__ == '__main__':
    unittest.main() 