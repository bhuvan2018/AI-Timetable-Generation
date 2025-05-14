# AI Timetable Generator

An intelligent system that automatically generates optimized class timetables for schools and colleges by considering multiple constraints and preferences.

## Features

- **Constraint-Based Optimization**: Handles complex scheduling constraints like faculty availability, subject load, classroom capacity, and student preferences.
- **Machine Learning**: Uses ML models to suggest improvements and optimize timetable efficiency.
- **Real-Time Updates**: Supports dynamic updates when constraints change (e.g., when a faculty member becomes unavailable).
- **Analytics Dashboard**: Provides insights into timetable efficiency, resource utilization, and identifies potential improvements.

## Tech Stack

- **Backend**: Python (FastAPI) with constraint programming and machine learning
- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Database**: MongoDB
- **Deployment**: Docker & Docker Compose

## Project Structure

```
ai-timetable/
├── backend/               # Python FastAPI backend
│   ├── app/
│   │   ├── core/          # Constraint optimization engine
│   │   ├── database/      # Data access and CSV loaders
│   │   ├── ml/            # Machine learning models
│   │   ├── routes/        # API endpoints
│   │   ├── schemas/       # Data models
│   │   ├── services/      # Business logic
│   │   └── main.py        # Application entry point
│   ├── tests/             # Unit tests
│   ├── requirements.txt   # Python dependencies
│   └── Dockerfile         # Backend container definition
├── frontend/              # Next.js frontend
│   ├── app/               # Next.js app directory
│   ├── components/        # React components
│   ├── lib/               # Utility functions and API clients
│   ├── styles/            # CSS styles
│   ├── package.json       # Node.js dependencies
│   └── Dockerfile         # Frontend container definition
├── datasets/              # CSV data files
│   ├── teachers.csv       # Teacher information and constraints
│   ├── rooms.csv          # Room capacities and features
│   ├── subjects.csv       # Subject requirements
│   └── classes.csv        # Class groups and their subjects
└── docker-compose.yml     # Docker Compose configuration
```

## Quick Start

### Running the Application Directly

#### Step 1: Start the Backend Server

1. Open a terminal and navigate to the backend directory:
   ```
   cd backend
   ```

2. Install the Python dependencies (first time only):
   ```
   pip install -r requirements.txt
   ```

3. Start the FastAPI server:
   ```
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

4. The backend API will be available at http://localhost:8000
   - API Documentation: http://localhost:8000/docs

#### Step 2: Start the Frontend Server

1. Open a new terminal window and navigate to the frontend directory:
   ```
   cd frontend
   ```

2. If you're experiencing any React/Next.js dependency issues, run the fix script:
   ```
   node fix_dependencies.js
   ```

3. Otherwise, just install the dependencies (first time only):
   ```
   npm install
   ```

4. Start the Next.js development server:
   ```
   npm run dev
   ```

5. The frontend application will be available at http://localhost:3000

### Using Docker Compose (Alternative)

If you prefer using Docker:

1. Make sure Docker and Docker Compose are installed
2. Run: `docker-compose up -d`
3. Access the frontend at http://localhost:3000
4. Access the backend API at http://localhost:8000

## Dataset Structure

The system uses the following CSV datasets:

### Teachers (teachers.csv)
- **teacher_id**: Unique identifier for each teacher
- **name**: Full name of the teacher
- **subjects**: Comma-separated list of subjects the teacher can teach
- **max_hours_per_day**: Maximum teaching hours per day
- **max_consecutive_classes**: Maximum consecutive classes allowed
- **unavailable_slots**: Time slots when the teacher is unavailable

### Rooms (rooms.csv)
- **room_id**: Unique identifier for each room
- **name**: Room name or number
- **capacity**: Maximum number of students
- **features**: Comma-separated list of features (e.g., projector, lab equipment)

### Subjects (subjects.csv)
- **subject_id**: Unique identifier for each subject
- **name**: Subject name
- **hours_per_week**: Required hours per week
- **requires_features**: Features required for teaching this subject
- **preferred_teachers**: Teacher IDs who are preferred for this subject

### Classes (classes.csv)
- **class_id**: Unique identifier for each class
- **name**: Class name (e.g., "Grade 10A")
- **subjects**: Comma-separated list of subject IDs assigned to this class
- **students_count**: Number of students in the class

## Usage

1. Browse the available datasets (teachers, rooms, subjects, classes) in the Data page
2. Generate a new timetable based on the loaded data
3. View and modify the generated timetable as needed
4. Get AI-powered suggestions for timetable improvements
5. Export the timetable in various formats (PDF, Excel, etc.)

## Troubleshooting

### Common Issues

- **Backend not starting**: Check if all Python dependencies are installed properly with `pip install -r requirements.txt`.
- **Frontend not starting**: Run the fix script with `node frontend/fix_dependencies.js` to install compatible versions of Next.js and React.
- **CSV data not loading**: Check the file permissions and format of the CSV files in the datasets directory.
- **React Error "Cannot read properties of null"**: This is usually a version compatibility issue. Run the fix script to install compatible versions.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google OR-Tools for constraint optimization
- scikit-learn for machine learning capabilities
- FastAPI for the backend API framework
- Next.js for the frontend framework 