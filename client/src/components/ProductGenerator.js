import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

function ProductGenerator({ onGenerated }) {
  const [count, setCount] = useState(100);
  const [clearExisting, setClearExisting] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleGenerate = async () => {
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await axios.post(`${API_BASE_URL}/products/generate`, {
        count: parseInt(count),
        clearExisting
      });

      setMessage({ 
        text: response.data.message, 
        type: 'success' 
      });
      
      // Notify parent component
      if (onGenerated) {
        onGenerated();
      }
    } catch (error) {
      setMessage({ 
        text: error.response?.data?.error || 'Failed to generate products. Make sure the server is running.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-generator">
      <h2>Generate Products</h2>
      <div className="generator-controls">
        <input
          type="number"
          value={count}
          onChange={(e) => setCount(e.target.value)}
          min="1"
          max="10000"
          placeholder="Number of products"
          className="input-number"
        />
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={clearExisting}
            onChange={(e) => setClearExisting(e.target.checked)}
          />
          Clear existing products
        </label>
        <button 
          onClick={handleGenerate} 
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? 'Generating...' : 'Generate Products'}
        </button>
      </div>
      {message.text && (
        <div className={`status-message ${message.type}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}

export default ProductGenerator;
