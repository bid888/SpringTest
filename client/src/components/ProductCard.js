import React from 'react';

function ProductCard({ product }) {
  return (
    <div className="product-card">
      <div className="product-name">{product.name}</div>
      <div className="product-description">{product.description}</div>
      
      <div className="product-meta">
        <span className="meta-badge category-badge">{product.category}</span>
        <span className="meta-badge brand-badge">{product.brand}</span>
      </div>
      
      <div className="product-details">
        <div>
          <div className="product-price">${parseFloat(product.price).toFixed(2)}</div>
          <div className="product-sku">SKU: {product.sku}</div>
        </div>
        <div className={`product-stock ${product.stock_quantity < 10 ? 'low-stock' : ''}`}>
          {product.stock_quantity} in stock
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
