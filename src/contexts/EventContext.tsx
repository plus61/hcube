import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

export interface Event {
  id: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  venue: string;
  sortOrder: number;
}

export interface EventContextType {
  events: Event[];
  reservations: any[];
  smtpSettings: any;
  addEvent: (event: Event) => Promise<void>;
  updateEvent: (id: string, updatedEvent: Event) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  reorderEvents: (eventId: string, direction: 'up' | 'down') => Promise<void>;
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

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('/api/events');
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
    fetchEvents();
  }, []);

  const addEvent = useCallback(async (event: Event) => {
    try {
      const maxSortOrder = events.length > 0
        ? Math.max(...events.map(e => e.sortOrder ?? 0))
        : 0;
      const eventWithOrder = { ...event, sortOrder: maxSortOrder + 1 };
      const response = await axios.post('/api/events', eventWithOrder);
      setEvents(prevEvents => [...prevEvents, response.data]);
    } catch (error) {
      console.error('Error adding event:', error);
    }
  }, [events]);

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

  const reorderEvents = useCallback(async (eventId: string, direction: 'up' | 'down') => {
    const sorted = [...events].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    const currentIndex = sorted.findIndex(e => e.id === eventId);
    if (currentIndex === -1) return;

    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (swapIndex < 0 || swapIndex >= sorted.length) return;

    const currentEvent = sorted[currentIndex];
    const swapEvent = sorted[swapIndex];

    const updatedCurrent = { ...currentEvent, sortOrder: swapEvent.sortOrder };
    const updatedSwap = { ...swapEvent, sortOrder: currentEvent.sortOrder };

    try {
      await Promise.all([
        axios.put(`/api/events/${currentEvent.id}`, updatedCurrent),
        axios.put(`/api/events/${swapEvent.id}`, updatedSwap),
      ]);
      setEvents(prevEvents =>
        prevEvents.map(e => {
          if (e.id === currentEvent.id) return updatedCurrent;
          if (e.id === swapEvent.id) return updatedSwap;
          return e;
        })
      );
    } catch (error) {
      console.error('Error reordering events:', error);
    }
  }, [events]);

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

  return (
    <EventContext.Provider value={{
      events,
      reservations,
      smtpSettings,
      addEvent,
      updateEvent,
      deleteEvent,
      reorderEvents,
      addReservation,
      updateReservation,
      deleteReservation,
      updateSmtpSettings
    }}>
      {children}
    </EventContext.Provider>
  );
};
