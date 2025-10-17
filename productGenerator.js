// Product data generation utilities

const categories = [
  'Electronics',
  'Clothing',
  'Home & Garden',
  'Sports & Outdoors',
  'Books',
  'Toys & Games',
  'Food & Beverages',
  'Health & Beauty',
  'Automotive',
  'Office Supplies'
];

const brands = [
  'TechPro', 'SmartHome', 'EcoLife', 'ActiveGear', 'ComfortZone',
  'PureNature', 'UrbanStyle', 'PowerMax', 'VitalHealth', 'CreativeMinds',
  'GreenChoice', 'ProFit', 'EliteQuality', 'SwiftTech', 'BrightFuture'
];

const productNames = {
  'Electronics': ['Wireless Mouse', 'Bluetooth Speaker', 'Smart Watch', 'USB Cable', 'Power Bank', 'Earbuds', 'Keyboard', 'Monitor', 'Laptop Stand', 'Webcam'],
  'Clothing': ['T-Shirt', 'Jeans', 'Sneakers', 'Jacket', 'Dress', 'Hoodie', 'Socks', 'Cap', 'Scarf', 'Gloves'],
  'Home & Garden': ['Plant Pot', 'Lamp', 'Cushion', 'Rug', 'Curtains', 'Wall Art', 'Vase', 'Candle', 'Storage Box', 'Clock'],
  'Sports & Outdoors': ['Yoga Mat', 'Dumbbell', 'Water Bottle', 'Tent', 'Backpack', 'Sleeping Bag', 'Hiking Boots', 'Bike Helmet', 'Running Shoes', 'Fitness Band'],
  'Books': ['Mystery Novel', 'Cookbook', 'Self-Help Guide', 'Biography', 'Science Fiction', 'History Book', 'Travel Guide', 'Poetry Collection', 'Art Book', 'Technical Manual'],
  'Toys & Games': ['Board Game', 'Puzzle', 'Action Figure', 'Building Blocks', 'Doll', 'RC Car', 'Card Game', 'Educational Toy', 'Sports Ball', 'Craft Kit'],
  'Food & Beverages': ['Organic Coffee', 'Green Tea', 'Protein Bar', 'Dried Fruits', 'Nuts Mix', 'Chocolate', 'Honey', 'Olive Oil', 'Spice Set', 'Energy Drink'],
  'Health & Beauty': ['Moisturizer', 'Shampoo', 'Sunscreen', 'Face Mask', 'Lip Balm', 'Hand Cream', 'Body Lotion', 'Essential Oil', 'Vitamin Supplement', 'Face Serum'],
  'Automotive': ['Car Charger', 'Air Freshener', 'Phone Mount', 'Seat Cover', 'Floor Mat', 'Cleaning Kit', 'Tool Set', 'Emergency Kit', 'Dash Cam', 'Tire Gauge'],
  'Office Supplies': ['Notebook', 'Pen Set', 'Desk Organizer', 'Stapler', 'Paper Clips', 'Folder', 'Planner', 'Sticky Notes', 'Calculator', 'Tape Dispenser']
};

const adjectives = ['Premium', 'Deluxe', 'Professional', 'Ultimate', 'Essential', 'Compact', 'Portable', 'Advanced', 'Classic', 'Modern'];

function generateSKU() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  let sku = '';
  
  // Generate format: ABC-12345
  for (let i = 0; i < 3; i++) {
    sku += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  sku += '-';
  for (let i = 0; i < 5; i++) {
    sku += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  
  return sku;
}

function generateDescription(category, name, brand) {
  const descriptions = [
    `High-quality ${name} from ${brand}. Perfect for everyday use.`,
    `Experience excellence with this ${name} by ${brand}. Built to last.`,
    `${brand}'s ${name} offers superior performance and reliability.`,
    `Discover the perfect ${name} for your needs. Made by ${brand}.`,
    `Premium ${name} designed with care by ${brand}. Exceptional value.`,
    `Get the best ${name} on the market from ${brand}. Customer favorite.`,
    `${brand} brings you an outstanding ${name}. Quality guaranteed.`,
    `Transform your ${category.toLowerCase()} experience with this ${name} from ${brand}.`,
    `Innovative ${name} by ${brand}. The smart choice for quality.`,
    `Trusted ${name} from ${brand}. Loved by thousands of customers.`
  ];
  
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

function generateProduct(index) {
  const category = categories[Math.floor(Math.random() * categories.length)];
  const brand = brands[Math.floor(Math.random() * brands.length)];
  const baseName = productNames[category][Math.floor(Math.random() * productNames[category].length)];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const name = `${adjective} ${baseName}`;
  
  const price = (Math.random() * (500 - 9.99) + 9.99).toFixed(2);
  const stockQuantity = Math.floor(Math.random() * 1000);
  const sku = generateSKU();
  const description = generateDescription(category, baseName, brand);
  
  return {
    name,
    description,
    category,
    brand,
    price: parseFloat(price),
    stock_quantity: stockQuantity,
    sku
  };
}

function generateProducts(count) {
  const products = [];
  const skus = new Set();
  
  let attempts = 0;
  const maxAttempts = count * 3; // Prevent infinite loop
  
  while (products.length < count && attempts < maxAttempts) {
    attempts++;
    const product = generateProduct(products.length);
    
    // Ensure unique SKU
    if (!skus.has(product.sku)) {
      skus.add(product.sku);
      products.push(product);
    }
  }
  
  return products;
}

module.exports = {
  generateProducts,
  categories,
  brands
};
