import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Checkout = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [orderResult, setOrderResult] = useState(null);

  useEffect(() => {
    const loadCheckout = async () => {
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
    
    loadCheckout();
  }, []);

  const handlePlaceOrder = async () => {
    setProcessing(true);
    try {
      const sessionId = localStorage.getItem('sessionId');
      // checkout route previously used userId
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: sessionId })
      });
      const data = await res.json();
      
      setOrderResult(data);
      if (data.success) {
        window.dispatchEvent(new Event('cartUpdated'));
      }
    } catch (err) {
      console.error(err);
      setOrderResult({ success: false, message: 'Error processing order' });
    }
    setProcessing(false);
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  if (orderResult) {
    if (orderResult.success) {
      return (
        <main className="main-content" style={{ marginTop: '4rem' }}>
          <div style={{ textAlign: 'center', background: 'var(--glass-bg)', padding: '3rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h2 style={{ marginBottom: '1rem' }}>Order Placed Successfully!</h2>
            <p style={{ color: 'var(--text-muted)' }}>Thank you for your purchase.</p>
            <p style={{ marginTop: '1rem' }}>Order ID: <strong style={{ color: 'var(--accent-primary)' }}>{orderResult.data.order_id}</strong></p>
            <p>Total: <strong>${orderResult.data.total_amount.toFixed(2)}</strong></p>
            
            <Link to="/" className="filter-btn filter-btn-primary" style={{ display: 'inline-block', marginTop: '2rem' }}>
              ← Continue Shopping
            </Link>
          </div>
        </main>
      );
    } else {
      return (
        <main className="main-content" style={{ marginTop: '4rem' }}>
          <div style={{ textAlign: 'center', background: 'var(--glass-bg)', padding: '3rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
            <h2 style={{ marginBottom: '1rem', color: '#ef4444' }}>Order Failed</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{orderResult.message}</p>
            
            {orderResult.outOfStock && orderResult.outOfStock.length > 0 && (
              <div style={{ textAlign: 'left', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem', display: 'inline-block' }}>
                <h3 style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '1.1rem' }}>Stock Issues</h3>
                {orderResult.outOfStock.map((item, idx) => (
                  <div key={idx} style={{ marginBottom: '0.5rem' }}>
                    <strong>{item.name}</strong>: Requested {item.requested}, Available {item.available}
                  </div>
                ))}
              </div>
            )}
            <br />
            <Link to="/cart" className="filter-btn filter-btn-secondary" style={{ display: 'inline-block' }}>
              ← Back to Cart
            </Link>
          </div>
        </main>
      );
    }
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <main className="main-content" style={{ marginTop: '4rem' }}>
        <div className="empty-state">
          <div className="icon">🛒</div>
          <h2 style={{ marginBottom: '1rem' }}>Nothing to checkout</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Your cart is empty</p>
          <Link to="/" className="filter-btn filter-btn-primary">Continue Shopping</Link>
        </div>
      </main>
    );
  }

  const total = cart.total;

  return (
    <main className="main-content">
      <div className="section-header">
        <h1 className="section-title">🔒 Checkout</h1>
      </div>

      <div style={{ background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', border: '1px solid var(--glass-border)', padding: '2rem', borderRadius: 'var(--radius-lg)', maxWidth: '600px', margin: '0 auto' }}>
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', color: 'var(--text-main)' }}>Order Summary</h3>
        
        {cart.items.map(item => (
          <div key={item.product_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span>{item.name} <span style={{ color: 'var(--text-muted)' }}>× {item.quantity}</span></span>
            <span style={{ fontWeight: 600 }}>${item.subtotal.toFixed(2)}</span>
          </div>
        ))}
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid rgba(255,255,255,0.1)', fontSize: '1.2rem', fontWeight: 700 }}>
          <span>Total ({cart.items.length} items)</span>
          <span style={{ color: 'var(--accent-primary)' }}>${total.toFixed(2)}</span>
        </div>

        <button 
          className="btn-checkout" 
          onClick={handlePlaceOrder} 
          disabled={processing}
          style={{ width: '100%', marginTop: '2rem' }}
        >
          {processing ? 'Processing...' : `Place Order — $${total.toFixed(2)}`}
        </button>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '1rem' }}>
          By placing this order, stock will be validated and your cart will be cleared.
        </p>
      </div>
    </main>
  );
};

export default Checkout;
