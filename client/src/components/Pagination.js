import React from 'react';

function Pagination({ pagination, onPageChange }) {
  const { page, totalPages } = pagination;
  const maxPagesToShow = 5;

  const renderPageButtons = () => {
    const buttons = [];
    let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    // First page button
    if (startPage > 1) {
      buttons.push(
        <button key={1} onClick={() => onPageChange(1)} className="page-btn">
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(<span key="dots-start" className="pagination-dots">...</span>);
      }
    }

    // Page number buttons
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`page-btn ${i === page ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    // Last page button
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(<span key="dots-end" className="pagination-dots">...</span>);
      }
      buttons.push(
        <button
          key={totalPages}
          onClick={() => onPageChange(totalPages)}
          className="page-btn"
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  return (
    <div className="pagination">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="page-btn nav-btn"
      >
        ← Previous
      </button>

      {renderPageButtons()}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="page-btn nav-btn"
      >
        Next →
      </button>
    </div>
  );
}

export default Pagination;
