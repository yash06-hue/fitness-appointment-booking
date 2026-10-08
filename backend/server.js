const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const db = require('./db');
const { sendOTP, verifyOTP } = require('./minimoth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// -------------------------------------------------------------
// STRICTLY 5 BACKEND API ENDPOINTS
// -------------------------------------------------------------

/**
 * 1. POST /api/auth/send-otp
 * Triggers OTP delivery via Minimoth API (or local sandbox fallback)
 */
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || typeof phone !== 'string' || phone.trim().length < 8) {
      return res.status(400).json({ error: 'Valid phone number with country code is required (e.g. +919876543210)' });
    }

    const cleanPhone = phone.trim();
    const result = await sendOTP(cleanPhone);
    return res.json({ success: true, message: result.message, otp_id: result.otp_id });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to send OTP' });
  }
});

/**
 * 2. POST /api/auth/verify-otp
 * Verifies OTP via Minimoth and creates or returns the user
 */
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { phone, code, name } = req.body;

    if (!phone || !code) {
      return res.status(400).json({ error: 'Phone number and 6-digit OTP code are required' });
    }

    const cleanPhone = phone.trim();
    const cleanCode = code.trim();

    // Verify OTP using Minimoth
    await verifyOTP(cleanPhone, cleanCode);

    // Find or create User in SQLite
    let user = db.prepare('SELECT id, name, phone, created_at FROM users WHERE phone = ?').get(cleanPhone);

    if (!user) {
      const displayName = (name && name.trim()) ? name.trim() : 'Fitness Athlete';
      const insert = db.prepare('INSERT INTO users (name, phone) VALUES (?, ?)').run(displayName, cleanPhone);
      user = db.prepare('SELECT id, name, phone, created_at FROM users WHERE id = ?').get(insert.lastInsertRowid);
    } else if (name && name.trim() && user.name !== name.trim()) {
      db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name.trim(), user.id);
      user.name = name.trim();
    }

    return res.json({
      success: true,
      message: 'Authentication successful',
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone
      }
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'OTP verification failed' });
  }
});

/**
 * 3. GET /api/trainers
 * Fetches all available fitness trainers
 */
app.get('/api/trainers', (req, res) => {
  try {
    const trainers = db.prepare('SELECT * FROM trainers ORDER BY id ASC').all();
    return res.json(trainers);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve trainers' });
  }
});

/**
 * 4. POST /api/bookings
 * Creates a new booking or updates status (e.g. cancel)
 */
app.post('/api/bookings', (req, res) => {
  try {
    const { action, bookingId, userId, trainerId, bookingDate, timeSlot } = req.body;

    // Handle cancellation action
    if (action === 'cancel') {
      if (!bookingId || !userId) {
        return res.status(400).json({ error: 'Booking ID and User ID are required to cancel' });
      }
      const existing = db.prepare('SELECT * FROM bookings WHERE id = ? AND user_id = ?').get(bookingId, userId);
      if (!existing) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      db.prepare("UPDATE bookings SET status = 'cancelled' WHERE id = ?").run(bookingId);
      return res.json({ success: true, message: 'Booking cancelled successfully' });
    }

    // Standard Create Booking
    if (!userId || !trainerId || !bookingDate || !timeSlot) {
      return res.status(400).json({ error: 'User, Trainer, Date, and Time Slot are required' });
    }

    // Verify trainer exists
    const trainer = db.prepare('SELECT id, name FROM trainers WHERE id = ?').get(trainerId);
    if (!trainer) {
      return res.status(404).json({ error: 'Selected trainer does not exist' });
    }

    // Check for slot conflict (prevent double booking)
    const conflict = db.prepare(`
      SELECT id FROM bookings
      WHERE trainer_id = ? AND booking_date = ? AND time_slot = ? AND status = 'confirmed'
    `).get(trainerId, bookingDate, timeSlot);

    if (conflict) {
      return res.status(409).json({ error: 'This time slot is already booked for this trainer. Please select another slot.' });
    }

    const insert = db.prepare(`
      INSERT INTO bookings (user_id, trainer_id, booking_date, time_slot, status)
      VALUES (?, ?, ?, ?, 'confirmed')
    `).run(userId, trainerId, bookingDate, timeSlot);

    const newBooking = db.prepare(`
      SELECT b.id, b.booking_date, b.time_slot, b.status, b.created_at,
             t.name as trainer_name, t.specialty, t.hourly_rate
      FROM bookings b
      JOIN trainers t ON b.trainer_id = t.id
      WHERE b.id = ?
    `).get(insert.lastInsertRowid);

    return res.status(201).json({
      success: true,
      message: 'Booking confirmed!',
      booking: newBooking
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to process booking' });
  }
});

/**
 * 5. GET /api/bookings
 * Retrieves all bookings for a user
 */
app.get('/api/bookings', (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId query parameter is required' });
    }

    const bookings = db.prepare(`
      SELECT b.id, b.booking_date, b.time_slot, b.status, b.created_at,
             t.name as trainer_name, t.specialty as trainer_specialty, t.hourly_rate, t.image_url
      FROM bookings b
      JOIN trainers t ON b.trainer_id = t.id
      WHERE b.user_id = ?
      ORDER BY b.booking_date ASC, b.time_slot ASC
    `).all(userId);

    return res.json(bookings);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve bookings' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`Fitness Appointment Booking Backend`);
  console.log(`Server listening on http://localhost:${PORT}`);
  console.log(`Minimoth API Mode: ${process.env.MINIMOTH_API_KEY ? 'Active (' + process.env.MINIMOTH_API_KEY.slice(0, 7) + '...)' : 'Mock Sandbox'}`);
  console.log(`========================================\n`);
});

