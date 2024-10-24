import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';

export interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
}

interface EventContextType {
  events: Event[];
  addEvent: (event: Event) => void;
  updateEvent: (event: Event) => void;
  deleteEvent: (id: string) => void;
}

export const EventContext = createContext<EventContextType | undefined>(undefined);

export const useEventContext = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEventContext must be used within an EventProvider');
  }
  return context;
};

import React, { createContext, useState, useEffect, useCallback } from 'react';

export interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
}

interface EventContextType {
  events: Event[];
  addEvent: (event: Event) => void;
  updateEvent: (event: Event) => void;
  deleteEvent: (id: string) => void;
}

export const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/events');
        setEvents(response.data.map((event: Event) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end)
        })));
      } catch (error) {
        console.error('Error fetching events:', error);
        // ローカルストレージからのフォールバック
        const storedEvents = localStorage.getItem('events');
        if (storedEvents) {
          setEvents(JSON.parse(storedEvents).map((event: Event) => ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end)
          })));
        }
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    localStorage.setItem('events', JSON.stringify(events));
  }, [events]);

  const addEvent = useCallback(async (event: Event) => {
    try {
      const response = await axios.post('http://localhost:3001/api/events', event);
      setEvents(prevEvents => [...prevEvents, response.data]);
    } catch (error) {
      console.error('Error adding event:', error);
      // ローカルストレージにのみ追加
      setEvents(prevEvents => [...prevEvents, event]);
    }
  }, []);

  const updateEvent = useCallback(async (updatedEvent: Event) => {
    try {
      await axios.put(`http://localhost:3001/api/events/${updatedEvent.id}`, updatedEvent);
      setEvents(prevEvents =>
        prevEvents.map(event => event.id === updatedEvent.id ? updatedEvent : event)
      );
    } catch (error) {
      console.error('Error updating event:', error);
      // ローカルストレージのみ更新
      setEvents(prevEvents =>
        prevEvents.map(event => event.id === updatedEvent.id ? updatedEvent : event)
      );
    }
  }, []);

  const deleteEvent = useCallback(async (id: string) => {
    try {
      await axios.delete(`http://localhost:3001/api/events/${id}`);
      setEvents(prevEvents => prevEvents.filter(event => event.id !== id));
    } catch (error) {
      console.error('Error deleting event:', error);
      // ローカルストレージのみから削除
      setEvents(prevEvents => prevEvents.filter(event => event.id !== id));
    }
  }, []);

  return (
    <EventContext.Provider value={{ events, addEvent, updateEvent, deleteEvent }}>
      {children}
    </EventContext.Provider>
  );
};

