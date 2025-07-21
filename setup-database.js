const path = require('path');
const Database = require('better-sqlite3');
const dbPath = path.resolve(__dirname, 'economy.db');

const db = new Database(dbPath);

const initDb = () => {
    db.prepare(`CREATE TABLE IF NOT EXISTS balances (
        userId TEXT PRIMARY KEY,
        balance INTEGER DEFAULT 0,
        lastClaimed INTEGER DEFAULT 0
    )`).run();

    // Try to add lastClaimed column — if it already exists, ignore
    try {
        db.prepare(`ALTER TABLE balances ADD COLUMN lastClaimed INTEGER DEFAULT 0`).run();
    } catch (err) {
        console.log("Column 'lastClaimed' already exists or failed to add.");
    }

    db.prepare(`CREATE TABLE IF NOT EXISTS items (
        itemId INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        price INTEGER
    )`).run();

    db.prepare(`CREATE TABLE IF NOT EXISTS birthdays (
        userId TEXT PRIMARY KEY,
        birthday DATE NOT NULL
    )`).run();

    db.prepare(`CREATE TABLE IF NOT EXISTS movie_suggestions (
        userId TEXT,
        suggestion TEXT
    )`).run();
};

initDb();

module.exports = { db, initDb };
