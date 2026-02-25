import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import ReservationPage from './components/ReservationPage';
import AdminDashboard from './components/AdminDashboard';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reservation" element={<ReservationPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </div>
  );
}

export default App;
