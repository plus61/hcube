import React, { useState } from 'react';
import { Calendar, Clock, User, Mail, Users, MessageSquare } from 'lucide-react';
import { useEventContext } from '../contexts/EventContext';
import emailjs from '@emailjs/browser';

const ReservationPage: React.FC = () => {
  const { events, addReservation, smtpSettings, reservations } = useEventContext();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [childAge, setChildAge] = useState('');
  const [message, setMessage] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    // 初期値
  });

  const getAvailableSeats = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return 0;
    
    const reservationCount = reservations.filter(r => r.eventId === eventId).length;
    return event.capacity - reservationCount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('idle');

    if (!name || !email || !selectedEvent || !childAge) {
      alert('全ての必須項目を入力してください。');
      return;
    }

    if (getAvailableSeats(selectedEvent) <= 0) {
      alert('申し訳ありませんが、このイベントは満席です。');
      return;
    }

    const newReservation = {
      eventId: selectedEvent,
      name,
      email,
      childAge,
      message,
      completed: false
    };

    addReservation(newReservation);

    try {
      if (smtpSettings.serviceId && smtpSettings.templateId && smtpSettings.publicKey) {
        await emailjs.send(
          smtpSettings.serviceId,
          smtpSettings.templateId,
          {
            to_name: name,
            to_email: email,
            event_name: events.find(event => event.id === selectedEvent)?.name,
            child_age: childAge,
            message: message
          },
          smtpSettings.publicKey
        );
      }
      setSubmitStatus('success');
    } catch (error) {
      console.error('Failed to send email:', error);
      setSubmitStatus('error');
    }

    setName('');
    setEmail('');
    setSelectedEvent('');
    setChildAge('');
    setMessage('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log(`Updating ${name} with value: ${value}`);
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">イベント予約</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="event">
            <Calendar className="inline-block mr-2" />
            イベント選択
          </label>
          <select
            id="event"
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="">イベントを選択してください</option>
            {events.map((event) => (
              <option 
                key={event.id} 
                value={event.id}
                disabled={getAvailableSeats(event.id) <= 0}
              >
                {event.name} - {event.date} {event.startTime}~{event.endTime} (残り{getAvailableSeats(event.id)}席)
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            <User className="inline-block mr-2" />
            お名前
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="山田 太郎"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            <Mail className="inline-block mr-2" />
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="example@example.com"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="childAge">
            <Users className="inline-block mr-2" />
            お子さまの年齢
          </label>
          <input
            id="childAge"
            type="text"
            value={childAge}
            onChange={(e) => setChildAge(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="5歳"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="message">
            <MessageSquare className="inline-block mr-2" />
            メッセージ（任意）
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            rows={4}
            placeholder="ご質問やご要望があればこちらにご記入ください。"
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            予約する
          </button>
        </div>
      </form>
      {submitStatus === 'success' && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">予約が完了しました！</strong>
          <span className="block sm:inline"> 確認メールをお送りしましたのでご確認ください。</span>
        </div>
      )}
      {submitStatus === 'error' && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">エラーが発生しました。</strong>
          <span className="block sm:inline"> もう一度お試しいただくか、管理者にお問い合わせください。</span>
        </div>
      )}
    </div>
  );
};

export default ReservationPage;
