import React from 'react';
import ProductCard from './ProductCard';
import Pagination from './Pagination';

function ProductList({ products, pagination, loading, onPageChange }) {
  // Show empty state only when not loading and no products
  if (!loading && (!products || products.length === 0)) {
    return (
      <div className="product-list">
        <div className="results-header">
          <h2>Products <span className="results-count">(0)</span></h2>
        </div>
        <div className="empty-state">
          <p>No products found. Try adjusting your filters or generate some products!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-list">
      <div className="results-header">
        <h2>Products <span className="results-count">({pagination?.total || 0})</span></h2>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      ) : (
        <>
          <div className="products-grid">
            {products && products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <Pagination pagination={pagination} onPageChange={onPageChange} />
          )}
        </>
      )}
    </div>
  );
}

export default ProductList;
