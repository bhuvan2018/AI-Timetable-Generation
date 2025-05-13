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
│   │   ├── ml/            # Machine learning models
│   │   ├── routes/        # API endpoints
│   │   ├── schemas/       # Data models
│   │   ├── services/      # Business logic
│   │   └── main.py        # Application entry point
│   ├── requirements.txt   # Python dependencies
│   └── Dockerfile         # Backend container definition
├── frontend/              # Next.js frontend
│   ├── app/               # Next.js app directory
│   ├── components/        # React components
│   ├── lib/               # Utility functions and API clients
│   ├── styles/            # CSS styles
│   ├── package.json       # Node.js dependencies
│   └── Dockerfile         # Frontend container definition
└── docker-compose.yml     # Docker Compose configuration
```

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (for local frontend development)
- Python 3.10+ (for local backend development)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/ai-timetable.git
   cd ai-timetable
   ```

2. Run with Docker Compose:
   ```
   docker-compose up -d
   ```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Local Development

#### Backend

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Run the server:
   ```
   uvicorn app.main:app --reload
   ```

#### Frontend

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the development server:
   ```
   npm run dev
   ```

## Usage

1. Add teachers, subjects, classes, and rooms through the UI
2. Set constraints (e.g., teacher availability, room features)
3. Generate the timetable
4. View and modify the generated timetable as needed
5. Export the timetable in various formats (PDF, Excel, etc.)

## Algorithm

The timetable generation uses a constraint satisfaction approach with the following key components:

1. **Constraint Definition**: Translates user requirements into mathematical constraints
2. **Variable Selection**: Determines the decision variables (e.g., which teacher teaches which subject at what time)
3. **Constraint Propagation**: Efficiently narrows down possible solutions
4. **Backtracking Search**: Finds solutions that satisfy all constraints
5. **Optimization**: Maximizes teacher and room utilization while minimizing conflicts

## Machine Learning Integration

The system incorporates ML to:

1. **Learn from past timetables**: Identify patterns in successful schedules
2. **Suggest improvements**: Analyze current timetable for potential optimizations
3. **Predict conflicts**: Identify potential scheduling issues before they occur
4. **Personalize schedules**: Adapt to specific institutional preferences over time

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google OR-Tools for constraint optimization
- scikit-learn for machine learning capabilities
- FastAPI for the backend API framework
- Next.js for the frontend framework 