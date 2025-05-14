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
        const result = await timetableApi.loadData();
        setData(result);
        setError(null);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dataset Viewer</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`px-4 py-2 ${activeTab === 'teachers' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
              onClick={() => setActiveTab('teachers')}
            >
              Teachers ({data.teachers.length})
            </button>
            <button
              className={`px-4 py-2 ${activeTab === 'rooms' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
              onClick={() => setActiveTab('rooms')}
            >
              Rooms ({data.rooms.length})
            </button>
            <button
              className={`px-4 py-2 ${activeTab === 'subjects' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
              onClick={() => setActiveTab('subjects')}
            >
              Subjects ({data.subjects.length})
            </button>
            <button
              className={`px-4 py-2 ${activeTab === 'classes' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
              onClick={() => setActiveTab('classes')}
            >
              Classes ({data.classes.length})
            </button>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6">
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