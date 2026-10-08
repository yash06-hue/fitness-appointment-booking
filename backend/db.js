const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.join(__dirname, 'fitness.db');
const db = new DatabaseSync(dbPath);

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON;');

// Create tables for the 3 models
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS trainers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    experience_years INTEGER NOT NULL,
    hourly_rate REAL NOT NULL,
    image_url TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    trainer_id INTEGER NOT NULL,
    booking_date TEXT NOT NULL,
    time_slot TEXT NOT NULL,
    status TEXT DEFAULT 'confirmed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (trainer_id) REFERENCES trainers(id)
  );
`);

// Auto-seed initial trainers if table is empty
const trainerCount = db.prepare('SELECT COUNT(*) as count FROM trainers').get();
if (trainerCount.count === 0) {
  const insertTrainer = db.prepare(`
    INSERT INTO trainers (name, specialty, experience_years, hourly_rate, image_url)
    VALUES (?, ?, ?, ?, ?)
  `);

  const initialTrainers = [
    {
      name: 'Alex Rivera',
      specialty: 'Strength & Conditioning',
      experience_years: 7,
      hourly_rate: 45,
      image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Maya Patel',
      specialty: 'Yoga & Functional Mobility',
      experience_years: 5,
      hourly_rate: 40,
      image_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Marcus Chen',
      specialty: 'HIIT & Athletic Cardio',
      experience_years: 6,
      hourly_rate: 50,
      image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Sarah Jenkins',
      specialty: 'Core & Pilates Flow',
      experience_years: 4,
      hourly_rate: 35,
      image_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80'
    }
  ];

  for (const t of initialTrainers) {
    insertTrainer.run(t.name, t.specialty, t.experience_years, t.hourly_rate, t.image_url);
  }
  console.log('Seeded default fitness trainers into SQLite database.');
}

module.exports = db;

