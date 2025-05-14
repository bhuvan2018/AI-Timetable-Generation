import React from 'react';
import { Teacher, Room, Subject, Class } from '../lib/api';

export const TeacherTable: React.FC<{ teachers: Teacher[] }> = ({ teachers }) => {
  if (!teachers || teachers.length === 0) {
    return <EmptyState message="No teachers data available" />;
  }

  return (
    <div className="overflow-x-auto">
      <h3 className="text-xl font-semibold mb-4 text-indigo-300">Teachers</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Subjects</th>
            <th>Max Hours/Day</th>
            <th>Max Consecutive</th>
            <th>Unavailable Slots</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map((teacher, index) => (
            <tr key={teacher.id || index} className="hover:bg-gray-800/40 transition-colors">
              <td>{teacher.id}</td>
              <td className="font-medium text-indigo-200">{teacher.name}</td>
              <td>
                {teacher.subjects && teacher.subjects.length > 0 
                  ? teacher.subjects.join(', ') 
                  : <span className="text-gray-500 italic">None assigned</span>
                }
              </td>
              <td className="text-center">{teacher.max_hours_per_day || '-'}</td>
              <td className="text-center">{teacher.max_consecutive_classes || '-'}</td>
              <td>
                {teacher.unavailable_slots && teacher.unavailable_slots.length > 0
                  ? teacher.unavailable_slots.map((slot, i) => (
                      <span key={i} className="inline-block bg-gray-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                        {`${slot.day || ''} ${slot.start_time || ''}-${slot.end_time || ''}`}
                      </span>
                    ))
                  : <span className="text-gray-500 italic">Always available</span>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const RoomTable: React.FC<{ rooms: Room[] }> = ({ rooms }) => {
  if (!rooms || rooms.length === 0) {
    return <EmptyState message="No rooms data available" />;
  }

  return (
    <div className="overflow-x-auto">
      <h3 className="text-xl font-semibold mb-4 text-indigo-300">Rooms</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Capacity</th>
            <th>Features</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room, index) => (
            <tr key={room.id || index} className="hover:bg-gray-800/40 transition-colors">
              <td>{room.id}</td>
              <td className="font-medium text-indigo-200">{room.name}</td>
              <td>{room.capacity}</td>
              <td>
                {room.features && room.features.length > 0
                  ? room.features.map((feature, i) => (
                      <span key={i} className="inline-block bg-indigo-900/50 text-xs px-2 py-1 rounded text-indigo-200 mr-1 mb-1">
                        {feature}
                      </span>
                    ))
                  : <span className="text-gray-500 italic">No special features</span>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const SubjectTable: React.FC<{ subjects: Subject[] }> = ({ subjects }) => {
  if (!subjects || subjects.length === 0) {
    return <EmptyState message="No subjects data available" />;
  }

  return (
    <div className="overflow-x-auto">
      <h3 className="text-xl font-semibold mb-4 text-indigo-300">Subjects</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Hours/Week</th>
            <th>Required Features</th>
            <th>Preferred Teachers</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((subject, index) => (
            <tr key={subject.id || index} className="hover:bg-gray-800/40 transition-colors">
              <td>{subject.id}</td>
              <td className="font-medium text-indigo-200">{subject.name}</td>
              <td className="text-center">{subject.hours_per_week}</td>
              <td>
                {subject.requires_features && subject.requires_features.length > 0
                  ? subject.requires_features.map((feature, i) => (
                      <span key={i} className="inline-block bg-purple-900/50 text-xs px-2 py-1 rounded text-purple-200 mr-1 mb-1">
                        {feature}
                      </span>
                    ))
                  : <span className="text-gray-500 italic">No special requirements</span>
                }
              </td>
              <td>
                {subject.preferred_teachers && subject.preferred_teachers.length > 0
                  ? subject.preferred_teachers.join(', ')
                  : <span className="text-gray-500 italic">No preferences</span>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const ClassTable: React.FC<{ classes: Class[] }> = ({ classes }) => {
  if (!classes || classes.length === 0) {
    return <EmptyState message="No classes data available" />;
  }

  return (
    <div className="overflow-x-auto">
      <h3 className="text-xl font-semibold mb-4 text-indigo-300">Classes</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Students</th>
            <th>Subjects</th>
          </tr>
        </thead>
        <tbody>
          {classes.map((cls, index) => (
            <tr key={cls.id || index} className="hover:bg-gray-800/40 transition-colors">
              <td>{cls.id}</td>
              <td className="font-medium text-indigo-200">{cls.name}</td>
              <td>{cls.students_count}</td>
              <td>
                {cls.subjects && cls.subjects.length > 0
                  ? cls.subjects.map((subject, i) => (
                      <span key={i} className="inline-block bg-blue-900/50 text-xs px-2 py-1 rounded text-blue-200 mr-1 mb-1">
                        {subject}
                      </span>
                    ))
                  : <span className="text-gray-500 italic">No subjects assigned</span>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const EmptyState: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 border border-gray-700 rounded-lg bg-gray-800/30">
      <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <p className="text-gray-400 text-center">{message}</p>
    </div>
  );
}; 