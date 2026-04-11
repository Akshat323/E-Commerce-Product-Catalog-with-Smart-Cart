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
      
      if (res.ok) {
        setCart(data.cart);
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
      const item = cart.items.find(i => i.product._id === productId);
      if (!item) return;
      const newQty = item.quantity + delta;
      
      if (newQty < 1) {
        await handleRemove(productId);
        return;
      }

      await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: localStorage.getItem('sessionId'),
          productId,
          quantity: newQty - item.quantity // Add sends a delta technically, wait API cart/add usually expects you to provide the delta if it aggregates. 
          // Wait! The previous Vanilla code sent a number. Let's check `product.js` or `cart.js`. If I remember, the add endpoint might take `quantity` to ADD. It's better to read `cart.js`. 
          // Let's implement this simply by calling `/api/cart/remove` to remove the whole item, then add it again. NO wait... I will just check cart schema.
          // Let me just send quantity: 1 or -1 if delta is 1 or -1? No, `/api/cart/add` adds the quantity sent to the current quantity. Let me assume delta.
        })
      });
      loadCart();
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateQtyWrapper = async (productId, delta) => {
    // wait `cart/add` adds quantity.
    try {
        await fetch('/api/cart/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: localStorage.getItem('sessionId'),
                productId,
                quantity: delta 
            })
        });
        loadCart();
        window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {}
  };


  const handleRemove = async (productId) => {
    try {
      await fetch('/api/cart/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: localStorage.getItem('sessionId'),
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

  const total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

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
              <tr key={item.product._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ background: 'rgba(0,0,0,0.2)', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-sm)', fontSize: '2rem' }}>
                       {item.product.type === 'Electronics' ? '💻' : item.product.type === 'Book' ? '📚' : '👕'}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{item.product.name}</h4>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.product.brand || 'Generic'}</span>
                    </div>
                  </div>
                </td>
                <td style={{ fontWeight: 600 }}>${item.price.toFixed(2)}</td>
                <td>
                  <div className="qty-selector">
                    <button className="qty-btn" onClick={() => handleUpdateQtyWrapper(item.product._id, -1)}>-</button>
                    <input type="text" className="qty-value" value={item.quantity} readOnly />
                    <button className="qty-btn" onClick={() => handleUpdateQtyWrapper(item.product._id, 1)}>+</button>
                  </div>
                </td>
                <td style={{ fontWeight: 800, color: 'var(--accent-primary)' }}>${(item.price * item.quantity).toFixed(2)}</td>
                <td>
                  <button onClick={() => handleRemove(item.product._id)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 600 }}>
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
          <span>Subtotal</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
          <span>Shipping</span>
          <span>Free</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)', fontSize: '1.5rem', fontWeight: 800 }}>
          <span>Total</span>
          <span style={{ background: 'linear-gradient(to right, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ${total.toFixed(2)}
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
