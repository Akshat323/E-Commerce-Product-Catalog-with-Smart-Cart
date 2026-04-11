// ═══════════════════════════════════════════════════════════════════
// NovaMart — Cart Page (cart.js)
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

// ─── Load Cart ─────────────────────────────────────────────────────
async function loadCart() {
  const container = document.getElementById('cart-content');

  try {
    const res = await fetch(`${API_BASE}/cart/${USER_ID}`);
    const data = await res.json();

    if (!data.success || data.data.items.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Browse our catalog and add some items!</p>
          <button class="btn-continue" onclick="window.location.href='/'">← Continue Shopping</button>
        </div>
      `;
      updateCartBadge();
      return;
    }

    const { items, total, itemCount } = data.data;

    container.innerHTML = `
      <div class="cart-container">
        <div class="cart-items">
          ${items.map(item => `
            <div class="cart-item" id="cart-item-${item.product_id}">
              <div class="cart-item-image ${getTypeBgClass(item.type)}">
                ${getTypeIcon(item.type)}
              </div>
              <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-brand">${item.brand} • ${item.category}</div>
                <div class="cart-item-price">${formatPrice(item.price)}</div>
                <div class="qty-selector" style="margin-top:8px;display:inline-flex;">
                  <button class="qty-btn" onclick="updateItemQty('${item.product_id}', ${item.quantity - 1})">−</button>
                  <input type="text" class="qty-value" value="${item.quantity}" readonly>
                  <button class="qty-btn" onclick="updateItemQty('${item.product_id}', ${item.quantity + 1})">+</button>
                </div>
              </div>
              <div class="cart-item-actions">
                <button class="cart-remove-btn" onclick="removeItem('${item.product_id}')" title="Remove">✕</button>
                <div class="cart-item-subtotal">${formatPrice(item.subtotal)}</div>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="cart-summary">
          <h3>Order Summary</h3>
          <div class="summary-row">
            <span class="label">Items (${itemCount})</span>
            <span class="value">${formatPrice(total)}</span>
          </div>
          <div class="summary-row">
            <span class="label">Shipping</span>
            <span class="value" style="color:var(--accent-success);">Free</span>
          </div>
          <div class="summary-total">
            <span class="label">Total</span>
            <span class="value">${formatPrice(total)}</span>
          </div>
          <button class="btn-checkout" onclick="goToCheckout()">
            Proceed to Checkout →
          </button>
          <button class="btn-continue" style="width:100%;margin-top:8px;background:var(--bg-tertiary);justify-content:center;" onclick="window.location.href='/'">
            ← Continue Shopping
          </button>
        </div>
      </div>
    `;

    updateCartBadge();
  } catch (err) {
    console.error('Error loading cart:', err);
    container.innerHTML = '<div class="empty-state"><div class="icon">❌</div><h3>Error loading cart</h3></div>';
  }
}

// ─── Update Item Quantity ──────────────────────────────────────────
async function updateItemQty(productId, newQty) {
  if (newQty < 1) {
    removeItem(productId);
    return;
  }

  try {
    await fetch(`${API_BASE}/cart/update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: USER_ID, productId, quantity: newQty })
    });
    loadCart();
  } catch (err) {
    showToast('Error updating quantity', 'error');
  }
}

// ─── Remove Item ───────────────────────────────────────────────────
async function removeItem(productId) {
  try {
    await fetch(`${API_BASE}/cart/remove`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: USER_ID, productId })
    });
    showToast('Item removed from cart', 'info');
    loadCart();
  } catch (err) {
    showToast('Error removing item', 'error');
  }
}

// ─── Go to Checkout ────────────────────────────────────────────────
function goToCheckout() {
  window.location.href = '/checkout.html';
}

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
  loadCart();
});
