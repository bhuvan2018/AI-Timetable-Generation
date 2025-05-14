import React from 'react';
import { Teacher, Room, Subject, Class } from '../lib/api';

interface TeacherTableProps {
  teachers: Teacher[];
}

export const TeacherTable: React.FC<TeacherTableProps> = ({ teachers }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subjects</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Hours</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Consecutive</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unavailable Slots</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {teachers.map((teacher) => (
            <tr key={teacher.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{teacher.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.subjects.join(', ')}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.max_hours_per_day}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.max_consecutive_classes}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {teacher.unavailable_slots ? 
                  teacher.unavailable_slots.map(slot => 
                    `${slot.start_time}-${slot.end_time}`
                  ).join(', ') : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

interface RoomTableProps {
  rooms: Room[];
}

export const RoomTable: React.FC<RoomTableProps> = ({ rooms }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Features</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rooms.map((room) => (
            <tr key={room.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{room.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{room.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{room.capacity}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {room.features ? room.features.join(', ') : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

interface SubjectTableProps {
  subjects: Subject[];
}

export const SubjectTable: React.FC<SubjectTableProps> = ({ subjects }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours Per Week</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Required Features</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preferred Teachers</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {subjects.map((subject) => (
            <tr key={subject.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{subject.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subject.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subject.hours_per_week}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {subject.requires_features ? subject.requires_features.join(', ') : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {subject.preferred_teachers.join(', ')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

interface ClassTableProps {
  classes: Class[];
}

export const ClassTable: React.FC<ClassTableProps> = ({ classes }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students Count</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subjects</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {classes.map((classItem) => (
            <tr key={classItem.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{classItem.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{classItem.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{classItem.students_count}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {classItem.subjects.join(', ')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 