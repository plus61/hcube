import React, { useState, useContext } from 'react';
import { EventContext, Event, EventContextType } from '../contexts/EventContext';
import { X } from 'lucide-react';
import { debounce } from 'lodash';

const AdminDashboard: React.FC = () => {
  const { events, addEvent, updateEvent, deleteEvent } = useContext(EventContext) as EventContextType;

  // フォームデータの型を定義
  interface FormData {
    name: string;
    date: string;
    startTime: string;
    endTime: string;
    capacity: number;
    venue: string;
  }

  const [formData, setFormData] = useState<FormData>({
    name: '',
    date: '',
    startTime: '',
    endTime: '',
    capacity: 0,
    venue: ''
  });

  const handleAddEvent = () => {
    const newEvent: Event = {
      id: Date.now().toString(), // 一時的なIDを生成
      ...formData
    };
    addEvent(newEvent);
    // フォームをリセット
    setFormData({
      name: '',
      date: '',
      startTime: '',
      endTime: '',
      capacity: 0,
      venue: ''
    });
  };

  const handleUpdateEvent = (id: string) => {
    const updatedEvent: Event = {
      id,
      ...formData
    };
    updateEvent(id, updatedEvent);
  };

  // イベントのマッピング
  return (
    <div>
      {events.map((event: Event) => (
        <div key={event.id}>
          <h3>{event.name}</h3>
          <p>{event.date} {event.startTime} - {event.endTime}</p>
          <p>Venue: {event.venue}</p>
          <p>Capacity: {event.capacity}</p>
          <button onClick={() => deleteEvent(event.id)}>Delete</button>
          <button onClick={() => handleUpdateEvent(event.id)}>Update</button>
        </div>
      ))}
      {/* フォーム要素は省略 */}
    </div>
  );
};

export default AdminDashboard;
