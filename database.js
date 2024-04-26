const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'economy.db');

// Connect to the SQLite database, or create it if it doesn't exist
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Error when connecting to the database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Function to initialize the database
const initDb = () => {
    db.serialize(() => {
        // Create table for user balances
        db.run(`CREATE TABLE IF NOT EXISTS balances (
            userId TEXT PRIMARY KEY,
            balance INTEGER DEFAULT 1000
        )`);

        // Create table for items
        db.run(`CREATE TABLE IF NOT EXISTS items (
            itemId INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            price INTEGER
        )`, (err) => {
            if (err) {
                console.error("Error creating items table", err.message);
            } else {
                // Optionally populate the table with initial items
                db.run(`INSERT OR IGNORE INTO items (name, price) VALUES
                    ('Magic Sword', 300),
                    ('Healing Potion', 50)
                `);
            }
        });
    });
};

// Export the database connection and initialization function
module.exports = {
    db,
    initDb
};
