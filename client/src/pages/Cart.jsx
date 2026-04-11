import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const getProductImage = (name) => {
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `/products/${slug}.jpg`;
};

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadCart = async () => {
    setLoading(true);
    try {
      const sessionId = localStorage.getItem('sessionId');
      if (!sessionId) {
        setLoading(false);
        return;
      }
      
      const res = await fetch(`/api/cart/${sessionId}`);
      const data = await res.json();
      
      if (res.ok && data.success) {
        setCart(data.data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleUpdateQty = async (productId, delta) => {
    try {
      await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: localStorage.getItem('sessionId'),
          productId,
          quantity: delta
        })
      });
      loadCart();
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await fetch('/api/cart/remove', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: localStorage.getItem('sessionId'),
          productId
        })
      });
      loadCart();
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <main className="main-content">
        <div className="empty-state">
          <h2 className="status-title">Your cart is empty</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Looks like you haven't added anything to your cart yet.</p>
          <Link to="/" className="filter-btn filter-btn-primary">Browse Products</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content">
      <div className="section-header">
        <h1 className="section-title">Your Cart</h1>
      </div>

      <div className="cart-table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Total</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {cart.items.map(item => (
              <tr key={item.product_id}>
                <td>
                  <div className="cart-product-cell">
                    <div className="cart-product-image">
                       <img 
                        src={getProductImage(item.name)} 
                        alt={item.name}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <span style={{ display: 'none' }}>📦</span>
                    </div>
                    <div>
                      <h4 className="cart-product-name">{item.name}</h4>
                      <span className="cart-product-brand">{item.brand || 'Generic'}</span>
                    </div>
                  </div>
                </td>
                <td style={{ fontWeight: 600 }}>₹{item.price.toFixed(2)}</td>
                <td>
                  <div className="qty-selector">
                    <button 
                      className="qty-btn" 
                      onClick={() => item.quantity > 1 ? handleUpdateQty(item.product_id, -1) : handleRemove(item.product_id)}
                    >-</button>
                    <input type="text" className="qty-value" value={item.quantity} readOnly />
                    <button className="qty-btn" onClick={() => handleUpdateQty(item.product_id, 1)}>+</button>
                  </div>
                </td>
                <td className="cart-item-total">₹{item.subtotal.toFixed(2)}</td>
                <td>
                  <button onClick={() => handleRemove(item.product_id)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 600 }}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="cart-summary-wrapper">
        <div className="cart-summary">
          <h3 className="summary-title">Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal ({cart.itemCount} items)</span>
            <span>₹{cart.total.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <span>₹{cart.total.toFixed(2)}</span>
          </div>
          <button className="btn-checkout" onClick={() => navigate('/checkout')}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </main>
  );
};

export default Cart;
