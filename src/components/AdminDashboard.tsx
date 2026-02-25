import React, { useState, useMemo } from 'react';
import { useEventContext, Event } from '../contexts/EventContext';
import { X, ArrowUp, ArrowDown } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { events, addEvent, updateEvent, deleteEvent, reorderEvents } = useEventContext();

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

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [events]
  );

  const handleAddEvent = () => {
    const newEvent: Event = {
      id: Date.now().toString(),
      ...formData,
      sortOrder: 0
    };
    addEvent(newEvent);
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
    const existing = events.find(e => e.id === id);
    const updatedEvent: Event = {
      id,
      ...formData,
      sortOrder: existing?.sortOrder ?? 0
    };
    updateEvent(id, updatedEvent);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">イベント管理</h2>

      <div className="space-y-3">
        {sortedEvents.map((event: Event, index: number) => (
          <div key={event.id} className="flex items-center gap-3 p-3 border rounded-lg">
            <div className="flex flex-col gap-1">
              <button
                onClick={() => reorderEvents(event.id, 'up')}
                disabled={index === 0}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                title="上に移動"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => reorderEvents(event.id, 'down')}
                disabled={index === sortedEvents.length - 1}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                title="下に移動"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1">
              <h3 className="font-semibold">{event.name}</h3>
              <p className="text-sm text-gray-600">
                {event.date} {event.startTime} - {event.endTime}
              </p>
              <p className="text-sm text-gray-600">会場: {event.venue}</p>
              <p className="text-sm text-gray-600">定員: {event.capacity}名</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleUpdateEvent(event.id)}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                更新
              </button>
              <button
                onClick={() => deleteEvent(event.id)}
                className="p-1 text-red-500 hover:bg-red-50 rounded"
                title="削除"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* フォーム要素は省略 */}
    </div>
  );
};

export default AdminDashboard;
