'use client';

import React, { useState, useEffect } from 'react';
import { timetableApi, GeneratedTimetable, ClassTimetable, Subject, Teacher, Room } from '../../lib/api';
import TimetableView from '../../components/TimetableView';

export default function ViewPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timetableId, setTimetableId] = useState<string>('');
  const [timetable, setTimetable] = useState<GeneratedTimetable | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [subjects, setSubjects] = useState<Record<string, Subject>>({});
  const [teachers, setTeachers] = useState<Record<string, Teacher>>({});
  const [rooms, setRooms] = useState<Record<string, Room>>({});

  useEffect(() => {
    // Load sample data to display if no timetable is available
    const loadData = async () => {
      try {
        const result = await timetableApi.loadData();
        // Convert arrays to objects with IDs as keys
        const subjectsMap: Record<string, Subject> = {};
        const teachersMap: Record<string, Teacher> = {};
        const roomsMap: Record<string, Room> = {};
        
        if (result.subjects) {
          result.subjects.forEach((subject: Subject) => {
            subjectsMap[subject.id] = subject;
          });
        }
        
        if (result.teachers) {
          result.teachers.forEach((teacher: Teacher) => {
            teachersMap[teacher.id] = teacher;
          });
        }
        
        if (result.rooms) {
          result.rooms.forEach((room: Room) => {
            roomsMap[room.id] = room;
          });
        }
        
        setSubjects(subjectsMap);
        setTeachers(teachersMap);
        setRooms(roomsMap);
        setDataLoaded(true);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load reference data');
      }
    };
    
    loadData();
  }, []);

  const handleLoadTimetable = async () => {
    if (!timetableId.trim()) {
      setError('Please enter a timetable ID');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await timetableApi.getTimetable(timetableId);
      setTimetable(result);
      
      // Set the first class as selected
      if (result && result.class_timetables) {
        const classIds = Object.keys(result.class_timetables);
        if (classIds.length > 0) {
          setSelectedClass(classIds[0]);
        }
      }
    } catch (err) {
      console.error('Error loading timetable:', err);
      setError('Failed to load timetable. Please check the ID and ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card animate-fade-in">
      <h1 className="text-3xl font-bold mb-6 text-indigo-300">View Timetables</h1>
      
      <div className="mb-8">
        <p className="text-gray-300 mb-4">
          View and analyze previously generated timetables. Enter a timetable ID to load a specific timetable.
        </p>
        
        <div className="bg-gray-800/40 p-6 rounded-lg border border-gray-700 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={timetableId}
              onChange={(e) => setTimetableId(e.target.value)}
              placeholder="Enter timetable ID"
              className="flex-grow bg-gray-700 border border-gray-600 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            
            <button
              onClick={handleLoadTimetable}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-5 rounded-lg flex items-center justify-center min-w-[150px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Timetable
                </>
              )}
            </button>
          </div>
          
          {error && (
            <div className="mt-4 text-red-300">
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>
      
      {timetable && selectedClass && timetable.class_timetables && (
        <div className="bg-gray-800/40 p-6 rounded-lg border border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h2 className="text-xl font-semibold text-indigo-300 mb-4 md:mb-0">Timetable View</h2>
            
            <div className="flex flex-wrap gap-2">
              {Object.keys(timetable.class_timetables).map(classId => (
                <button
                  key={classId}
                  onClick={() => setSelectedClass(classId)}
                  className={`px-3 py-1.5 rounded-md text-sm ${
                    selectedClass === classId 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {timetable.class_timetables[classId].class_name}
                </button>
              ))}
            </div>
          </div>
          
          {dataLoaded && (
            <TimetableView 
              timetable={timetable.class_timetables[selectedClass]} 
              subjects={subjects} 
              teachers={teachers}
              rooms={rooms}
            />
          )}
        </div>
      )}
      
      {!timetable && (
        <div className="flex flex-col items-center justify-center py-12 px-4 border border-gray-700 rounded-lg bg-gray-800/30">
          <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-400 text-center mb-2">No timetable loaded</p>
          <p className="text-gray-500 text-center text-sm">Enter a timetable ID or generate a new timetable first</p>
        </div>
      )}
    </div>
  );
} 