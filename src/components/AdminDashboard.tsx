import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Plus, Edit, Trash, Check, X, Download, MapPin } from 'lucide-react';
import { useEventContext } from '../contexts/EventContext';
import { debounce } from 'lodash';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    events,
    reservations,
    smtpSettings,
    addEvent,
    deleteEvent,
    updateReservation,
    deleteReservation,
    updateSmtpSettings
  } = useEventContext();

  const [newEvent, setNewEvent] = useState({ 
    name: '', 
    date: '', 
    startTime: '', 
    endTime: '', 
    capacity: 0,
    venue: '' 
  });

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addEvent(newEvent);
      setNewEvent({ name: '', date: '', startTime: '', endTime: '', capacity: 0, venue: '' });
      navigate('.', { replace: true });
    } catch (error) {
      console.error('Failed to add event:', error);
    }
  };

  const handleUpdateSmtpSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSmtpSettings(smtpSettings);
      navigate('.', { replace: true });
    } catch (error) {
      console.error('Failed to update SMTP settings:', error);
    }
  };

  const handleStatusUpdate = async (reservationId: string, completed: boolean) => {
    try {
      if (completed) {
        const staffName = prompt('担当者名を入力してください:');
        if (staffName) {
          await updateReservation(reservationId, { completed: true, assignedStaff: staffName });
          navigate('.', { replace: true });
        }
      } else {
        await updateReservation(reservationId, { completed: false, assignedStaff: undefined });
        navigate('.', { replace: true });
      }
    } catch (error) {
      console.error('Failed to update reservation status:', error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteEvent(eventId);
      navigate('.', { replace: true });
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  const handleDeleteReservation = async (reservationId: string) => {
    try {
      await deleteReservation(reservationId);
      navigate('.', { replace: true });
    } catch (error) {
      console.error('Failed to delete reservation:', error);
    }
  };

  const exportToCSV = () => {
    const headers = ['予約日時', 'イベント名', '開催場所', '予約者名', 'メールアドレス', 'お子様の年齢', 'メッセージ', '対応状況', '担当者'];
    const rows = reservations.map(reservation => {
      const event = events.find(e => e.id === reservation.eventId);
      return [
        `${event?.date} ${event?.startTime}`,
        event?.name,
        event?.venue,
        reservation.name,
        reservation.email,
        reservation.childAge,
        reservation.message || '',
        reservation.completed ? '対応済み' : '未対応',
        reservation.assignedStaff || ''
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `予約一覧_${new Date().toLocaleDateString()}.csv`;
    link.click();
  };

  const debouncedHandleInputChange = debounce((name: string, value: string) => {
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  }, 300); // 300ミリ秒のデバウンス

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    debouncedHandleInputChange(name, value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#CC0066] to-[#0099CC] py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-center text-white">管理者ダッシュボード</h1>
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">イベント管理</h2>
          <form onSubmit={handleAddEvent} className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="イベント名"
              value={newEvent.name}
              onChange={(e) => setNewEvent({...newEvent, name: e.target.value})}
              className="border p-2"
            />
            <input
              type="text"
              placeholder="開催場所"
              value={newEvent.venue}
              onChange={(e) => setNewEvent({...newEvent, venue: e.target.value})}
              className="border p-2"
            />
            <input
              type="date"
              value={newEvent.date}
              onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
              className="border p-2"
            />
            <input
              type="time"
              value={newEvent.startTime}
              onChange={(e) => setNewEvent({...newEvent, startTime: e.target.value})}
              className="border p-2"
            />
            <input
              type="time"
              value={newEvent.endTime}
              onChange={(e) => setNewEvent({...newEvent, endTime: e.target.value})}
              className="border p-2"
            />
            <input
              type="number"
              placeholder="定員"
              value={newEvent.capacity}
              onChange={(e) => setNewEvent({...newEvent, capacity: parseInt(e.target.value)})}
              className="border p-2"
            />
            <button type="submit" className="bg-[#0099CC] text-white p-2 rounded md:col-span-2">
              <Plus size={20} className="inline mr-2" /> イベント追加
            </button>
          </form>
          <ul>
            {events.map((event) => (
              <li key={event.id} className="mb-2 flex items-center">
                <MapPin size={16} className="mr-2 text-gray-500" />
                <span>{event.name} - {event.venue} - {event.date} {event.startTime}~{event.endTime} (定員: {event.capacity})</span>
                <button onClick={() => handleDeleteEvent(event.id)} className="ml-2 text-red-500">
                  <Trash size={20} />
                </button>
              </li>
            ))}
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">予約管理</h2>
          <div className="mb-4">
            <button
              onClick={exportToCSV}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center"
            >
              <Download size={20} className="mr-2" />
              CSVでダウンロード
            </button>
          </div>
          <div className="space-y-4">
            {reservations.map((reservation) => {
              const event = events.find(e => e.id === reservation.eventId);
              return (
                <div key={reservation.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg">
                        {event?.name} - {event?.venue} - {event?.date} {event?.startTime}~{event?.endTime}
                      </h3>
                      <p><span className="font-semibold">予約者名:</span> {reservation.name}</p>
                      <p><span className="font-semibold">メールアドレス:</span> {reservation.email}</p>
                      <p><span className="font-semibold">お子様の年齢:</span> {reservation.childAge}</p>
                      {reservation.message && (
                        <p><span className="font-semibold">メッセージ:</span> {reservation.message}</p>
                      )}
                      <div className="flex items-center space-x-4">
                        <p className="flex items-center">
                          <span className="font-semibold mr-2">対応状況:</span>
                          <button
                            onClick={() => handleStatusUpdate(reservation.id, !reservation.completed)}
                            className={`${
                              reservation.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            } px-3 py-1 rounded-full text-sm font-medium`}
                          >
                            {reservation.completed ? (
                              <span className="flex items-center">
                                <Check size={16} className="mr-1" />
                                対応済み ({reservation.assignedStaff})
                              </span>
                            ) : (
                              <span className="flex items-center">
                                <Clock size={16} className="mr-1" />
                                未対応
                              </span>
                            )}
                          </button>
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteReservation(reservation.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <h2 className="text-2xl font-bold mt-8 mb-4">EmailJS設定</h2>
          <form onSubmit={handleUpdateSmtpSettings} className="space-y-4">
            <div>
              <label htmlFor="serviceId" className="block mb-1">Service ID</label>
              <input
                type="text"
                id="serviceId"
                value={smtpSettings.serviceId}
                onChange={(e) => updateSmtpSettings({...smtpSettings, serviceId: e.target.value})}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label htmlFor="templateId" className="block mb-1">Template ID</label>
              <input
                type="text"
                id="templateId"
                value={smtpSettings.templateId}
                onChange={(e) => updateSmtpSettings({...smtpSettings, templateId: e.target.value})}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label htmlFor="publicKey" className="block mb-1">Public Key</label>
              <input
                type="text"
                id="publicKey"
                value={smtpSettings.publicKey}
                onChange={(e) => updateSmtpSettings({...smtpSettings, publicKey: e.target.value})}
                className="w-full border p-2 rounded"
              />
            </div>
            <button
              type="submit"
              className="bg-[#0099CC] text-white p-2 rounded flex items-center justify-center"
            >
              <Plus size={20} className="mr-2" /> EmailJS設定を更新
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
