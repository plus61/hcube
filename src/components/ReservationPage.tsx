import React, { useState, useMemo } from 'react';
import { useEventContext, Event } from '../contexts/EventContext';
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/react';
import { Calendar, Clock, Mail, Users, MessageSquare, MapPin } from 'lucide-react';

const ReservationPage: React.FC = () => {
  const { events, addReservation } = useEventContext();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [events]
  );

  const handleSubmit = (eventId: string) => (e: React.FormEvent) => {
    e.preventDefault();
    const reservation = {
      eventId,
      name,
      email,
      phone,
      message
    };
    addReservation(reservation);
    setName('');
    setEmail('');
    setPhone('');
    setMessage('');
  };

  if (sortedEvents.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">イベント予約</h1>
        <p className="text-gray-500">現在、予約可能なイベントはありません。</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">イベント予約</h1>
      <TabGroup>
        <TabList className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 overflow-x-auto">
          {sortedEvents.map((event: Event) => (
            <Tab
              key={event.id}
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 px-3 text-sm font-medium leading-5 whitespace-nowrap
                 ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2
                 ${selected
                  ? 'bg-white text-blue-700 shadow'
                  : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                }`
              }
            >
              {event.name}
            </Tab>
          ))}
        </TabList>
        <TabPanels className="mt-4">
          {sortedEvents.map((event: Event) => (
            <TabPanel
              key={event.id}
              className="rounded-xl bg-white p-6 shadow ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2"
            >
              <div className="mb-6 space-y-2 border-b pb-4">
                <h2 className="text-xl font-semibold">{event.name}</h2>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {event.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {event.startTime} - {event.endTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {event.venue}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    定員: {event.capacity}名
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit(event.id)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Users className="w-4 h-4 inline mr-1" />
                    お名前
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Mail className="w-4 h-4 inline mr-1" />
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    電話番号
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <MessageSquare className="w-4 h-4 inline mr-1" />
                    メッセージ
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  予約する
                </button>
              </form>
            </TabPanel>
          ))}
        </TabPanels>
      </TabGroup>
    </div>
  );
};

export default ReservationPage;
