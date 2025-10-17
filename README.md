# Product Filter Application

A full-stack web application with dynamic product filtering capabilities. Built with React frontend and Node.js/Express backend with SQLite database.

## Features

- Dynamic product generation (100-1,000+ products)
- Advanced filtering (category, brand, price range, search)
- Real-time debounced search
- Sorting and pagination
- Statistics dashboard
- Responsive design

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

### 1. Install Backend Dependencies

```bash
npm install
```

### 2. Install Frontend Dependencies

```bash
cd client
npm install
cd ..
```

## Running the Application

### Development Mode (Recommended)

**Terminal 1 - Start Backend Server:**
```bash
npm start
```
Backend runs on `http://localhost:3003`

**Terminal 2 - Start React Frontend:**
```bash
cd client
npm start
```
Frontend runs on `http://localhost:3000`

**Access the application:** http://localhost:3000

### Production Build

1. **Build the React app:**
```bash
cd client
npm run build
cd ..
```

2. **Start the production server:**
```bash
npm start
```

Access at `http://localhost:3003`

## Quick Start

1. Open http://localhost:3000
2. Click "Generate Products" and enter a number (e.g., 100)
3. Use the left sidebar to filter products:
   - Search by name, description, category, brand, or SKU
   - Filter by category and brand
   - Set price range
   - Sort results
4. Browse through paginated results

## Running Tests

```bash
npm test
```

## Project Structure

```
product-filter-app/
├── server.js              # Express API server
├── database.js            # SQLite database setup
├── productGenerator.js    # Data generation
├── package.json           # Backend dependencies
└── client/                # React frontend
    ├── package.json       # Frontend dependencies
    ├── public/
    └── src/
        ├── App.js
        ├── App.css
        ├── config/
        │   └── api.js     # API endpoint config
        └── components/
            ├── ProductGenerator.js
            ├── ProductFilters.js
            ├── ProductList.js
            ├── ProductCard.js
            ├── Statistics.js
            └── Pagination.js
```

## Tech Stack

**Backend:**
- Node.js + Express
- SQLite3
- RESTful API

**Frontend:**
- React 19
- Axios
- Modern CSS

## API Endpoints

- `POST /products/generate` - Generate products
- `GET /products` - Get filtered products
- `GET /products/stats` - Get statistics
- `GET /products/filters` - Get filter options
- `DELETE /products` - Clear all products

## Performance Features

- Database indexes on category, brand, price
- Batch inserts (50 products per transaction)
- Pagination (50 items per page)
- Debounced search (500ms)
- Optimized SQL queries

Handles 1,000+ products efficiently with <100ms response times.

## Troubleshooting

**Port already in use:**
- Backend: Change PORT in server.js
- Frontend: React will automatically suggest next available port

**Database errors:**
- Delete `products.db` file and restart server

**Module not found:**
- Run `npm install` in root directory
- Run `npm install` in client directory

## License

ISC
