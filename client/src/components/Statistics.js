import React from 'react';

function Statistics({ stats }) {
  return (
    <div className="statistics">
      <h3>Database Statistics</h3>
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-label">Total Products</span>
          <span className="stat-value">{stats.total_products || 0}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Categories</span>
          <span className="stat-value">{stats.total_categories || 0}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Brands</span>
          <span className="stat-value">{stats.total_brands || 0}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Avg Price</span>
          <span className="stat-value">
            ${stats.avg_price ? parseFloat(stats.avg_price).toFixed(2) : '0.00'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default Statistics;
