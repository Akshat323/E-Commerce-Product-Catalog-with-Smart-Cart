import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand Info */}
          <div className="footer-column">
            <h2 className="footer-logo">MARTIFY</h2>
            <p className="footer-description">
              Elevating your lifestyle with premium essentials and high-utility design.
            </p>
          </div>

          {/* Shop Links */}
          <div className="footer-column">
            <h3 className="footer-header">SHOP</h3>
            <ul className="footer-links">
              <li><Link to="/">Latest Arrivals</Link></li>
              <li><Link to="/">Trending Now</Link></li>
              <li><Link to="/">Electronics</Link></li>
              <li><Link to="/">Lifestyle</Link></li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="footer-column">
            <h3 className="footer-header">SUPPORT</h3>
            <ul className="footer-links">
              <li><Link to="/">Shipping & Delivery</Link></li>
              <li><Link to="/">Returns & Exchanges</Link></li>
              <li><Link to="/">Terms of Service</Link></li>
              <li><Link to="/">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-column">
            <h3 className="footer-header">CONNECT</h3>
            <ul className="footer-links">
              <li><a href="#">Instagram</a></li>
              <li><a href="#">Twitter/X</a></li>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">Store Locator</a></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="footer-container">
          <p>© 2026 Martify. Designed for High-Utility Living.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
