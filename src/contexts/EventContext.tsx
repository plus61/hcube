import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import axios from 'axios';

export interface Event {
  id: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  venue: string;
}

export interface EventContextType {
  events: Event[];
  reservations: any[];
  smtpSettings: any;
  addEvent: (event: Event) => Promise<void>;
  updateEvent: (id: string, updatedEvent: Event) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  addReservation: (reservation: any) => Promise<void>;
  updateReservation: (id: string, updatedReservation: any) => Promise<void>;
  deleteReservation: (id: string) => Promise<void>;
  updateSmtpSettings: (settings: any) => Promise<void>;
}

export const EventContext = createContext<EventContextType | undefined>(undefined);

export const useEventContext = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEventContext must be used within an EventProvider');
  }
  return context;
};

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [smtpSettings, setSmtpSettings] = useState<any>(null);

  const addEvent = useCallback(async (event: Event) => {
    try {
      const response = await axios.post('/api/events', event);
      setEvents(prevEvents => [...prevEvents, response.data]);
    } catch (error) {
      console.error('Error adding event:', error);
    }
  }, []);

  const updateEvent = useCallback(async (id: string, updatedEvent: Event) => {
    try {
      const response = await axios.put(`/api/events/${id}`, updatedEvent);
      setEvents(prevEvents => prevEvents.map(event => event.id === id ? response.data : event));
    } catch (error) {
      console.error('Error updating event:', error);
    }
  }, []);

  const deleteEvent = useCallback(async (id: string) => {
    try {
      await axios.delete(`/api/events/${id}`);
      setEvents(prevEvents => prevEvents.filter(event => event.id !== id));
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  }, []);

  const addReservation = useCallback(async (reservation: any) => {
    try {
      const response = await axios.post('/api/reservations', reservation);
      setReservations(prevReservations => [...prevReservations, response.data]);
    } catch (error) {
      console.error('Error adding reservation:', error);
    }
  }, []);

  const updateReservation = useCallback(async (id: string, updatedReservation: any) => {
    try {
      const response = await axios.put(`/api/reservations/${id}`, updatedReservation);
      setReservations(prevReservations => prevReservations.map(reservation => reservation.id === id ? response.data : reservation));
    } catch (error) {
      console.error('Error updating reservation:', error);
    }
  }, []);

  const deleteReservation = useCallback(async (id: string) => {
    try {
      await axios.delete(`/api/reservations/${id}`);
      setReservations(prevReservations => prevReservations.filter(reservation => reservation.id !== id));
    } catch (error) {
      console.error('Error deleting reservation:', error);
    }
  }, []);

  const updateSmtpSettings = useCallback(async (settings: any) => {
    try {
      const response = await axios.put('/api/smtp-settings', settings);
      setSmtpSettings(response.data);
    } catch (error) {
      console.error('Error updating SMTP settings:', error);
    }
  }, []);

  useEffect(() => {
    // イベントとSMTP設定を取得する初期化ロジックをここに追加
  }, []);

  return (
    <EventContext.Provider value={{
      events,
      reservations,
      smtpSettings,
      addEvent,
      updateEvent,
      deleteEvent,
      addReservation,
      updateReservation,
      deleteReservation,
      updateSmtpSettings
    }}>
      {children}
    </EventContext.Provider>
  );
};
