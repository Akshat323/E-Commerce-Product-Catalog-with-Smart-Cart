// ═══════════════════════════════════════════════════════════════════
// NovaMart — Checkout Page (checkout.js)
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

// ─── Load Checkout ─────────────────────────────────────────────────
async function loadCheckout() {
  const container = document.getElementById('checkout-content');

  try {
    const res = await fetch(`${API_BASE}/cart/${USER_ID}`);
    const data = await res.json();

    if (!data.success || data.data.items.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="icon">🛒</div>
          <h3>Nothing to checkout</h3>
          <p>Your cart is empty</p>
          <button class="btn-continue" onclick="window.location.href='/'">← Continue Shopping</button>
        </div>
      `;
      return;
    }

    const { items, total, itemCount } = data.data;

    container.innerHTML = `
      <div class="order-items-summary">
        <h3 style="font-size:1.1rem;font-weight:700;color:var(--text-bright);margin-bottom:1rem;">Order Summary</h3>
        ${items.map(item => `
          <div class="order-item-row">
            <span style="color:var(--text-primary);">${item.name} <span style="color:var(--text-muted);">× ${item.quantity}</span></span>
            <span style="color:var(--text-primary);font-weight:600;">${formatPrice(item.subtotal)}</span>
          </div>
        `).join('')}
        <div class="order-item-row" style="border-top:2px solid var(--border-medium);margin-top:8px;padding-top:12px;">
          <span style="font-weight:700;color:var(--text-bright);font-size:1.1rem;">Total (${itemCount} items)</span>
          <span style="font-weight:700;color:var(--accent-primary);font-size:1.15rem;">${formatPrice(total)}</span>
        </div>
      </div>

      <button class="btn-checkout" id="btn-place-order" onclick="placeOrder()" style="width:100%;">
        🔒 Place Order — ${formatPrice(total)}
      </button>
      <p style="text-align:center;color:var(--text-muted);font-size:0.8rem;margin-top:12px;">
        By placing this order, stock will be validated and your cart will be cleared.
      </p>
    `;
  } catch (err) {
    console.error('Error loading checkout:', err);
    container.innerHTML = '<div class="empty-state"><div class="icon">❌</div><h3>Error loading checkout</h3></div>';
  }
}

// ─── Place Order ───────────────────────────────────────────────────
async function placeOrder() {
  const btn = document.getElementById('btn-place-order');
  btn.disabled = true;
  btn.textContent = '⏳ Processing...';

  try {
    const res = await fetch(`${API_BASE}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: USER_ID })
    });

    const data = await res.json();
    const container = document.getElementById('checkout-content');

    if (data.success) {
      container.innerHTML = `
        <div class="order-success">
          <div class="icon">🎉</div>
          <h2>Order Placed Successfully!</h2>
          <p>Thank you for your purchase.</p>
          <p style="margin-top:8px;">Order ID: <span class="order-id">${data.data.order_id}</span></p>
          <p style="margin-top:4px;color:var(--text-secondary);">Total: <strong style="color:var(--accent-primary);">${formatPrice(data.data.total_amount)}</strong></p>
          <p style="font-size:0.85rem;color:var(--text-muted);margin-top:4px;">${data.data.items_count} item(s) • Status: ${data.data.status}</p>

          <div class="order-items-summary" style="margin-top:1.5rem;text-align:left;">
            <h3 style="font-size:0.95rem;font-weight:600;color:var(--text-bright);margin-bottom:0.75rem;">Items Ordered</h3>
            ${data.data.order_items.map(item => `
              <div class="order-item-row">
                <span style="color:var(--text-primary);">${item.name} × ${item.quantity}</span>
                <span style="color:var(--text-secondary);">${formatPrice(item.price * item.quantity)}</span>
              </div>
            `).join('')}
          </div>

          <button class="btn-continue" onclick="window.location.href='/'">← Continue Shopping</button>
        </div>
      `;
      updateCartBadge();
    } else {
      // Stock validation error
      let errorDetails = '';
      if (data.outOfStock && data.outOfStock.length > 0) {
        errorDetails = `
          <div class="order-items-summary" style="margin-top:1.5rem;text-align:left;border-color:rgba(255,71,87,0.2);">
            <h3 style="font-size:0.95rem;font-weight:600;color:var(--accent-danger);margin-bottom:0.75rem;">Stock Issues</h3>
            ${data.outOfStock.map(item => `
              <div class="order-item-row">
                <span style="color:var(--text-primary);">${item.name}</span>
                <span style="color:var(--accent-danger);">Requested: ${item.requested} | Available: ${item.available}</span>
              </div>
            `).join('')}
          </div>
        `;
      }

      container.innerHTML = `
        <div class="order-error">
          <div class="icon">⚠️</div>
          <h2>Order Failed</h2>
          <p style="color:var(--text-secondary);">${data.message}</p>
          ${errorDetails}
          <button class="btn-continue" onclick="window.location.href='/cart.html'" style="background:var(--accent-danger);">← Back to Cart</button>
        </div>
      `;
    }
  } catch (err) {
    console.error('Error placing order:', err);
    showToast('Error placing order. Please try again.', 'error');
    btn.disabled = false;
    btn.textContent = '🔒 Place Order';
  }
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
  loadCheckout();
  updateCartBadge();
});
