import React, { useState } from 'react';

export default function AuthPage({ apiBaseUrl, onLoginSuccess }) {
  const [phone, setPhone] = useState('+91');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Step 1: Send OTP via Minimoth
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!phone || phone.trim().length < 10) {
      setError('Please enter a valid phone number with country code (e.g., +919876543210)');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setMessage(data.message || 'OTP sent successfully!');
      setStep('otp');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP via Minimoth
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!otp || otp.trim().length < 4) {
      setError('Please enter the OTP code sent to your phone');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.trim(),
          code: otp.trim(),
          name: name.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid OTP code');
      }

      // Save user session
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '3rem auto 0' }}>
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ display: 'inline-flex', padding: '0.6rem', borderRadius: '12px', background: 'rgba(34,197,94,0.1)', color: 'var(--accent)', marginBottom: '0.75rem', fontSize: '1.75rem' }}>
            ⚡
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Welcome to FitPulse</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.35rem' }}>
            Instant login via Minimoth OTP verification
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp}>
            <div className="form-group">
              <label>Your Name (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Alex Hunter"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Phone Number (with country code)</label>
              <input
                type="tel"
                placeholder="+919876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <button type="submit" className="btn" disabled={loading}>
                {loading ? 'Sending OTP via Minimoth...' : 'Send OTP'}
              </button>
            </div>

            <div style={{ marginTop: '1.25rem', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', fontSize: '0.78rem', color: 'var(--text-dim)', textAlign: 'center' }}>
              🔒 Powered by <strong>Minimoth API</strong> (WhatsApp / SMS)
              <br />
              <span style={{ color: 'var(--text-muted)' }}>Sandbox mode test code: <code>123456</code></span>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div className="alert alert-info" style={{ fontSize: '0.85rem' }}>
              OTP sent to <strong>{phone}</strong>
            </div>

            <div className="form-group">
              <label>Enter 6-Digit OTP Code</label>
              <input
                type="text"
                placeholder="123456"
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={{ textAlign: 'center', fontSize: '1.25rem', letterSpacing: '0.25em' }}
                autoFocus
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => { setStep('phone'); setOtp(''); setError(null); }}
                disabled={loading}
              >
                Back
              </button>
              <button type="submit" className="btn" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

