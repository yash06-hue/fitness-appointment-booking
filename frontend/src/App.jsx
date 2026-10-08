import React, { useState, useEffect } from 'react';
import AuthPage from './pages/AuthPage';
import BookingPage from './pages/BookingPage';
import MyBookingsPage from './pages/MyBookingsPage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('fitpulse_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Current active view for logged-in user: 'book' | 'my-bookings'
  const [currentView, setCurrentView] = useState('book');

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('fitpulse_user', JSON.stringify(userData));
    setCurrentView('book');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('fitpulse_user');
  };

  return (
    <div className="app-container">
      {/* Navigation Bar */}
      <header className="navbar">
        <div className="brand">
          <span>⚡ FitPulse</span>
          <span className="brand-badge">Bookings</span>
        </div>

        {user && (
          <nav className="nav-links">
            <button
              className={`nav-btn ${currentView === 'book' ? 'active' : ''}`}
              onClick={() => setCurrentView('book')}
            >
              Browse Coaches
            </button>
            <button
              className={`nav-btn ${currentView === 'my-bookings' ? 'active' : ''}`}
              onClick={() => setCurrentView('my-bookings')}
            >
              My Bookings
            </button>
            <div className="user-tag">
              <span>👤</span>
              <strong>{user.name}</strong>
            </div>
            <button className="nav-btn" onClick={handleLogout} title="Log Out">
              Log Out
            </button>
          </nav>
        )}
      </header>

      {/* Main Content Area: Strictly 3 Pages */}
      <main className="main-content">
        {!user ? (
          /* Page 1: Authentication with Minimoth OTP */
          <AuthPage
            apiBaseUrl={API_BASE_URL}
            onLoginSuccess={handleLogin}
          />
        ) : currentView === 'book' ? (
          /* Page 2: Explore Trainers & Book Appointment */
          <BookingPage
            apiBaseUrl={API_BASE_URL}
            user={user}
            onNavigateToBookings={() => setCurrentView('my-bookings')}
          />
        ) : (
          /* Page 3: View & Manage Scheduled Bookings */
          <MyBookingsPage
            apiBaseUrl={API_BASE_URL}
            user={user}
            onNavigateToBook={() => setCurrentView('book')}
          />
        )}
      </main>

      {/* Workshop Footer */}
      <footer style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-dim)', fontSize: '0.8rem', borderTop: '1px solid var(--border)' }}>
        Fitness Appointment Booking • 45-Min Workshop Project • Powered by Minimoth OTP API
      </footer>
    </div>
  );
}

