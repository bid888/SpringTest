const API_BASE_URL = 'http://localhost:3000';

let currentPage = 1;
let currentFilters = {};

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadFilterOptions();
    loadStats();
    loadProducts();
});

// Event Listeners
function initializeEventListeners() {
    document.getElementById('generateBtn').addEventListener('click', generateProducts);
    document.getElementById('applyFiltersBtn').addEventListener('click', applyFilters);
    document.getElementById('resetFiltersBtn').addEventListener('click', resetFilters);
    
    // Real-time search with debounce
    let searchTimeout;
    document.getElementById('searchInput').addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            applyFilters();
        }, 500);
    });
}

// Generate Products
async function generateProducts() {
    const btn = document.getElementById('generateBtn');
    const statusEl = document.getElementById('generateStatus');
    const count = document.getElementById('productCount').value;
    const clearExisting = document.getElementById('clearExisting').checked;

    btn.disabled = true;
    btn.textContent = 'Generating...';
    statusEl.textContent = '';
    statusEl.className = 'status-message';

    try {
        const response = await fetch(`${API_BASE_URL}/products/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                count: parseInt(count),
                clearExisting: clearExisting
            })
        });

        const data = await response.json();

        if (response.ok) {
            statusEl.textContent = data.message;
            statusEl.className = 'status-message success';
            
            // Reload stats and products
            await loadStats();
            await loadProducts();
        } else {
            statusEl.textContent = data.error || 'Failed to generate products';
            statusEl.className = 'status-message error';
        }
    } catch (error) {
        console.error('Error:', error);
        statusEl.textContent = 'Network error. Make sure the server is running.';
        statusEl.className = 'status-message error';
    } finally {
        btn.disabled = false;
        btn.textContent = 'Generate Products';
    }
}

// Load Statistics
async function loadStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/products/stats`);
        const stats = await response.json();

        document.getElementById('statTotal').textContent = stats.total_products || 0;
        document.getElementById('statCategories').textContent = stats.total_categories || 0;
        document.getElementById('statBrands').textContent = stats.total_brands || 0;
        document.getElementById('statAvgPrice').textContent = stats.avg_price 
            ? `$${parseFloat(stats.avg_price).toFixed(2)}` 
            : '$0';
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load Filter Options
async function loadFilterOptions() {
    try {
        const response = await fetch(`${API_BASE_URL}/products/filters`);
        const data = await response.json();

        // Populate category dropdown
        const categorySelect = document.getElementById('categoryFilter');
        data.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });

        // Populate brand dropdown
        const brandSelect = document.getElementById('brandFilter');
        data.brands.forEach(brand => {
            const option = document.createElement('option');
            option.value = brand;
            option.textContent = brand;
            brandSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading filter options:', error);
    }
}

// Apply Filters
function applyFilters() {
    currentPage = 1;
    
    currentFilters = {
        search: document.getElementById('searchInput').value.trim(),
        category: document.getElementById('categoryFilter').value,
        brand: document.getElementById('brandFilter').value,
        minPrice: document.getElementById('minPrice').value,
        maxPrice: document.getElementById('maxPrice').value,
        sortBy: document.getElementById('sortBy').value,
        sortOrder: document.getElementById('sortOrder').value
    };

    loadProducts();
}

// Reset Filters
function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('brandFilter').value = '';
    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';
    document.getElementById('sortBy').value = 'name';
    document.getElementById('sortOrder').value = 'ASC';
    
    currentFilters = {};
    currentPage = 1;
    loadProducts();
}

// Load Products
async function loadProducts(page = 1) {
    const loadingEl = document.getElementById('loadingIndicator');
    const gridEl = document.getElementById('productsGrid');
    const paginationEl = document.getElementById('pagination');

    loadingEl.style.display = 'block';

    try {
        // Build query string
        const params = new URLSearchParams({
            page: page,
            limit: 50,
            ...currentFilters
        });

        // Remove empty parameters
        for (let [key, value] of [...params.entries()]) {
            if (!value) {
                params.delete(key);
            }
        }

        const response = await fetch(`${API_BASE_URL}/products?${params.toString()}`);
        const data = await response.json();

        if (response.ok) {
            displayProducts(data.products);
            displayPagination(data.pagination);
            updateResultsCount(data.pagination.total);
        } else {
            throw new Error(data.error || 'Failed to load products');
        }
    } catch (error) {
        console.error('Error loading products:', error);
        gridEl.innerHTML = `
            <div class="empty-state">
                <p>Error loading products. Please make sure the server is running.</p>
            </div>
        `;
    } finally {
        loadingEl.style.display = 'none';
    }
}

// Display Products
function displayProducts(products) {
    const gridEl = document.getElementById('productsGrid');

    if (!products || products.length === 0) {
        gridEl.innerHTML = `
            <div class="empty-state">
                <p>No products found. Try adjusting your filters or generate some products!</p>
            </div>
        `;
        return;
    }

    gridEl.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-name">${escapeHtml(product.name)}</div>
            <div class="product-description">${escapeHtml(product.description)}</div>
            <div class="product-meta">
                <span class="meta-badge category-badge">${escapeHtml(product.category)}</span>
                <span class="meta-badge brand-badge">${escapeHtml(product.brand)}</span>
            </div>
            <div class="product-details">
                <div>
                    <div class="product-price">$${parseFloat(product.price).toFixed(2)}</div>
                    <div class="product-sku">SKU: ${escapeHtml(product.sku)}</div>
                </div>
                <div class="product-stock ${product.stock_quantity < 10 ? 'low-stock' : ''}">
                    ${product.stock_quantity} in stock
                </div>
            </div>
        </div>
    `).join('');
}

// Display Pagination
function displayPagination(pagination) {
    const paginationEl = document.getElementById('pagination');

    if (!pagination || pagination.totalPages <= 1) {
        paginationEl.style.display = 'none';
        return;
    }

    paginationEl.style.display = 'flex';

    const { page, totalPages, total } = pagination;
    let html = '';

    // Previous button
    html += `
        <button ${page === 1 ? 'disabled' : ''} onclick="changePage(${page - 1})">
            ← Previous
        </button>
    `;

    // Page numbers
    const maxPagesToShow = 5;
    let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    if (startPage > 1) {
        html += `<button onclick="changePage(1)">1</button>`;
        if (startPage > 2) {
            html += `<span class="pagination-info">...</span>`;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        html += `
            <button class="${i === page ? 'active' : ''}" onclick="changePage(${i})">
                ${i}
            </button>
        `;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            html += `<span class="pagination-info">...</span>`;
        }
        html += `<button onclick="changePage(${totalPages})">${totalPages}</button>`;
    }

    // Next button
    html += `
        <button ${page === totalPages ? 'disabled' : ''} onclick="changePage(${page + 1})">
            Next →
        </button>
    `;

    paginationEl.innerHTML = html;
}

// Change Page
function changePage(page) {
    currentPage = page;
    loadProducts(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Update Results Count
function updateResultsCount(total) {
    document.getElementById('resultsCount').textContent = `(${total})`;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make changePage available globally
window.changePage = changePage;
