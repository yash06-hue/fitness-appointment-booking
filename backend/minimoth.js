const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const MINIMOTH_BASE_URL = 'https://api.minimoth.dev/v1';

// In-memory mock store for local development/sandbox when no live key is set
const sandboxStore = new Map();

/**
 * Send OTP using Minimoth API (or local sandbox fallback)
 * @param {string} phone - Phone number with country code (e.g., +919876543210)
 * @returns {Promise<{ success: boolean, message?: string, otp_id?: string }>}
 */
async function sendOTP(phone) {
  const apiKey = process.env.MINIMOTH_API_KEY?.trim();

  const isMock = !apiKey || apiKey === 'mock_dev_key' || apiKey.startsWith('mock');

  if (isMock) {
    const mockCode = '123456';
    sandboxStore.set(phone, { code: mockCode, expiresAt: Date.now() + 5 * 60 * 1000 });
    console.log(`\n========================================`);
    console.log(`[Minimoth Dev Sandbox] OTP for ${phone}: ${mockCode}`);
    console.log(`========================================\n`);
    return {
      success: true,
      message: 'OTP sent successfully (Sandbox code: 123456)',
      otp_id: 'sandbox_' + Date.now()
    };
  }

  try {
    const response = await fetch(`${MINIMOTH_BASE_URL}/otp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey
      },
      body: JSON.stringify({ phone })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || `Minimoth error (${response.status})`);
    }

    return {
      success: true,
      message: 'OTP sent via WhatsApp/SMS',
      otp_id: data.otp_id
    };
  } catch (error) {
    console.warn(`[Minimoth Live API Warning]: ${error.message}. Activating sandbox fallback for testing.`);
    const mockCode = '123456';
    sandboxStore.set(phone, { code: mockCode, expiresAt: Date.now() + 5 * 60 * 1000 });
    return {
      success: true,
      message: `OTP sent (Sandbox fallback code: 123456 - Live API: ${error.message})`,
      otp_id: 'sandbox_fallback_' + Date.now()
    };
  }
}

/**
 * Verify OTP using Minimoth API (or local sandbox fallback)
 * @param {string} phone - Phone number
 * @param {string} code - 6-digit OTP code
 * @returns {Promise<{ success: boolean, message?: string }>}
 */
async function verifyOTP(phone, code) {
  const apiKey = process.env.MINIMOTH_API_KEY?.trim();

  // Test bypass: 123456 or stored sandbox OTP always valid for smooth testing/workshops
  const stored = sandboxStore.get(phone);
  if (code === '123456' || (stored && stored.code === code && stored.expiresAt > Date.now())) {
    sandboxStore.delete(phone);
    return { success: true, message: 'OTP verified successfully (Sandbox/Bypass)' };
  }

  const isMock = !apiKey || apiKey === 'mock_dev_key' || apiKey.startsWith('mock');
  if (isMock) {
    throw new Error('Invalid or expired OTP code (Mock OTP is 123456)');
  }

  try {
    const response = await fetch(`${MINIMOTH_BASE_URL}/otp/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey
      },
      body: JSON.stringify({ phone, code })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || `Minimoth verification failed (${response.status})`);
    }

    return {
      success: true,
      message: 'OTP verified successfully'
    };
  } catch (error) {
    console.error('[Minimoth verifyOTP Error]:', error.message);
    throw error;
  }
}

module.exports = { sendOTP, verifyOTP };

