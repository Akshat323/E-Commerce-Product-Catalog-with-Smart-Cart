import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Checkout = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [purchasedItems, setPurchasedItems] = useState([]);
  const [formData, setFormData] = useState({
    customer_name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    phone: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const loadCheckout = async () => {
      setLoading(true);
      try {
        const sessionId = localStorage.getItem('sessionId');
        if (!sessionId) {
          setLoading(false);
          return;
        }
        
        // 1. Fetch Cart Data
        const cartRes = await fetch(`/api/cart/${sessionId}`);
        const cartData = await cartRes.json();
        if (cartRes.ok && cartData.success) {
          setCart(cartData.data);
        }

        // 2. Fetch Saved Profile (Non-blocking)
        try {
          const profileRes = await fetch(`/api/checkout/profile/${sessionId}`);
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            if (profileData.success && profileData.data) {
              setFormData(prev => ({
                ...prev,
                ...profileData.data
              }));
            }
          }
        } catch (profileErr) {
          console.log("Autofill profile not found or server not ready yet.");
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    
    loadCheckout();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.customer_name.trim()) errors.customer_name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.state.trim()) errors.state = 'State is required';
    if (!formData.zip_code.trim()) errors.zip_code = 'Zip code is required';
    if (!formData.phone.trim()) errors.phone = 'Phone is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setProcessing(true);
    // Capture items before checkout so we can show them on success
    const currentItems = cart?.items || [];
    
    try {
      const sessionId = localStorage.getItem('sessionId');
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: sessionId,
          ...formData
        })
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
      
      <div className="checkout-container">
        <div className="shipping-form-container">
          <h3 className="summary-title">Shipping Details</h3>
          
          <div className="checkout-form">
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                name="customer_name"
                className={`form-control ${formErrors.customer_name ? 'error' : ''}`}
                placeholder="Enter your full name"
                value={formData.customer_name}
                onChange={handleInputChange}
              />
              {formErrors.customer_name && <span className="error-text">{formErrors.customer_name}</span>}
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                name="email"
                className={`form-control ${formErrors.email ? 'error' : ''}`}
                placeholder="example@mail.com"
                value={formData.email}
                onChange={handleInputChange}
              />
              {formErrors.email && <span className="error-text">{formErrors.email}</span>}
            </div>

            <div className="form-group">
              <label>Street Address</label>
              <input 
                type="text" 
                name="address"
                className={`form-control ${formErrors.address ? 'error' : ''}`}
                placeholder="Apt, Suite, Street name"
                value={formData.address}
                onChange={handleInputChange}
              />
              {formErrors.address && <span className="error-text">{formErrors.address}</span>}
            </div>

            <div className="form-row-multi">
              <div className="form-group">
                <label>City</label>
                <input 
                  type="text" 
                  name="city"
                  className={`form-control ${formErrors.city ? 'error' : ''}`}
                  placeholder="City"
                  value={formData.city}
                  onChange={handleInputChange}
                />
                {formErrors.city && <span className="error-text">{formErrors.city}</span>}
              </div>

              <div className="form-group">
                <label>State</label>
                <select 
                  name="state"
                  className={`form-control ${formErrors.state ? 'error' : ''}`}
                  value={formData.state}
                  onChange={handleInputChange}
                >
                  <option value="">Select State</option>
                  {[
                    "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", 
                    "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", 
                    "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", 
                    "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", 
                    "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
                    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
                  ].map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                {formErrors.state && <span className="error-text">{formErrors.state}</span>}
              </div>

              <div className="form-group">
                <label>Zip Code</label>
                <input 
                  type="text" 
                  name="zip_code"
                  className={`form-control ${formErrors.zip_code ? 'error' : ''}`}
                  placeholder="000000"
                  value={formData.zip_code}
                  onChange={handleInputChange}
                />
                {formErrors.zip_code && <span className="error-text">{formErrors.zip_code}</span>}
              </div>
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input 
                type="tel" 
                name="phone"
                className={`form-control ${formErrors.phone ? 'error' : ''}`}
                placeholder="+91 XXXXX XXXXX"
                value={formData.phone}
                onChange={handleInputChange}
              />
              {formErrors.phone && <span className="error-text">{formErrors.phone}</span>}
            </div>
          </div>
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
    </div>
  </main>
);
};

export default Checkout;
