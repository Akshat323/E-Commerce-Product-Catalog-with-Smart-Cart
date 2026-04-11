import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Legals from './pages/Legals';
import Footer from './components/Footer';

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
          <Link to="/" className="logo">Martify</Link>
          <div className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/cart">
              Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        
        {/* Support Routes */}
        <Route path="/shipping" element={<Legals title="Shipping & Delivery" type="shipping" />} />
        <Route path="/returns" element={<Legals title="Returns & Exchanges" type="returns" />} />
        <Route path="/terms" element={<Legals title="Terms of Service" type="terms" />} />
        <Route path="/privacy" element={<Legals title="Privacy Policy" type="privacy" />} />
      </Routes>

      <Footer />
    </Router>
  );
}

export default App;
