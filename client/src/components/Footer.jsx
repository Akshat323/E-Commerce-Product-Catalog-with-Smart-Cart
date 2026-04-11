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
              <li><Link to="/?type=Clothing">Clothing</Link></li>
              <li><Link to="/?type=Book">Books</Link></li>
              <li><Link to="/?type=Electronics">Electronics</Link></li>
              <li><Link to="/">Latest Arrivals</Link></li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="footer-column">
            <h3 className="footer-header">SUPPORT</h3>
            <ul className="footer-links">
              <li><Link to="/shipping">Shipping & Delivery</Link></li>
              <li><Link to="/returns">Returns & Exchanges</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-column">
            <h3 className="footer-header">CONNECT</h3>
            <ul className="footer-links">
              <li><Link to="/contact">Contact Support</Link></li>
              <li><Link to="/terms">Business Inquiries</Link></li>
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
