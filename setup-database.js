const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'economy.db');

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Error when connecting to the database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

const initDb = () => {
    db.serialize(() => {
        // Ensures the table 'balances' exists and has the necessary columns
        db.run(`CREATE TABLE IF NOT EXISTS balances (
            userId TEXT PRIMARY KEY,
            balance INTEGER DEFAULT 0,
            lastClaimed INTEGER DEFAULT 0
        )`);

        // Attempt to add the 'lastClaimed' column if it doesn't exist (safe to run multiple times)
        db.run(`ALTER TABLE balances ADD COLUMN lastClaimed INTEGER DEFAULT 0`, (alterErr) => {
            if (alterErr) {
                console.log("Column 'lastClaimed' already exists or another error occurred.");
            } else {
                console.log("Column 'lastClaimed' added successfully.");
            }
        });

        // Ensures the table 'items' exists
        db.run(`CREATE TABLE IF NOT EXISTS items (
            itemId INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            price INTEGER
        )`);

        // Create a new table for storing birthdays
        db.run(`CREATE TABLE IF NOT EXISTS birthdays (
            userId TEXT PRIMARY KEY,
            birthday DATE NOT NULL
        )`, (err) => {
            if (err) {
                console.log("Failed to create the birthdays table:", err.message);
            } else {
                console.log("Birthdays table created successfully.");
            }
        });
    });
};

initDb();

module.exports = {
    db,
    initDb
};
