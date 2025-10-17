import React, { useState, useEffect } from 'react';
import './App.css';
import ProductGenerator from './components/ProductGenerator';
import ProductFilters from './components/ProductFilters';
import ProductList from './components/ProductList';
import Statistics from './components/Statistics';
import axios from 'axios';
import { API_BASE_URL } from './config/api';

function App() {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'name',
    sortOrder: 'ASC',
    page: 1,
    limit: 50
  });
  const [loading, setLoading] = useState(false);

  // Load statistics
  const loadStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Load products
  const loadProducts = async (currentFilters = filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      Object.keys(currentFilters).forEach(key => {
        if (currentFilters[key]) {
          params.append(key, currentFilters[key]);
        }
      });

      const response = await axios.get(`${API_BASE_URL}/products?${params.toString()}`);
      setProducts(response.data.products);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
    loadProducts(updatedFilters);
  };

  // Handle page change
  const handlePageChange = (page) => {
    const updatedFilters = { ...filters, page };
    setFilters(updatedFilters);
    loadProducts(updatedFilters);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle reset filters
  const handleResetFilters = () => {
    const resetFilters = {
      search: '',
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'name',
      sortOrder: 'ASC',
      page: 1,
      limit: 50
    };
    setFilters(resetFilters);
    loadProducts(resetFilters);
  };

  // Handle products generated
  const handleProductsGenerated = () => {
    loadStats();
    loadProducts();
  };

  // Initial load
  useEffect(() => {
    loadStats();
    loadProducts();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="App">
      <header className="app-header">
        <h1>🛍️ Product Filter Application</h1>
        <p className="subtitle">Dynamic product filtering with advanced search - React Edition</p>
      </header>

      <div className="app-container">
        <ProductGenerator onGenerated={handleProductsGenerated} />
        
        {stats && <Statistics stats={stats} />}
        
        <div className="main-content">
          <aside className="sidebar">
            <ProductFilters 
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
            />
          </aside>
          
          <main className="content-area">
            <ProductList 
              products={products}
              pagination={pagination}
              loading={loading}
              onPageChange={handlePageChange}
            />
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
