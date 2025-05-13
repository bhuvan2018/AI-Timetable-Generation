import React, { useMemo } from 'react';
import { ClassTimetable, TimetableEntry, Subject, Teacher, Room } from '@/lib/api';

interface TimetableViewProps {
  timetable: ClassTimetable;
  subjects: Record<string, Subject>;
  teachers: Record<string, Teacher>;
  rooms: Record<string, Room>;
}

const TimetableView: React.FC<TimetableViewProps> = ({
  timetable,
  subjects,
  teachers,
  rooms,
}) => {
  // Days of the week
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  
  // Get time slots (assuming 8AM to 4PM with 1-hour slots)
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 8; hour <= 15; hour++) {
      slots.push(`${hour}:00 - ${hour + 1}:00`);
    }
    return slots;
  }, []);
  
  // Organize entries by day and time
  const timetableMatrix = useMemo(() => {
    const matrix: Record<number, Record<string, TimetableEntry>> = {};
    
    // Initialize matrix
    days.forEach((_, dayIndex) => {
      matrix[dayIndex] = {};
    });
    
    // Fill in entries
    timetable.entries.forEach(entry => {
      const timeKey = `${entry.slot.start_time} - ${entry.slot.end_time}`;
      if (!matrix[entry.day]) {
        matrix[entry.day] = {};
      }
      matrix[entry.day][timeKey] = entry;
    });
    
    return matrix;
  }, [timetable, days]);
  
  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <h2 className="text-xl font-bold p-4 border-b">{timetable.class_name} Timetable</h2>
      
      <div className="timetable-grid">
        {/* Header row with days */}
        <div className="timetable-header">Time / Day</div>
        {days.map((day, index) => (
          <div key={index} className="timetable-header">
            {day}
          </div>
        ))}
        
        {/* Time slots rows */}
        {timeSlots.map((timeSlot, timeIndex) => (
          <React.Fragment key={timeIndex}>
            {/* Time column */}
            <div className="timetable-time">{timeSlot}</div>
            
            {/* Day columns */}
            {days.map((_, dayIndex) => {
              const entry = timetableMatrix[dayIndex]?.[timeSlot];
              
              return (
                <div 
                  key={dayIndex} 
                  className={`timetable-cell ${entry ? 'filled' : ''}`}
                >
                  {entry && (
                    <div className="text-sm">
                      <div className="font-semibold">
                        {subjects[entry.subject_id]?.name || 'Unknown Subject'}
                      </div>
                      <div>
                        Teacher: {teachers[entry.teacher_id]?.name || 'Unknown'}
                      </div>
                      <div>
                        Room: {rooms[entry.room_id]?.name || 'Unknown'}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default TimetableView; 