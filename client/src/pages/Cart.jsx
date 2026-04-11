import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
      <main className="main-content" style={{ marginTop: '4rem' }}>
        <div className="empty-state">
          <div className="icon">🛒</div>
          <h2 style={{ marginBottom: '1rem' }}>Your cart is empty</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Looks like you haven't added anything to your cart yet.</p>
          <Link to="/" className="filter-btn filter-btn-primary">Browse Products</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content">
      <div className="section-header">
        <h1 className="section-title">🛒 Your Cart</h1>
      </div>

      <div style={{ overflowX: 'auto', background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)' }}>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ background: 'rgba(0,0,0,0.2)', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-sm)', fontSize: '2rem' }}>
                       {item.type === 'Electronics' ? '💻' : item.type === 'Book' ? '📚' : '👕'}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{item.name}</h4>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.brand || 'Generic'}</span>
                    </div>
                  </div>
                </td>
                <td style={{ fontWeight: 600 }}>${item.price.toFixed(2)}</td>
                <td>
                  <div className="qty-selector">
                    <button className="qty-btn" onClick={() => handleUpdateQty(item.product_id, -1)}>-</button>
                    <input type="text" className="qty-value" value={item.quantity} readOnly />
                    <button className="qty-btn" onClick={() => handleUpdateQty(item.product_id, 1)}>+</button>
                  </div>
                </td>
                <td style={{ fontWeight: 800, color: 'var(--accent-primary)' }}>${item.subtotal.toFixed(2)}</td>
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

      <div className="cart-summary" style={{ marginTop: '2rem', maxWidth: '400px', marginLeft: 'auto' }}>
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Order Summary</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-muted)' }}>
          <span>Subtotal ({cart.itemCount} items)</span>
          <span>${cart.total.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
          <span>Shipping</span>
          <span>Free</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)', fontSize: '1.5rem', fontWeight: 800 }}>
          <span>Total</span>
          <span style={{ background: 'linear-gradient(to right, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ${cart.total.toFixed(2)}
          </span>
        </div>
        <button className="btn-checkout" style={{ width: '100%' }} onClick={() => navigate('/checkout')}>
          Proceed to Checkout ➔
        </button>
      </div>
    </main>
  );
};

export default Cart;
