import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const getProductImage = (name) => {
  // Slugify name: "Blue Shirt" -> "blue_shirt.jpg"
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `/products/${slug}.jpg`;
};

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  
  const [reviewForm, setReviewForm] = useState({ username: '', rating: 5, comment: '' });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        let sessionId = localStorage.getItem('sessionId');
        const res = await fetch(`/api/products/${id}?userId=${sessionId}`);
        const data = await res.json();
        if (res.ok) {
          setProduct(data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/reviews/${id}`);
        const data = await res.json();
        if (res.ok) {
          setReviews(data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    setLoading(true);
    Promise.all([fetchProduct(), fetchReviews()]).then(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      const payload = {
        userId: localStorage.getItem('sessionId'),
        productId: product._id,
        quantity: qty
      };
      
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        window.dispatchEvent(new Event('cartUpdated'));
        // show toast
        alert('Added to cart!');
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to add to cart');
      }
    } catch (err) {
      console.error(err);
      alert('Error adding to cart');
    }
    setAddingToCart(false);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        product_id: id,
        user_id: localStorage.getItem('sessionId') || 'anonymous',
        username: reviewForm.username,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      };
      
      const res = await fetch(`/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const data = await res.json();
        setReviews([...reviews, data.data]);
        setReviewForm({ username: '', rating: 5, comment: '' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;
  if (!product) return <div className="empty-state">Product not found</div>;

  return (
    <main className="main-content">
      <div className="product-detail">
        <div className="product-detail-image">
          <img 
            src={getProductImage(product.name)} 
            alt={product.name}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
          <span style={{ display: 'none' }}>
            {product.type === 'Electronics' ? '💻' : product.type === 'Book' ? '📚' : product.type === 'Clothing' ? '👕' : '📦'}
          </span>
        </div>
        
        <div className="product-detail-info">
          <span className="product-detail-type">{product.type}</span>
          <h1 className="product-detail-name">{product.name}</h1>
          <div className="product-detail-price">₹{product.price.toFixed(2)}</div>
          
          <div className="product-specs">
            {product.description && (
              <p style={{ marginBottom: '12px', color: 'var(--text-muted)', lineHeight: '1.6' }}>{product.description}</p>
            )}
            {product.brand && (
              <p style={{ marginBottom: '8px' }}>
                <strong style={{ color: 'var(--text-muted)' }}>Brand:</strong> {product.brand}
              </p>
            )}
            {product.category && (
              <p style={{ marginBottom: '8px' }}>
                <strong style={{ color: 'var(--text-muted)' }}>Category:</strong> {product.category}
              </p>
            )}
            {/* Book-specific fields */}
            {product.author && (
              <p style={{ marginBottom: '8px' }}>
                <strong style={{ color: 'var(--text-muted)' }}>Author:</strong> {product.author}
              </p>
            )}
            {product.isbn && (
              <p style={{ marginBottom: '8px' }}>
                <strong style={{ color: 'var(--text-muted)' }}>ISBN:</strong> {product.isbn}
              </p>
            )}
            {product.pages && (
              <p style={{ marginBottom: '8px' }}>
                <strong style={{ color: 'var(--text-muted)' }}>Pages:</strong> {product.pages}
              </p>
            )}
            {product.publisher && (
              <p style={{ marginBottom: '8px' }}>
                <strong style={{ color: 'var(--text-muted)' }}>Publisher:</strong> {product.publisher}
              </p>
            )}
            {/* Clothing-specific fields */}
            {product.size && product.size.length > 0 && (
              <p style={{ marginBottom: '8px' }}>
                <strong style={{ color: 'var(--text-muted)' }}>Sizes:</strong> {product.size.join(', ')}
              </p>
            )}
            {product.color && product.color.length > 0 && (
              <p style={{ marginBottom: '8px' }}>
                <strong style={{ color: 'var(--text-muted)' }}>Colors:</strong> {product.color.join(', ')}
              </p>
            )}
            {product.material && (
              <p style={{ marginBottom: '8px' }}>
                <strong style={{ color: 'var(--text-muted)' }}>Material:</strong> {product.material}
              </p>
            )}
            <p style={{ marginBottom: '8px' }}>
              <strong style={{ color: 'var(--text-muted)' }}>In Stock:</strong> {product.stock_quantity}
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <div className="qty-selector">
              <button 
                className="qty-btn" 
                onClick={() => setQty(Math.max(1, qty - 1))}
              >-</button>
              <input type="text" className="qty-value" value={qty} readOnly />
              <button 
                className="qty-btn" 
                onClick={() => setQty(Math.min(product.stock_quantity, qty + 1))}
                disabled={qty >= product.stock_quantity}
              >+</button>
            </div>
            <button 
              className="btn-add-cart" 
              onClick={handleAddToCart}
              disabled={addingToCart || product.stock_quantity === 0}
              style={{ flex: 1 }}
            >
              {addingToCart ? 'Adding...' : product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>

      <section className="reviews-section">
        <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>Customer Reviews</h2>
        
        <form className="review-form" onSubmit={handleReviewSubmit}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Write a Review</h3>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Your Name</label>
            <input 
              type="text" 
              className="form-control" 
              required
              placeholder="e.g. John Doe"
              value={reviewForm.username}
              onChange={e => setReviewForm({...reviewForm, username: e.target.value})}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Rating</label>
            <select 
              className="form-control" 
              value={reviewForm.rating} 
              onChange={e => setReviewForm({...reviewForm, rating: Number(e.target.value)})}
            >
              {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Stars</option>)}
            </select>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Comment</label>
            <textarea 
              className="form-control" 
              rows="3" 
              required
              value={reviewForm.comment}
              onChange={e => setReviewForm({...reviewForm, comment: e.target.value})}
            ></textarea>
          </div>
          <button type="submit" className="filter-btn filter-btn-primary">Submit Review</button>
        </form>

        <div className="reviews-list">
          {reviews.length === 0 ? (
             <p style={{ color: 'var(--text-muted)' }}>No reviews yet.</p>
          ) : (
            reviews.map(r => (
              <div key={r._id} className="review-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span className="review-username">{r.username || r.user_id}</span>
                  <span className="rating-stars">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`star ${i < r.rating ? 'active' : ''}`}>★</span>
                    ))}
                  </span>
                </div>
                <p className="review-comment">{r.comment}</p>
                <div className="review-date">
                  {new Date(r.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
};

export default ProductDetail;
