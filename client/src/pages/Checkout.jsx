import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Checkout = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [purchasedItems, setPurchasedItems] = useState([]);

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
    // Capture items before checkout so we can show them on success
    const currentItems = cart?.items || [];
    
    try {
      const sessionId = localStorage.getItem('sessionId');
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: sessionId })
      });
      const data = await res.json();
      
      setOrderResult(data);
      if (data.success) {
        setPurchasedItems(currentItems);
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
        <main className="main-content">
          <div className="checkout-status-card success">
            <div className="status-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="status-icon-svg">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            
            <h2 className="status-title">Order Placed Successfully</h2>
            
            <div className="status-details">
              <p className="status-subtitle">Thank you for your purchase. Your order is being processed.</p>
              
              <div className="order-id-highlight">
                Order ID: <span>{orderResult.data.order_id}</span>
              </div>

              {purchasedItems.length > 0 && (
                <div className="order-snapshot">
                  <h4 className="snapshot-header">Order Snapshot</h4>
                  {purchasedItems.map((item, idx) => (
                    <div key={idx} className="snapshot-item">
                      <div className="snapshot-item-left">
                        <div className="snapshot-thumbnail">
                           <img 
                            src={`/products/${item.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.jpg`} 
                            alt={item.name}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                          <span style={{ display: 'none' }}>📦</span>
                        </div>
                        <span className="snapshot-name">{item.name} × {item.quantity}</span>
                      </div>
                      <span className="snapshot-price">₹{item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="status-success-total">
                <span className="total-label">Total Amount paid</span>
                <strong className="total-value">₹{orderResult.data.total_amount.toFixed(2)}</strong>
              </div>
            </div>
            
            <div className="status-actions">
              <Link to="/" className="filter-btn filter-btn-primary">
                Continue Shopping
              </Link>
            </div>
          </div>
        </main>
      );
    } else {
      return (
        <main className="main-content">
          <div className="checkout-status-card error">
            <h2 className="status-title">Order Failed</h2>
            <p className="status-message">{orderResult.message}</p>
            
            {orderResult.outOfStock && orderResult.outOfStock.length > 0 && (
              <div className="stock-error-list">
                <h3 className="stock-error-heading">Stock Issues</h3>
                {orderResult.outOfStock.map((item, idx) => (
                  <div key={idx} className="stock-error-item">
                    <strong>{item.name}</strong>: Requested {item.requested}, Available {item.available}
                  </div>
                ))}
              </div>
            )}
            <Link to="/cart" className="filter-btn filter-btn-secondary">
              Back to Cart
            </Link>
          </div>
        </main>
      );
    }
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <main className="main-content">
        <div className="empty-state">
          <h2 className="status-title">Nothing to checkout</h2>
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
        <h1 className="section-title">Checkout</h1>
      </div>

      <div className="checkout-summary-card">
        <h3 className="summary-title">Order Summary</h3>
        
        <div className="checkout-items-list">
          {cart.items.map(item => (
            <div key={item.product_id} className="checkout-item-row">
              <span className="item-name">{item.name} <span className="item-qty">× {item.quantity}</span></span>
              <span className="item-price">₹{item.subtotal.toFixed(2)}</span>
            </div>
          ))}
        </div>
        
        <div className="checkout-total-row">
          <span>Total ({cart.items.length} items)</span>
          <span className="total-amount">₹{total.toFixed(2)}</span>
        </div>

        <button 
          className="btn-checkout" 
          onClick={handlePlaceOrder} 
          disabled={processing}
          style={{ width: '100%', marginTop: '2.5rem' }}
        >
          {processing ? 'Processing...' : `Place Order`}
        </button>
        <p className="checkout-notice">
          By placing this order, stock will be validated and your cart will be cleared.
        </p>
      </div>
    </main>
  );
};

export default Checkout;
