import React, { useState, useContext } from 'react';
import { EventContext, Event, EventContextType } from '../contexts/EventContext';
import { Calendar, Clock, Mail, Users, MessageSquare } from 'lucide-react';
import emailjs from '@emailjs/browser';

const ReservationPage: React.FC = () => {
  const { events, addReservation } = useContext(EventContext) as EventContextType;

  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const event = events.find((e: Event) => e.id === selectedEvent);
    if (event) {
      const reservation = {
        eventId: selectedEvent,
        name,
        email,
        phone,
        message
      };
      addReservation(reservation);
      // 予約確認メールの送信処理（省略）
    }
  };

  return (
    <div>
      <h1>イベント予約</h1>
      <form onSubmit={handleSubmit}>
        <select value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)}>
          <option value="">イベントを選択してください</option>
          {events.map((event: Event) => (
            <option key={event.id} value={event.id}>
              {event.name} - {event.date} {event.startTime}
            </option>
          ))}
        </select>
        {/* 他のフォーム要素は省略 */}
        <button type="submit">予約する</button>
      </form>
    </div>
  );
};

export default ReservationPage;
