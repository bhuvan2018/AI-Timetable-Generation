'use client';

import React, { useState, useEffect } from 'react';
import { timetableApi, Teacher, Room, Subject, Class } from '../../lib/api';
import { TeacherTable, RoomTable, SubjectTable, ClassTable } from '../../components/DataTables';

export default function DataPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    teachers: Teacher[];
    rooms: Room[];
    subjects: Subject[];
    classes: Class[];
  }>({
    teachers: [],
    rooms: [],
    subjects: [],
    classes: []
  });
  
  const [activeTab, setActiveTab] = useState<'teachers' | 'rooms' | 'subjects' | 'classes'>('teachers');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await timetableApi.loadData();
        console.log('API Response:', result);
        
        // Check if we got valid data
        if (!result || typeof result !== 'object') {
          throw new Error('Invalid response from server');
        }
        
        setData({
          teachers: Array.isArray(result.teachers) ? result.teachers : [],
          rooms: Array.isArray(result.rooms) ? result.rooms : [],
          subjects: Array.isArray(result.subjects) ? result.subjects : [],
          classes: Array.isArray(result.classes) ? result.classes : []
        });
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load data. Please ensure the backend server is running.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    timetableApi.loadData()
      .then(result => {
        setData({
          teachers: Array.isArray(result.teachers) ? result.teachers : [],
          rooms: Array.isArray(result.rooms) ? result.rooms : [],
          subjects: Array.isArray(result.subjects) ? result.subjects : [],
          classes: Array.isArray(result.classes) ? result.classes : []
        });
        setError(null);
      })
      .catch(err => {
        console.error('Failed to refresh data:', err);
        setError('Failed to refresh data. Please try again later.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="glass-card animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-indigo-300">Dataset Viewer</h1>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Data
            </>
          )}
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-16 w-16 border-t-2 border-b-2 border-indigo-500 rounded-full"></div>
        </div>
      ) : error ? (
        <div className="bg-red-900/20 border border-red-700 text-red-200 px-6 py-5 rounded-lg">
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p>{error}</p>
          </div>
          <div className="mt-4 space-y-3">
            <p className="text-sm">Troubleshooting tips:</p>
            <ul className="list-disc pl-5 text-sm">
              <li>Ensure the backend server is running on port 8000</li>
              <li>Check if the datasets directory contains the CSV files</li>
              <li>Verify that CORS is properly configured on the backend</li>
            </ul>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap border-b border-gray-700 mb-6 gap-1">
            <TabButton 
              active={activeTab === 'teachers'} 
              onClick={() => setActiveTab('teachers')}
              count={data.teachers.length}
            >
              Teachers
            </TabButton>
            <TabButton 
              active={activeTab === 'rooms'} 
              onClick={() => setActiveTab('rooms')}
              count={data.rooms.length}
            >
              Rooms
            </TabButton>
            <TabButton 
              active={activeTab === 'subjects'} 
              onClick={() => setActiveTab('subjects')}
              count={data.subjects.length}
            >
              Subjects
            </TabButton>
            <TabButton 
              active={activeTab === 'classes'} 
              onClick={() => setActiveTab('classes')}
              count={data.classes.length}
            >
              Classes
            </TabButton>
          </div>

          <div className="bg-gray-800/40 shadow-lg rounded-lg p-6 border border-gray-700">
            {activeTab === 'teachers' && <TeacherTable teachers={data.teachers} />}
            {activeTab === 'rooms' && <RoomTable rooms={data.rooms} />}
            {activeTab === 'subjects' && <SubjectTable subjects={data.subjects} />}
            {activeTab === 'classes' && <ClassTable classes={data.classes} />}
          </div>
        </>
      )}
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count: number;
}

function TabButton({ active, onClick, children, count }: TabButtonProps) {
  return (
    <button
      className={`px-5 py-3 focus:outline-none transition-all duration-200 flex items-center ${
        active 
          ? 'border-b-2 border-indigo-500 text-indigo-400 font-medium' 
          : 'text-gray-400 hover:text-gray-300 hover:border-b-2 hover:border-gray-500'
      }`}
      onClick={onClick}
    >
      {children}
      <span className={`ml-2 text-xs rounded-full px-2 py-1 ${
        active ? 'bg-indigo-900/50 text-indigo-300' : 'bg-gray-800 text-gray-400'
      }`}>
        {count}
      </span>
    </button>
  );
} 