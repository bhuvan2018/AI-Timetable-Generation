'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { timetableApi, TimetableGenerationRequest, GeneratedTimetable } from '../../lib/api';

export default function GeneratePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timetable, setTimetable] = useState<GeneratedTimetable | null>(null);
  const [timeLimit, setTimeLimit] = useState(60);

  const handleGenerateTimetable = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use empty request to let backend load data from CSV files
      const request: TimetableGenerationRequest = {
        teachers: [],
        rooms: [],
        subjects: [],
        classes: [],
        constraints: {
          max_hours_per_day: 8,
          days_per_week: 5,
          allow_split_subjects: false
        }
      };
      
      const result = await timetableApi.generateTimetable(request, timeLimit);
      if (result && result.timetable) {
        setTimetable(result.timetable);
      } else {
        throw new Error("Failed to generate timetable");
      }
    } catch (err) {
      console.error('Error generating timetable:', err);
      setError('Failed to generate timetable. Please ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card animate-fade-in">
      <h1 className="text-3xl font-bold mb-6 text-indigo-300">Generate Timetable</h1>
      
      <div className="mb-8">
        <p className="text-gray-300 mb-4">
          Generate an optimized timetable using the data from your CSV files. The AI optimizer will attempt to create
          the best possible schedule based on your constraints.
        </p>
        
        <div className="bg-gray-800/40 p-6 rounded-lg border border-gray-700 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-indigo-300">Optimization Settings</h2>
          
          <div className="mb-4">
            <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-300 mb-2">
              Time Limit (seconds)
            </label>
            <input
              type="number"
              id="timeLimit"
              value={timeLimit}
              onChange={(e) => setTimeLimit(parseInt(e.target.value) || 60)}
              min="10"
              max="300"
              className="bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-400 mt-1">Longer time limits may produce better results but will take longer to compute.</p>
          </div>
          
          <button
            onClick={handleGenerateTimetable}
            disabled={loading}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Generate Timetable
              </>
            )}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-900/20 border border-red-700 text-red-200 px-6 py-5 rounded-lg mb-6">
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p>{error}</p>
          </div>
        </div>
      )}
      
      {timetable && (
        <div className="bg-gray-800/40 p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-green-300">Timetable Generated Successfully!</h2>
          <p className="text-gray-300 mb-4">Your timetable has been generated successfully. You can now view it.</p>
          
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-400">Classes: {Object.keys(timetable.class_timetables || {}).length}</p>
              <p className="text-gray-400">Teachers: {Object.keys(timetable.teacher_timetables || {}).length}</p>
              <p className="text-gray-400">Rooms: {Object.keys(timetable.room_allocations || {}).length}</p>
              <p className="text-gray-400">Conflicts: {timetable.conflicts ? timetable.conflicts.length : 0}</p>
            </div>
            
            <Link
              href="/view"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-5 rounded-lg inline-flex items-center transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Timetable
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 