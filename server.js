const express = require('express');
const cors = require('cors');
const db = require('./database');
const { generateProducts, categories, brands } = require('./productGenerator');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// POST /products/generate - Generate and store products
app.post('/products/generate', async (req, res) => {
  try {
    const count = parseInt(req.body.count) || 100;
    
    // Validate count
    if (count < 1 || count > 10000) {
      return res.status(400).json({ 
        error: 'Count must be between 1 and 10000' 
      });
    }

    console.log(`Generating ${count} products...`);
    const products = generateProducts(count);

    // Clear existing products if requested
    if (req.body.clearExisting) {
      await new Promise((resolve, reject) => {
        db.run('DELETE FROM products', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    // Insert products in batches for better performance
    const batchSize = 50;
    let inserted = 0;
    let skipped = 0;

    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      const placeholders = batch.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ');
      const values = batch.flatMap(p => [
        p.name,
        p.description,
        p.category,
        p.brand,
        p.price,
        p.stock_quantity,
        p.sku
      ]);

      await new Promise((resolve, reject) => {
        const sql = `INSERT INTO products (name, description, category, brand, price, stock_quantity, sku) VALUES ${placeholders}`;
        db.run(sql, values, function(err) {
          if (err) {
            // Handle duplicate SKU errors
            if (err.message.includes('UNIQUE constraint failed')) {
              skipped += batch.length;
              resolve();
            } else {
              reject(err);
            }
          } else {
            inserted += batch.length;
            resolve();
          }
        });
      });
    }

    console.log(`Generated ${inserted} products (${skipped} skipped due to duplicates)`);

    res.json({
      message: `Successfully generated ${inserted} products`,
      count: inserted,
      skipped: skipped
    });

  } catch (error) {
    console.error('Error generating products:', error);
    res.status(500).json({ error: 'Failed to generate products' });
  }
});

// GET /products - Retrieve products with filtering
app.get('/products', async (req, res) => {
  // Add artificial delay to demonstrate loading state (remove in production)
  await new Promise(resolve => setTimeout(resolve, 800));
  
  try {
    const {
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      minStock,
      maxStock,
      sortBy = 'name',
      sortOrder = 'ASC',
      page = 1,
      limit = 50
    } = req.query;

    // Build WHERE clause
    const conditions = [];
    const params = [];

    // Search in name and description
    if (search) {
      conditions.push('(name LIKE ? OR description LIKE ?)');
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern);
    }

    // Filter by category
    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }

    // Filter by brand
    if (brand) {
      conditions.push('brand = ?');
      params.push(brand);
    }

    // Filter by price range
    if (minPrice) {
      conditions.push('price >= ?');
      params.push(parseFloat(minPrice));
    }
    if (maxPrice) {
      conditions.push('price <= ?');
      params.push(parseFloat(maxPrice));
    }

    // Filter by stock quantity
    if (minStock) {
      conditions.push('stock_quantity >= ?');
      params.push(parseInt(minStock));
    }
    if (maxStock) {
      conditions.push('stock_quantity <= ?');
      params.push(parseInt(maxStock));
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Validate sort parameters
    const allowedSortFields = ['name', 'price', 'stock_quantity', 'category', 'brand', 'created_at'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'name';
    const order = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    // Calculate pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const limitValue = parseInt(limit);

    // Get total count
    const countSQL = `SELECT COUNT(*) as total FROM products ${whereClause}`;
    db.get(countSQL, params, (err, countRow) => {
      if (err) {
        console.error('Error counting products:', err);
        return res.status(500).json({ error: 'Failed to retrieve products' });
      }

      const total = countRow.total;

      // Get products
      const sql = `
        SELECT id, name, description, category, brand, price, stock_quantity, sku, created_at
        FROM products
        ${whereClause}
        ORDER BY ${sortField} ${order}
        LIMIT ? OFFSET ?
      `;

      db.all(sql, [...params, limitValue, offset], (err, rows) => {
        if (err) {
          console.error('Error retrieving products:', err);
          return res.status(500).json({ error: 'Failed to retrieve products' });
        }

        res.json({
          products: rows,
          pagination: {
            total,
            page: parseInt(page),
            limit: limitValue,
            totalPages: Math.ceil(total / limitValue)
          },
          filters: {
            search,
            category,
            brand,
            minPrice,
            maxPrice,
            minStock,
            maxStock,
            sortBy: sortField,
            sortOrder: order
          }
        });
      });
    });

  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// GET /products/stats - Get statistics about products
app.get('/products/stats', (req, res) => {
  const statsSQL = `
    SELECT 
      COUNT(*) as total_products,
      COUNT(DISTINCT category) as total_categories,
      COUNT(DISTINCT brand) as total_brands,
      MIN(price) as min_price,
      MAX(price) as max_price,
      AVG(price) as avg_price,
      SUM(stock_quantity) as total_stock
    FROM products
  `;

  db.get(statsSQL, [], (err, stats) => {
    if (err) {
      console.error('Error getting stats:', err);
      return res.status(500).json({ error: 'Failed to get statistics' });
    }

    res.json(stats);
  });
});

// GET /products/filters - Get available filter options
app.get('/products/filters', (req, res) => {
  res.json({
    categories: categories,
    brands: brands
  });
});

// DELETE /products - Clear all products
app.delete('/products', (req, res) => {
  db.run('DELETE FROM products', (err) => {
    if (err) {
      console.error('Error clearing products:', err);
      return res.status(500).json({ error: 'Failed to clear products' });
    }

    res.json({ message: 'All products cleared successfully' });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API endpoints:`);
  console.log(`  POST   /products/generate - Generate products`);
  console.log(`  GET    /products - Get products with filters`);
  console.log(`  GET    /products/stats - Get product statistics`);
  console.log(`  GET    /products/filters - Get available filters`);
  console.log(`  DELETE /products - Clear all products`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('\nDatabase connection closed');
    }
    process.exit(0);
  });
});
