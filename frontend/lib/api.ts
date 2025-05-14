import axios from 'axios';

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API Types
export interface TimeSlot {
  start_time: string;
  end_time: string;
}

export interface Teacher {
  id: string;
  name: string;
  subjects: string[];
  unavailable_slots?: TimeSlot[];
  max_hours_per_day?: number;
  max_consecutive_classes?: number;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  available_slots?: TimeSlot[];
  features?: string[];
}

export interface Subject {
  id: string;
  name: string;
  hours_per_week: number;
  requires_features?: string[];
  preferred_teachers: string[];
}

export interface Class {
  id: string;
  name: string;
  subjects: string[];
  students_count: number;
}

export interface TimetableConstraints {
  max_hours_per_day?: number;
  days_per_week?: number;
  break_slots?: TimeSlot[];
  allow_split_subjects?: boolean;
}

export interface TimetableGenerationRequest {
  teachers: Teacher[];
  rooms: Room[];
  subjects: Subject[];
  classes: Class[];
  constraints: TimetableConstraints;
}

export interface TimetableEntry {
  day: number;
  slot: TimeSlot;
  subject_id: string;
  teacher_id: string;
  room_id: string;
  class_id: string;
}

export interface ClassTimetable {
  class_id: string;
  class_name: string;
  entries: TimetableEntry[];
}

export interface TeacherTimetable {
  teacher_id: string;
  teacher_name: string;
  entries: TimetableEntry[];
}

export interface GeneratedTimetable {
  class_timetables: Record<string, ClassTimetable>;
  teacher_timetables: Record<string, TeacherTimetable>;
  room_allocations: Record<string, TimetableEntry[]>;
  conflicts: string[];
  stats: Record<string, number>;
}

export interface UpdateTimetableRequest {
  timetable_id: string;
  updates: any[];
}

// API functions
export const timetableApi = {
  // Load data from CSV files
  loadData: async () => {
    try {
      const response = await api.get('/timetable/data');
      return response.data;
    } catch (error) {
      console.error('Error loading data from CSV files:', error);
      throw error;
    }
  },

  // Generate a new timetable
  generateTimetable: async (request: TimetableGenerationRequest, timeLimit: number = 60) => {
    try {
      const response = await api.post('/timetable/generate', request, {
        params: { time_limit_seconds: timeLimit }
      });
      return response.data;
    } catch (error) {
      console.error('Error generating timetable:', error);
      throw error;
    }
  },

  // Get a timetable by ID
  getTimetable: async (timetableId: string) => {
    try {
      const response = await api.get(`/timetable/${timetableId}`);
      return response.data;
    } catch (error) {
      console.error(`Error getting timetable ${timetableId}:`, error);
      throw error;
    }
  },

  // Update a timetable
  updateTimetable: async (request: UpdateTimetableRequest) => {
    try {
      const response = await api.put('/timetable/update', request);
      return response.data;
    } catch (error) {
      console.error('Error updating timetable:', error);
      throw error;
    }
  },

  // Get analytics for a timetable
  getTimetableAnalytics: async (timetableId: string) => {
    try {
      const response = await api.get(`/timetable/${timetableId}/analytics`);
      return response.data;
    } catch (error) {
      console.error(`Error getting analytics for timetable ${timetableId}:`, error);
      throw error;
    }
  },

  // Get ML suggestions for a timetable
  getTimetableSuggestions: async (timetableId: string) => {
    try {
      const response = await api.get(`/ml/${timetableId}/suggestions`);
      return response.data;
    } catch (error) {
      console.error(`Error getting suggestions for timetable ${timetableId}:`, error);
      throw error;
    }
  },

  // Train ML models
  trainMlModels: async (teachers: Teacher[], rooms: Room[], subjects: Subject[], classes: Class[], numSamples: number = 10) => {
    try {
      const response = await api.post('/ml/train', {
        teachers,
        rooms,
        subjects,
        classes,
        num_samples: numSamples
      });
      return response.data;
    } catch (error) {
      console.error('Error training ML models:', error);
      throw error;
    }
  }
};

export default api; 