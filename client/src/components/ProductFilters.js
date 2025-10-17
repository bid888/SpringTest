import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

function ProductFilters({ filters, onFilterChange, onReset }) {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const loadFilterOptions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/filters`);
      setCategories(response.data.categories);
      setBrands(response.data.brands);
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApplyFilters = () => {
    onFilterChange(localFilters);
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localFilters.search !== filters.search) {
        onFilterChange({ search: localFilters.search });
      }
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, [localFilters.search]);

  return (
    <div className="product-filters">
      <h2>Filter Products</h2>
      <div className="filter-grid">
        <div className="filter-group">
          <label>Search</label>
          <input
            type="text"
            value={localFilters.search}
            onChange={(e) => handleInputChange('search', e.target.value)}
            placeholder="Search products..."
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label>Category</label>
          <select
            value={localFilters.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Brand</label>
          <select
            value={localFilters.brand}
            onChange={(e) => handleInputChange('brand', e.target.value)}
            className="filter-select"
          >
            <option value="">All Brands</option>
            {brands.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Min Price</label>
          <input
            type="number"
            value={localFilters.minPrice}
            onChange={(e) => handleInputChange('minPrice', e.target.value)}
            placeholder="Min"
            step="0.01"
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label>Max Price</label>
          <input
            type="number"
            value={localFilters.maxPrice}
            onChange={(e) => handleInputChange('maxPrice', e.target.value)}
            placeholder="Max"
            step="0.01"
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label>Sort By</label>
          <select
            value={localFilters.sortBy}
            onChange={(e) => handleInputChange('sortBy', e.target.value)}
            className="filter-select"
          >
            <option value="name">Name</option>
            <option value="price">Price</option>
            <option value="stock_quantity">Stock</option>
            <option value="category">Category</option>
            <option value="brand">Brand</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Order</label>
          <select
            value={localFilters.sortOrder}
            onChange={(e) => handleInputChange('sortOrder', e.target.value)}
            className="filter-select"
          >
            <option value="ASC">Ascending</option>
            <option value="DESC">Descending</option>
          </select>
        </div>

        <div className="filter-group filter-actions">
          <button onClick={handleApplyFilters} className="btn btn-secondary">
            Apply Filters
          </button>
          <button onClick={onReset} className="btn btn-tertiary">
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductFilters;
