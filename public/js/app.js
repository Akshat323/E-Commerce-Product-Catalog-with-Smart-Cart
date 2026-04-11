// ═══════════════════════════════════════════════════════════════════
// NovaMart — Product Listing Page (app.js)
// ═══════════════════════════════════════════════════════════════════

const API_BASE = '/api';

// Generate or retrieve userId from localStorage
function getUserId() {
  let userId = localStorage.getItem('novamart_userId');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('novamart_userId', userId);
  }
  return userId;
}

const USER_ID = getUserId();

// ─── Toast Notifications ───────────────────────────────────────────
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ─── Get type-specific emoji icon ──────────────────────────────────
function getTypeIcon(type) {
  switch (type) {
    case 'Electronics': return '💻';
    case 'Book': return '📚';
    case 'Clothing': return '👕';
    default: return '📦';
  }
}

function getTypeBgClass(type) {
  switch (type) {
    case 'Electronics': return 'electronics-bg';
    case 'Book': return 'book-bg';
    case 'Clothing': return 'clothing-bg';
    default: return '';
  }
}

function getTypeBadgeClass(type) {
  switch (type) {
    case 'Electronics': return 'electronics';
    case 'Book': return 'book';
    case 'Clothing': return 'clothing';
    default: return '';
  }
}

// ─── Render Star Rating ────────────────────────────────────────────
function renderStars(rating) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += `<span class="star ${i <= Math.round(rating) ? '' : 'empty'}">★</span>`;
  }
  return html;
}

// ─── Stock Status ──────────────────────────────────────────────────
function getStockStatus(qty) {
  if (qty === 0) return { text: 'Out of Stock', cls: 'out' };
  if (qty <= 5) return { text: `Only ${qty} left`, cls: 'low' };
  return { text: 'In Stock', cls: '' };
}

// ─── Format Currency ───────────────────────────────────────────────
function formatPrice(price) {
  return '₹' + price.toFixed(2);
}

// ─── Product Card HTML ─────────────────────────────────────────────
function createProductCard(product) {
  const stock = getStockStatus(product.stock_quantity);
  return `
    <div class="product-card" data-type="${product.type}" onclick="window.location.href='/product.html?id=${product._id}'">
      <div class="product-card-image ${getTypeBgClass(product.type)}">
        <span class="type-badge ${getTypeBadgeClass(product.type)}">${product.type}</span>
        ${getTypeIcon(product.type)}
      </div>
      <div class="product-card-body">
        <div class="product-card-category">${product.category}</div>
        <div class="product-card-name">${product.name}</div>
        <div class="product-card-meta">
          <span class="product-card-price">${formatPrice(product.price)}</span>
          <span class="product-card-brand">${product.brand}</span>
        </div>
        <div class="product-card-footer">
          <div class="rating-stars">
            ${renderStars(product.avg_rating)}
            <span class="rating-text">(${product.review_count})</span>
          </div>
          <span class="product-card-stock ${stock.cls}">${stock.text}</span>
        </div>
      </div>
    </div>
  `;
}

// ─── Load Products ─────────────────────────────────────────────────
let currentPage = 1;
const LIMIT = 12;

async function loadProducts(page = 1) {
  const grid = document.getElementById('product-grid');
  grid.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';

  const type = document.getElementById('filter-type').value;
  const minPrice = document.getElementById('filter-min-price').value;
  const maxPrice = document.getElementById('filter-max-price').value;
  const minRating = document.getElementById('filter-rating').value;

  const params = new URLSearchParams();
  params.set('page', page);
  params.set('limit', LIMIT);
  params.set('userId', USER_ID);
  if (type) params.set('type', type);
  if (minPrice) params.set('minPrice', minPrice);
  if (maxPrice) params.set('maxPrice', maxPrice);
  if (minRating) params.set('minRating', minRating);

  try {
    const res = await fetch(`${API_BASE}/products?${params}`);
    const data = await res.json();

    if (data.success && data.data.length > 0) {
      grid.innerHTML = data.data.map(createProductCard).join('');
      document.getElementById('product-count').textContent = `${data.pagination.total} products found`;
      renderPagination(data.pagination);
    } else {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="icon">🔍</div>
          <h3>No products found</h3>
          <p>Try adjusting your filters</p>
        </div>
      `;
      document.getElementById('product-count').textContent = '0 products found';
      document.getElementById('pagination').innerHTML = '';
    }
  } catch (err) {
    console.error('Error loading products:', err);
    grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><div class="icon">❌</div><h3>Error loading products</h3></div>';
  }
}

// ─── Pagination ────────────────────────────────────────────────────
function renderPagination(pagination) {
  const container = document.getElementById('pagination');
  if (pagination.pages <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = '';
  html += `<button class="pagination-btn" ${pagination.page <= 1 ? 'disabled' : ''} onclick="goToPage(${pagination.page - 1})">← Prev</button>`;

  for (let i = 1; i <= pagination.pages; i++) {
    html += `<button class="pagination-btn ${i === pagination.page ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
  }

  html += `<button class="pagination-btn" ${pagination.page >= pagination.pages ? 'disabled' : ''} onclick="goToPage(${pagination.page + 1})">Next →</button>`;
  container.innerHTML = html;
}

function goToPage(page) {
  currentPage = page;
  loadProducts(page);
  window.scrollTo({ top: 400, behavior: 'smooth' });
}

// ─── Load Trending ─────────────────────────────────────────────────
async function loadTrending() {
  try {
    const res = await fetch(`${API_BASE}/trending`);
    const data = await res.json();

    if (data.success && data.data.length > 0) {
      const section = document.getElementById('trending-section');
      section.style.display = 'block';
      document.getElementById('trending-scroll').innerHTML = data.data.map(createProductCard).join('');
    }
  } catch (err) {
    console.error('Error loading trending:', err);
  }
}

// ─── Load Recently Viewed ──────────────────────────────────────────
async function loadRecentlyViewed() {
  try {
    const res = await fetch(`${API_BASE}/recently-viewed/${USER_ID}`);
    const data = await res.json();

    if (data.success && data.data.length > 0) {
      const section = document.getElementById('recently-viewed-section');
      section.style.display = 'block';
      document.getElementById('recently-viewed-scroll').innerHTML = data.data.map(createProductCard).join('');
    }
  } catch (err) {
    console.error('Error loading recently viewed:', err);
  }
}

// ─── Update Cart Badge ────────────────────────────────────────────
async function updateCartBadge() {
  try {
    const res = await fetch(`${API_BASE}/cart/${USER_ID}`);
    const data = await res.json();
    const badge = document.getElementById('cart-badge');
    badge.textContent = data.success ? data.data.itemCount : 0;
  } catch (err) {
    // silently fail
  }
}

// ─── Event Listeners ───────────────────────────────────────────────
document.getElementById('btn-apply-filters').addEventListener('click', () => {
  currentPage = 1;
  loadProducts(1);
});

document.getElementById('btn-clear-filters').addEventListener('click', () => {
  document.getElementById('filter-type').value = '';
  document.getElementById('filter-min-price').value = '';
  document.getElementById('filter-max-price').value = '';
  document.getElementById('filter-rating').value = '';
  currentPage = 1;
  loadProducts(1);
});

// ─── Init ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadProducts(1);
  loadTrending();
  loadRecentlyViewed();
  updateCartBadge();
});
