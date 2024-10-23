import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import ReservationPage from './components/ReservationPage';
import AdminDashboard from './components/AdminDashboard';
import { EventProvider } from './contexts/EventContext';
import PasswordPrompt from './components/PasswordPrompt';

console.log('App component is being rendered');

function App() {
  return (
    <EventProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-b from-[#CC0066] to-[#0099CC]">
          <nav className="bg-white shadow-md">
            <div className="container mx-auto px-6 py-3 flex justify-between items-center">
              <Link to="/" className="text-xl font-bold text-[#CC0066]">H-CUBE予約システム</Link>
              <Link to="/admin" className="bg-[#0099CC] text-white px-4 py-2 rounded hover:bg-[#007799]">管理者ページ</Link>
            </div>
          </nav>
          <Routes>
            <Route path="/" element={<ReservationPage />} />
            <Route path="/admin" element={
              <PasswordPrompt>
                <AdminDashboard />
              </PasswordPrompt>
            } />
          </Routes>
        </div>
      </Router>
    </EventProvider>
  );
}

export default App;