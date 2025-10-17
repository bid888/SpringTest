# Product Filter Application

A full-stack web application with dynamic product filtering capabilities, built with React frontend and Node.js/Express backend with SQLite database.

## Features

- **Dynamic Product Generation**: Generate 100+ products with realistic data
- **Advanced Filtering**: Filter by category, brand, price range, and search
- **Real-time Search**: Debounced search with instant results
- **Sorting**: Sort products by name, price, stock quantity, category, or brand
- **Pagination**: Efficient pagination for large datasets
- **Statistics Dashboard**: View real-time database statistics
- **Responsive Design**: Mobile-friendly interface
- **Performance Optimized**: Indexed database queries and batch operations

## Tech Stack

### Backend
- **Node.js** with Express.js
- **SQLite3** database
- **CORS** enabled for API access
- RESTful API design

### Frontend
- **React 19** with Hooks
- **Axios** for API requests
- Modern CSS with Flexbox and Grid
- Responsive design

## Project Structure

```
product-filter-app/
├── server.js              # Express server
├── database.js            # SQLite database setup
├── productGenerator.js    # Product data generation logic
├── package.json           # Backend dependencies
├── products.db            # SQLite database file (auto-generated)
├── public/                # Static vanilla JS version (legacy)
│   ├── index.html
│   ├── styles.css
│   └── app.js
└── client/                # React frontend
    ├── package.json
    ├── public/
    └── src/
        ├── App.js
        ├── App.css
        └── components/
            ├── ProductGenerator.js
            ├── Statistics.js
            ├── ProductFilters.js
            ├── ProductList.js
            ├── ProductCard.js
            └── Pagination.js
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Setup

1. **Clone the repository** (or navigate to the project directory)

2. **Install backend dependencies**:
```bash
npm install
```

3. **Install frontend dependencies**:
```bash
cd client
npm install
cd ..
```

## Running the Application

### Option 1: Run Both Servers Separately (Recommended for Development)

1. **Start the backend server** (from project root):
```bash
npm start
```
The backend API will run on `http://localhost:3000`

2. **In a new terminal, start the React frontend**:
```bash
cd client
npm start
```
The React app will run on `http://localhost:3001` (or next available port)

### Option 2: Build and Serve Production Version

1. **Build the React app**:
```bash
cd client
npm run build
cd ..
```

2. **Update server.js to serve the React build** (add before other routes):
```javascript
app.use(express.static(path.join(__dirname, 'client/build')));
```

3. **Start the server**:
```bash
npm start
```
Access the app at `http://localhost:3000`

## API Endpoints

### POST /products/generate
Generate products and store in database.

**Request Body**:
```json
{
  "count": 100,
  "clearExisting": true
}
```

**Response**:
```json
{
  "message": "Successfully generated 100 products",
  "count": 100,
  "skipped": 0
}
```

### GET /products
Retrieve products with filtering and pagination.

**Query Parameters**:
- `search` (string): Search in product name and description
- `category` (string): Filter by category
- `brand` (string): Filter by brand
- `minPrice` (number): Minimum price
- `maxPrice` (number): Maximum price
- `minStock` (number): Minimum stock quantity
- `maxStock` (number): Maximum stock quantity
- `sortBy` (string): Sort field (name, price, stock_quantity, category, brand)
- `sortOrder` (string): ASC or DESC
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 50)

**Example**:
```
GET /products?category=Electronics&minPrice=50&maxPrice=500&sortBy=price&sortOrder=ASC&page=1
```

**Response**:
```json
{
  "products": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 50,
    "totalPages": 2
  },
  "filters": {...}
}
```

### GET /products/stats
Get database statistics.

**Response**:
```json
{
  "total_products": 100,
  "total_categories": 10,
  "total_brands": 15,
  "min_price": 10.50,
  "max_price": 499.99,
  "avg_price": 155.75,
  "total_stock": 45678
}
```

### GET /products/filters
Get available filter options.

**Response**:
```json
{
  "categories": ["Electronics", "Clothing", ...],
  "brands": ["TechPro", "SmartHome", ...]
}
```

### DELETE /products
Clear all products from database.

**Response**:
```json
{
  "message": "All products cleared successfully"
}
```

## Product Schema

Each product has the following properties:

```javascript
{
  id: INTEGER (auto-increment),
  name: STRING,
  description: STRING,
  category: STRING,
  brand: STRING,
  price: FLOAT,
  stock_quantity: INTEGER,
  sku: STRING (unique),
  created_at: DATETIME
}
```

## Performance Optimizations

1. **Database Indexing**: Indexes on category, brand, and price fields
2. **Batch Inserts**: Products inserted in batches of 50 for efficiency
3. **Pagination**: Large datasets split into pages
4. **Debounced Search**: Search input debounced for 500ms
5. **Efficient Queries**: Parameterized queries with proper WHERE clauses

## Optional Challenge: 1,000+ Products

The application is optimized to handle 1,000+ products efficiently:

```bash
# Generate 1,000 products
POST /products/generate
{
  "count": 1000,
  "clearExisting": true
}
```

Performance features:
- Database indexes ensure fast queries even with large datasets
- Pagination prevents loading all products at once
- Batch operations for efficient data insertion
- Optimized SQL queries with proper filtering

## Development

### Backend Development
```bash
# Run with nodemon for auto-restart
npm install nodemon --save-dev
npm run dev
```

### Frontend Development
```bash
cd client
npm start
```

### Testing
```bash
# Backend tests (if implemented)
npm test

# Frontend tests
cd client
npm test
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

ISC

## Author

Built as a technical assessment demonstrating:
- Backend API development
- Database design and optimization
- React component architecture
- State management
- Responsive UI design
- Performance optimization
