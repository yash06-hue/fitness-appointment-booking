import React, { useState, useEffect } from 'react';

export default function MyBookingsPage({ apiBaseUrl, user, onNavigateToBook }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${apiBaseUrl}/bookings?userId=${user.id}`);
      if (!res.ok) throw new Error('Failed to load bookings');
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [apiBaseUrl, user.id]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this fitness appointment?')) return;

    setCancellingId(bookingId);
    try {
      const res = await fetch(`${apiBaseUrl}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cancel',
          bookingId,
          userId: user.id
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to cancel');
      }

      // Refresh list
      await fetchBookings();
    } catch (err) {
      alert(err.message);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>My Appointments</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Manage your booked workout and training sessions.
          </p>
        </div>
        <button className="btn" style={{ width: 'auto' }} onClick={onNavigateToBook}>
          + Book New Session
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading your appointments...
        </div>
      ) : bookings.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📅</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Appointments Yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: '380px', margin: '0 auto 1.5rem' }}>
            You haven't scheduled any fitness sessions. Browse our trainers and take your first step today!
          </p>
          <button className="btn" style={{ width: 'auto', display: 'inline-flex' }} onClick={onNavigateToBook}>
            Find a Trainer
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {bookings.map((b) => (
            <div
              key={b.id}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1.25rem',
                padding: '1.25rem 1.5rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img
                  src={b.image_url}
                  alt={b.trainer_name}
                  style={{ width: '56px', height: '56px', borderRadius: '12px', objectFit: 'cover', border: '1px solid var(--border)' }}
                />
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{b.trainer_name}</h3>
                  <p style={{ fontSize: '0.825rem', color: 'var(--accent)' }}>{b.trainer_specialty}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Date & Time</div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                    {b.booking_date} • {b.time_slot}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</div>
                  <span className={`badge ${b.status === 'confirmed' ? 'badge-green' : 'badge-red'}`}>
                    {b.status}
                  </span>
                </div>

                <div>
                  {b.status === 'confirmed' && (
                    <button
                      className="btn btn-danger"
                      style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
                      onClick={() => handleCancelBooking(b.id)}
                      disabled={cancellingId === b.id}
                    >
                      {cancellingId === b.id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

