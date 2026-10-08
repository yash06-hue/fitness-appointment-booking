import React, { useState, useEffect } from 'react';

const TIME_SLOTS = [
  '08:00 AM',
  '10:00 AM',
  '01:00 PM',
  '03:00 PM',
  '05:00 PM',
  '07:00 PM'
];

export default function BookingPage({ apiBaseUrl, user, onNavigateToBookings }) {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected trainer for booking modal
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [bookingDate, setBookingDate] = useState(() => {
    // Default tomorrow
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [successBooking, setSuccessBooking] = useState(null);

  // Fetch trainers from GET /api/trainers
  useEffect(() => {
    async function loadTrainers() {
      try {
        const res = await fetch(`${apiBaseUrl}/trainers`);
        if (!res.ok) throw new Error('Failed to load trainers');
        const data = await res.json();
        setTrainers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadTrainers();
  }, [apiBaseUrl]);

  // Handle booking submission to POST /api/bookings
  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    setBookingError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`${apiBaseUrl}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          trainerId: selectedTrainer.id,
          bookingDate,
          timeSlot
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Booking failed');
      }

      setSuccessBooking(data.booking);
    } catch (err) {
      setBookingError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setSelectedTrainer(null);
    setBookingError(null);
    setSuccessBooking(null);
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Explore Fitness Coaches</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Select a verified trainer and reserve your personalized 1-on-1 session.
        </p>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading fitness trainers...
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      <div className="trainers-grid">
        {trainers.map((t) => (
          <div key={t.id} className="card trainer-card">
            <img src={t.image_url} alt={t.name} className="trainer-img" />
            <div className="trainer-content">
              <span className="badge badge-green" style={{ alignSelf: 'flex-start', marginBottom: '0.5rem' }}>
                {t.specialty}
              </span>
              <h3 className="trainer-title">{t.name}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {t.experience_years} years training experience
              </p>

              <div className="trainer-meta">
                <span>Rate per session</span>
                <span className="rate-tag">${t.hourly_rate}</span>
              </div>

              <button
                className="btn"
                onClick={() => {
                  setSelectedTrainer(t);
                  setBookingError(null);
                  setSuccessBooking(null);
                }}
              >
                Book Session
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {selectedTrainer && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                {successBooking ? 'Booking Confirmed! 🎉' : `Book with ${selectedTrainer.name}`}
              </h2>
              <button
                onClick={closeModal}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {successBooking ? (
              <div>
                <div className="alert alert-success">
                  Your workout session is locked in!
                </div>
                <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                  <p><strong>Trainer:</strong> {successBooking.trainer_name}</p>
                  <p><strong>Specialty:</strong> {successBooking.specialty}</p>
                  <p><strong>Date:</strong> {successBooking.booking_date}</p>
                  <p><strong>Time Slot:</strong> {successBooking.time_slot}</p>
                  <p><strong>Rate:</strong> ${successBooking.hourly_rate}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn btn-secondary" onClick={closeModal}>
                    Close
                  </button>
                  <button className="btn" onClick={() => { closeModal(); onNavigateToBookings(); }}>
                    View My Bookings
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking}>
                {bookingError && <div className="alert alert-error">{bookingError}</div>}

                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Select Time Slot</label>
                  <div className="slots-grid">
                    {TIME_SLOTS.map((slot) => (
                      <button
                        type="button"
                        key={slot}
                        className={`slot-btn ${timeSlot === slot ? 'selected' : ''}`}
                        onClick={() => setTimeSlot(slot)}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={submitting}>
                    Cancel
                  </button>
                  <button type="submit" className="btn" disabled={submitting}>
                    {submitting ? 'Confirming...' : `Confirm Booking ($${selectedTrainer.hourly_rate})`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

