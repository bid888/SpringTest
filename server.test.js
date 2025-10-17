// Critical API Endpoint Tests
// Testing the core filtering functionality

const request = require('supertest');
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

// Create a test database in memory
const testDb = new sqlite3.Database(':memory:');

// Initialize test database
function initTestDb() {
  return new Promise((resolve, reject) => {
    testDb.serialize(() => {
      testDb.run(`
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
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
}

// Insert test data
function insertTestData() {
  return new Promise((resolve, reject) => {
    const products = [
      { name: 'Premium Laptop', description: 'High-performance laptop', category: 'Electronics', brand: 'TechPro', price: 999.99, stock_quantity: 50, sku: 'LAP-001' },
      { name: 'Wireless Mouse', description: 'Ergonomic wireless mouse', category: 'Electronics', brand: 'TechPro', price: 29.99, stock_quantity: 100, sku: 'MOU-001' },
      { name: 'Classic T-Shirt', description: 'Comfortable cotton t-shirt', category: 'Clothing', brand: 'UrbanStyle', price: 19.99, stock_quantity: 200, sku: 'TSH-001' },
      { name: 'Running Shoes', description: 'Professional running shoes', category: 'Sports & Outdoors', brand: 'ActiveGear', price: 89.99, stock_quantity: 75, sku: 'SHO-001' },
      { name: 'Yoga Mat', description: 'Non-slip yoga mat', category: 'Sports & Outdoors', brand: 'ActiveGear', price: 39.99, stock_quantity: 120, sku: 'YOG-001' }
    ];

    const stmt = testDb.prepare('INSERT INTO products (name, description, category, brand, price, stock_quantity, sku) VALUES (?, ?, ?, ?, ?, ?, ?)');
    
    products.forEach(p => {
      stmt.run(p.name, p.description, p.category, p.brand, p.price, p.stock_quantity, p.sku);
    });

    stmt.finalize((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

// Create test app
function createTestApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // GET /products - Core filtering endpoint
  app.get('/products', (req, res) => {
    const { search, category, brand, minPrice, maxPrice, sortBy = 'name', sortOrder = 'ASC' } = req.query;

    const conditions = [];
    const params = [];

    if (search) {
      conditions.push('(name LIKE ? OR description LIKE ? OR category LIKE ? OR brand LIKE ? OR sku LIKE ?)');
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }

    if (brand) {
      conditions.push('brand = ?');
      params.push(brand);
    }

    if (minPrice) {
      conditions.push('price >= ?');
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      conditions.push('price <= ?');
      params.push(parseFloat(maxPrice));
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const allowedSortFields = ['name', 'price', 'stock_quantity', 'category', 'brand'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'name';
    const order = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const sql = `SELECT * FROM products ${whereClause} ORDER BY ${sortField} ${order}`;

    testDb.all(sql, params, (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to retrieve products' });
      }
      res.json({ products: rows });
    });
  });

  return app;
}

// Test Suite
describe('Product Filtering API - Critical Tests', () => {
  let app;

  beforeAll(async () => {
    await initTestDb();
    await insertTestData();
    app = createTestApp();
  });

  afterAll((done) => {
    testDb.close(done);
  });

  describe('GET /products - Search Functionality', () => {
    test('Should return all products when no filters applied', async () => {
      const response = await request(app).get('/products');
      expect(response.status).toBe(200);
      expect(response.body.products).toHaveLength(5);
    });

    test('Should filter products by search term in name', async () => {
      const response = await request(app).get('/products?search=laptop');
      expect(response.status).toBe(200);
      expect(response.body.products).toHaveLength(1);
      expect(response.body.products[0].name).toBe('Premium Laptop');
    });

    test('Should filter products by search term in description', async () => {
      const response = await request(app).get('/products?search=wireless');
      expect(response.status).toBe(200);
      expect(response.body.products).toHaveLength(1);
      expect(response.body.products[0].name).toBe('Wireless Mouse');
    });

    test('Should return empty array when no products match search', async () => {
      const response = await request(app).get('/products?search=nonexistent');
      expect(response.status).toBe(200);
      expect(response.body.products).toHaveLength(0);
    });

    test('Should be case-insensitive for search', async () => {
      const response = await request(app).get('/products?search=LAPTOP');
      expect(response.status).toBe(200);
      expect(response.body.products.length).toBeGreaterThan(0);
    });

    test('Should search by category name', async () => {
      const response = await request(app).get('/products?search=Electronics');
      expect(response.status).toBe(200);
      expect(response.body.products).toHaveLength(2);
      expect(response.body.products.every(p => p.category === 'Electronics')).toBe(true);
    });

    test('Should search by brand name', async () => {
      const response = await request(app).get('/products?search=TechPro');
      expect(response.status).toBe(200);
      expect(response.body.products).toHaveLength(2);
      expect(response.body.products.every(p => p.brand === 'TechPro')).toBe(true);
    });

    test('Should search by SKU', async () => {
      const response = await request(app).get('/products?search=LAP-001');
      expect(response.status).toBe(200);
      expect(response.body.products).toHaveLength(1);
      expect(response.body.products[0].sku).toBe('LAP-001');
    });

    test('Should search across multiple fields simultaneously', async () => {
      const response = await request(app).get('/products?search=Active');
      expect(response.status).toBe(200);
      // Should find products with "ActiveGear" brand
      expect(response.body.products.length).toBeGreaterThan(0);
      expect(response.body.products.every(p => 
        p.name.includes('Active') || p.description.includes('Active') || 
        p.category.includes('Active') || p.brand.includes('Active') || 
        p.sku.includes('Active')
      )).toBe(true);
    });
  });

  describe('GET /products - Category Filtering', () => {
    test('Should filter by category', async () => {
      const response = await request(app).get('/products?category=Electronics');
      expect(response.status).toBe(200);
      expect(response.body.products).toHaveLength(2);
      expect(response.body.products.every(p => p.category === 'Electronics')).toBe(true);
    });

    test('Should filter by brand', async () => {
      const response = await request(app).get('/products?brand=ActiveGear');
      expect(response.status).toBe(200);
      expect(response.body.products).toHaveLength(2);
      expect(response.body.products.every(p => p.brand === 'ActiveGear')).toBe(true);
    });
  });

  describe('GET /products - Price Range Filtering', () => {
    test('Should filter by minimum price', async () => {
      const response = await request(app).get('/products?minPrice=50');
      expect(response.status).toBe(200);
      expect(response.body.products.every(p => p.price >= 50)).toBe(true);
    });

    test('Should filter by maximum price', async () => {
      const response = await request(app).get('/products?maxPrice=50');
      expect(response.status).toBe(200);
      expect(response.body.products.every(p => p.price <= 50)).toBe(true);
    });

    test('Should filter by price range', async () => {
      const response = await request(app).get('/products?minPrice=30&maxPrice=100');
      expect(response.status).toBe(200);
      expect(response.body.products.every(p => p.price >= 30 && p.price <= 100)).toBe(true);
    });
  });

  describe('GET /products - Sorting', () => {
    test('Should sort by price ascending', async () => {
      const response = await request(app).get('/products?sortBy=price&sortOrder=ASC');
      expect(response.status).toBe(200);
      const prices = response.body.products.map(p => p.price);
      expect(prices).toEqual([...prices].sort((a, b) => a - b));
    });

    test('Should sort by price descending', async () => {
      const response = await request(app).get('/products?sortBy=price&sortOrder=DESC');
      expect(response.status).toBe(200);
      const prices = response.body.products.map(p => p.price);
      expect(prices).toEqual([...prices].sort((a, b) => b - a));
    });

    test('Should sort by name ascending', async () => {
      const response = await request(app).get('/products?sortBy=name&sortOrder=ASC');
      expect(response.status).toBe(200);
      const names = response.body.products.map(p => p.name);
      expect(names).toEqual([...names].sort());
    });
  });

  describe('GET /products - Combined Filters', () => {
    test('Should apply multiple filters simultaneously', async () => {
      const response = await request(app)
        .get('/products?category=Electronics&minPrice=20&maxPrice=50&sortBy=price');
      expect(response.status).toBe(200);
      expect(response.body.products.every(p => 
        p.category === 'Electronics' && p.price >= 20 && p.price <= 50
      )).toBe(true);
    });

    test('Should combine search with category filter', async () => {
      const response = await request(app)
        .get('/products')
        .query({ search: 'shoes', category: 'Sports & Outdoors' });
      expect(response.status).toBe(200);
      expect(response.body.products).toHaveLength(1);
      expect(response.body.products[0].name).toBe('Running Shoes');
    });
  });

  describe('GET /products - Performance', () => {
    test('Should respond within acceptable time (< 100ms for simple query)', async () => {
      const start = Date.now();
      await request(app).get('/products?search=laptop');
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100);
    });

    test('Should handle complex query efficiently', async () => {
      const start = Date.now();
      await request(app).get('/products?search=pro&category=Electronics&minPrice=20&maxPrice=1000&sortBy=price&sortOrder=DESC');
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(150);
    });
  });
});
