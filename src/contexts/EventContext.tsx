import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import emailjs from '@emailjs/browser';

interface Event {
  id: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  venue: string; // Added venue field
}

interface Reservation {
  id: string;
  eventId: string;
  name: string;
  email: string;
  childAge: string;
  message?: string;
  completed?: boolean;
  assignedStaff?: string; // Added assignedStaff field
}

interface SMTPSettings {
  serviceId: string;
  templateId: string;
  publicKey: string;
}

type EventContextType = {
  events: Event[];
  reservations: Reservation[];
  smtpSettings: SMTPSettings;
  addEvent: (event: Omit<Event, 'id'>) => void;
  deleteEvent: (id: string) => void;
  addReservation: (reservation: Omit<Reservation, 'id'>) => void;
  updateReservation: (id: string, updates: Partial<Reservation>) => void;
  deleteReservation: (id: string) => void;
  updateSmtpSettings: (settings: SMTPSettings) => void;
};

const EventContext = createContext<EventContextType | undefined>(undefined);

export const useEventContext = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEventContext must be used within an EventProvider');
  }
  return context;
};

export const EventProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [smtpSettings, setSmtpSettings] = useState<SMTPSettings>({
    serviceId: '',
    templateId: '',
    publicKey: '',
  });

  const addEvent = (event: Omit<Event, 'id'>) => {
    const newEvent = { ...event, id: Date.now().toString() };
    setEvents([...events, newEvent]);
  };

  const deleteEvent = (id: string) => {
    setEvents(events.filter(event => event.id !== id));
  };

  const addReservation = (reservation: Omit<Reservation, 'id'>) => {
    const newReservation = { ...reservation, id: Date.now().toString(), completed: false };
    setReservations([...reservations, newReservation]);
  };

  const updateReservation = (id: string, updates: Partial<Reservation>) => {
    setReservations(reservations.map(reservation =>
      reservation.id === id ? { ...reservation, ...updates } : reservation
    ));
  };

  const deleteReservation = (id: string) => {
    setReservations(reservations.filter(reservation => reservation.id !== id));
  };

  const updateSmtpSettings = (settings: SMTPSettings) => {
    setSmtpSettings(settings);
    localStorage.setItem('smtpSettings', JSON.stringify(settings));
  };

  useEffect(() => {
    const storedSettings = localStorage.getItem('smtpSettings');
    if (storedSettings) {
      setSmtpSettings(JSON.parse(storedSettings));
    }
  }, []);

  const contextValue: EventContextType = {
    events,
    reservations,
    smtpSettings,
    addEvent,
    deleteEvent,
    addReservation,
    updateReservation,
    deleteReservation,
    updateSmtpSettings,
  };

  return <EventContext.Provider value={contextValue}>{children}</EventContext.Provider>;
};