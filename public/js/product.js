// ═══════════════════════════════════════════════════════════════════
// NovaMart — Product Detail Page (product.js)
// ═══════════════════════════════════════════════════════════════════

const API_BASE = '/api';

function getUserId() {
  let userId = localStorage.getItem('novamart_userId');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('novamart_userId', userId);
  }
  return userId;
}

const USER_ID = getUserId();
let currentProduct = null;
let selectedRating = 0;

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function formatPrice(price) {
  return '₹' + price.toFixed(2);
}

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

function renderStars(rating) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += `<span class="star ${i <= Math.round(rating) ? '' : 'empty'}">★</span>`;
  }
  return html;
}

// ─── Render Type-Specific Fields ───────────────────────────────────
function renderTypeSpecificInfo(product) {
  switch (product.type) {
    case 'Electronics':
      const specs = product.specs || {};
      const specItems = [];
      if (specs.processor) specItems.push({ label: 'Processor', value: specs.processor });
      if (specs.ram) specItems.push({ label: 'RAM', value: specs.ram });
      if (specs.storage) specItems.push({ label: 'Storage', value: specs.storage });
      if (specs.display) specItems.push({ label: 'Display', value: specs.display });
      if (specs.battery) specItems.push({ label: 'Battery', value: specs.battery });
      if (product.warranty_months) specItems.push({ label: 'Warranty', value: `${product.warranty_months} months` });

      if (specItems.length === 0) return '';
      return `
        <div class="product-specs">
          <h3>⚡ Specifications</h3>
          <div class="specs-grid">
            ${specItems.map(s => `
              <div class="spec-item">
                <span class="spec-label">${s.label}</span>
                <span class="spec-value">${s.value}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;

    case 'Book':
      return `
        <div class="product-specs">
          <h3>📖 Book Details</h3>
          <div class="specs-grid">
            ${product.author ? `<div class="spec-item"><span class="spec-label">Author</span><span class="spec-value">${product.author}</span></div>` : ''}
            ${product.isbn ? `<div class="spec-item"><span class="spec-label">ISBN</span><span class="spec-value">${product.isbn}</span></div>` : ''}
            ${product.pages ? `<div class="spec-item"><span class="spec-label">Pages</span><span class="spec-value">${product.pages}</span></div>` : ''}
            ${product.publisher ? `<div class="spec-item"><span class="spec-label">Publisher</span><span class="spec-value">${product.publisher}</span></div>` : ''}
          </div>
        </div>
      `;

    case 'Clothing':
      return `
        <div class="product-specs">
          <h3>👗 Product Details</h3>
          <div class="specs-grid">
            ${product.size && product.size.length > 0 ? `<div class="spec-item"><span class="spec-label">Sizes</span><span class="spec-value">${product.size.join(', ')}</span></div>` : ''}
            ${product.color && product.color.length > 0 ? `<div class="spec-item"><span class="spec-label">Colors</span><span class="spec-value">${product.color.join(', ')}</span></div>` : ''}
            ${product.material ? `<div class="spec-item"><span class="spec-label">Material</span><span class="spec-value">${product.material}</span></div>` : ''}
          </div>
        </div>
      `;

    default:
      return '';
  }
}

// ─── Load Product Detail ───────────────────────────────────────────
async function loadProduct() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    document.getElementById('product-detail').innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="icon">❌</div>
        <h3>Product not found</h3>
        <button class="btn-continue" onclick="window.location.href='/'">← Back to Products</button>
      </div>
    `;
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/products/${id}?userId=${USER_ID}`);
    const data = await res.json();

    if (!data.success) throw new Error(data.message);

    currentProduct = data.data;
    const product = currentProduct;

    document.title = `${product.name} — NovaMart`;
    document.getElementById('breadcrumb-type').textContent = product.type;
    document.getElementById('breadcrumb-name').textContent = product.name;

    // Stock info
    const stockQty = product.stock_quantity;
    let stockDotClass, stockText, stockColor;
    if (stockQty === 0) {
      stockDotClass = 'out-of-stock'; stockText = 'Out of Stock'; stockColor = 'var(--accent-danger)';
    } else if (stockQty <= 5) {
      stockDotClass = 'low-stock'; stockText = `Only ${stockQty} left`; stockColor = 'var(--accent-warning)';
    } else {
      stockDotClass = 'in-stock'; stockText = `${stockQty} in stock`; stockColor = 'var(--accent-success)';
    }

    document.getElementById('product-detail').innerHTML = `
      <div class="product-detail-image ${getTypeBgClass(product.type)}">
        <span class="type-badge ${getTypeBadgeClass(product.type)}" style="position:absolute;top:16px;left:16px;">${product.type}</span>
        ${getTypeIcon(product.type)}
      </div>
      <div class="product-detail-info">
        <span class="product-detail-type type-badge ${getTypeBadgeClass(product.type)}">${product.category}</span>
        <h1 class="product-detail-name">${product.name}</h1>
        <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
          <span class="product-detail-price">${formatPrice(product.price)}</span>
          <span style="color:var(--text-secondary);font-size:0.9rem;">${product.brand}</span>
        </div>
        <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
          <div class="rating-stars">
            ${renderStars(product.avg_rating)}
            <span class="rating-text">${product.avg_rating.toFixed(1)} (${product.review_count} reviews)</span>
          </div>
          <div class="views-counter">👁️ ${product.daily_views || 0} views today</div>
        </div>
        <div class="stock-info" style="color:${stockColor}">
          <span class="stock-dot ${stockDotClass}"></span>
          ${stockText}
        </div>
        <p class="product-detail-description">${product.description || 'No description available.'}</p>
        ${renderTypeSpecificInfo(product)}
        <div style="display:flex;align-items:center;gap:8px;margin-top:4px;color:var(--text-muted);font-size:0.85rem;">
          <span>📊 ${product.total_sold} sold</span>
          <span>•</span>
          <span>💰 ${formatPrice(product.total_revenue)} revenue</span>
        </div>
        <div class="product-detail-actions">
          <div class="qty-selector">
            <button class="qty-btn" id="qty-minus" onclick="changeQty(-1)">−</button>
            <input type="text" class="qty-value" id="qty-input" value="1" readonly>
            <button class="qty-btn" id="qty-plus" onclick="changeQty(1)">+</button>
          </div>
          <button class="btn-add-cart" id="btn-add-cart" onclick="addToCart()" ${stockQty === 0 ? 'disabled' : ''}>
            🛒 ${stockQty === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    `;

    // Show reviews section
    document.getElementById('reviews-section').style.display = 'block';
    loadReviews(id);

  } catch (err) {
    console.error('Error loading product:', err);
    document.getElementById('product-detail').innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="icon">❌</div>
        <h3>Error loading product</h3>
        <p>${err.message}</p>
        <button class="btn-continue" onclick="window.location.href='/'">← Back to Products</button>
      </div>
    `;
  }
}

// ─── Quantity Controls ─────────────────────────────────────────────
function changeQty(delta) {
  const input = document.getElementById('qty-input');
  let val = parseInt(input.value) + delta;
  if (val < 1) val = 1;
  if (currentProduct && val > currentProduct.stock_quantity) val = currentProduct.stock_quantity;
  input.value = val;
}

// ─── Add to Cart ───────────────────────────────────────────────────
async function addToCart() {
  if (!currentProduct) return;

  const qty = parseInt(document.getElementById('qty-input').value);
  const btn = document.getElementById('btn-add-cart');
  btn.disabled = true;
  btn.textContent = 'Adding...';

  try {
    const res = await fetch(`${API_BASE}/cart/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: USER_ID,
        productId: currentProduct._id,
        quantity: qty
      })
    });

    const data = await res.json();

    if (data.success) {
      showToast(`Added ${qty}x ${currentProduct.name} to cart!`, 'success');
      updateCartBadge();
    } else {
      showToast(data.message || 'Failed to add to cart', 'error');
    }
  } catch (err) {
    showToast('Error adding to cart', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '🛒 Add to Cart';
  }
}

// ─── Load Reviews ──────────────────────────────────────────────────
async function loadReviews(productId) {
  try {
    const res = await fetch(`${API_BASE}/reviews/${productId}`);
    const data = await res.json();

    const list = document.getElementById('reviews-list');
    document.getElementById('review-count-text').textContent = `${data.data.length} reviews`;

    if (data.data.length === 0) {
      list.innerHTML = '<div class="empty-state"><p>No reviews yet. Be the first!</p></div>';
      return;
    }

    list.innerHTML = data.data.map(review => `
      <div class="review-card">
        <div class="review-header">
          <div>
            <span class="review-user">${review.user_id}</span>
            <div class="rating-stars" style="display:inline-flex;margin-left:8px;">
              ${renderStars(review.rating)}
            </div>
          </div>
          <span class="review-date">${new Date(review.createdAt).toLocaleDateString()}</span>
        </div>
        <p class="review-comment">${review.comment || ''}</p>
      </div>
    `).join('');
  } catch (err) {
    console.error('Error loading reviews:', err);
  }
}

// ─── Star Rating Input ─────────────────────────────────────────────
document.querySelectorAll('#star-rating-input .star-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    selectedRating = parseInt(btn.dataset.rating);
    document.querySelectorAll('#star-rating-input .star-btn').forEach((b, i) => {
      b.classList.toggle('active', i < selectedRating);
    });
  });
});

// ─── Submit Review ─────────────────────────────────────────────────
document.getElementById('btn-submit-review').addEventListener('click', async () => {
  if (!currentProduct) return;
  if (selectedRating === 0) {
    showToast('Please select a rating', 'error');
    return;
  }

  const comment = document.getElementById('review-comment').value.trim();

  try {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: currentProduct._id,
        user_id: USER_ID,
        rating: selectedRating,
        comment
      })
    });

    const data = await res.json();

    if (data.success) {
      showToast('Review submitted!', 'success');
      document.getElementById('review-comment').value = '';
      selectedRating = 0;
      document.querySelectorAll('#star-rating-input .star-btn').forEach(b => b.classList.remove('active'));
      loadReviews(currentProduct._id);
      // Reload product to update rating
      loadProduct();
    } else {
      showToast(data.message || 'Failed to submit review', 'error');
    }
  } catch (err) {
    showToast('Error submitting review', 'error');
  }
});

// ─── Cart Badge ────────────────────────────────────────────────────
async function updateCartBadge() {
  try {
    const res = await fetch(`${API_BASE}/cart/${USER_ID}`);
    const data = await res.json();
    document.getElementById('cart-badge').textContent = data.success ? data.data.itemCount : 0;
  } catch (err) { }
}

// ─── Init ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadProduct();
  updateCartBadge();
});
