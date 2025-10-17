const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, 'products.db');

// Create and initialize database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database schema
function initializeDatabase() {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT,
      brand TEXT,
      price REAL NOT NULL,
      stock_quantity INTEGER NOT NULL,
      sku TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.run(createTableSQL, (err) => {
    if (err) {
      console.error('Error creating table:', err.message);
    } else {
      console.log('Products table ready');
      
      // Create indexes for better query performance
      db.run('CREATE INDEX IF NOT EXISTS idx_category ON products(category)', (err) => {
        if (err) console.error('Error creating category index:', err.message);
      });
      
      db.run('CREATE INDEX IF NOT EXISTS idx_brand ON products(brand)', (err) => {
        if (err) console.error('Error creating brand index:', err.message);
      });
      
      db.run('CREATE INDEX IF NOT EXISTS idx_price ON products(price)', (err) => {
        if (err) console.error('Error creating price index:', err.message);
      });
    }
  });
}

module.exports = db;
