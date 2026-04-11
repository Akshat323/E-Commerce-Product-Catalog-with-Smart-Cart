import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';

function App() {
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = async () => {
    try {
      let sessionId = localStorage.getItem('sessionId');
      if (!sessionId) {
        setCartCount(0);
        return;
      }
      const res = await fetch(`/api/cart/${sessionId}`);
      const data = await res.json();
      if (res.ok && data.success && data.data && data.data.items) {
        setCartCount(data.data.itemCount || 0);
      } else {
        setCartCount(0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCartCount();
    window.addEventListener('cartUpdated', fetchCartCount);
    return () => {
      window.removeEventListener('cartUpdated', fetchCartCount);
    };
  }, []);

  return (
    <Router>
      <nav className="navbar" id="navbar">
        <div className="navbar-inner">
          <Link to="/" className="navbar-brand">
            <div className="logo-icon">⚡</div>
            Martify
          </Link>
          <ul className="navbar-nav">
            <li><Link to="/" className="nav-link">🏠 Home</Link></li>
            <li>
              <Link to="/cart" className="nav-link">
                🛒 Cart <span className="cart-badge">{cartCount}</span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
      </Routes>
    </Router>
  );
}

export default App;
