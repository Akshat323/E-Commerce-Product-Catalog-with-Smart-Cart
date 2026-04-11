import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Legals = ({ title, type }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const getContent = () => {
    switch (type) {
      case 'shipping':
        return (
          <>
            <h3>Dispatch & Handling</h3>
            <p>Orders are processed and dispatched within 24-48 hours of confirmation. We partner with premium logistics providers to ensure your high-utility essentials reach you in pristine condition.</p>
            <h3>Delivery Timelines</h3>
            <p><strong>Domestic:</strong> 3-5 business days.</p>
            <p><strong>International:</strong> 7-12 business days (Region dependent).</p>
            <h3>Tracking</h3>
            <p>A tracking number will be issued to your registered email address immediately upon dispatch.</p>
          </>
        );
      case 'returns':
        return (
          <>
            <h3>Hassle-Free Returns</h3>
            <p>We believe in the quality of our curation. If you are not satisfied, we accept returns within 14 days of delivery.</p>
            <h3>Eligibility</h3>
            <p>Items must be in original, unwashed, and unworn condition with all tags intact. Electronic items must not have been activated or registered.</p>
            <h3>Refund Process</h3>
            <p>Once your return is received and inspected, the refund will be processed to your original mode of payment within 5-7 business days.</p>
          </>
        );
      case 'terms':
        return (
          <>
            <h3>Service Agreement</h3>
            <p>By using Martify, you agree to comply with and be bound by the following terms of use. Please review these terms carefully.</p>
            <h3>Privacy & Conduct</h3>
            <p>Users are responsible for maintaining the confidentiality of their accounts. We reserve the right to refuse service or cancel orders at our sole discretion.</p>
            <h3>Limitation of Liability</h3>
            <p>Martify shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services.</p>
          </>
        );
      case 'privacy':
        return (
          <>
            <h3>Data Protection</h3>
            <p>We respect your privacy. All personal data is encrypted and handled in compliance with international data protection standards.</p>
            <h3>Information Collection</h3>
            <p>We collect essential information required to process your orders and enhance your shopping experience. We never sell your data to third parties.</p>
            <h3>Cookies</h3>
            <p>Our site uses essential cookies for cart persistence and basic analytics to improve site performance.</p>
          </>
        );
      default:
        return <p>Legal information coming soon.</p>;
    }
  };

  return (
    <main className="main-content">
      <div className="section-header">
        <h1 className="section-title">{title}</h1>
      </div>
      
      <div className="legal-card">
        <div className="legal-content">
          {getContent()}
        </div>
      </div>
    </main>
  );
};

export default Legals;
