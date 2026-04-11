import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [trending, setTrending] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  
  const [filters, setFilters] = useState({
    type: '',
    minPrice: '',
    maxPrice: '',
    rating: ''
  });
  
  const [pagination, setPagination] = useState({ page: 1, limit: 8, totalPages: 1, totalResults: 0 });
  const [loading, setLoading] = useState(true);

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    let url = `/api/products?page=${page}&limit=${pagination.limit}`;
    if (filters.type) url += `&type=${filters.type}`;
    if (filters.minPrice) url += `&minPrice=${filters.minPrice}`;
    if (filters.maxPrice) url += `&maxPrice=${filters.maxPrice}`;
    if (filters.rating) url += `&rating=${filters.rating}`;
    
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setProducts(data.data);
        setPagination({
          page: data.page,
          limit: data.limit,
          totalPages: data.totalPages,
          totalResults: data.totalResults
        });
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const loadTrending = async () => {
    try {
      const res = await fetch('/api/trending');
      const data = await res.json();
      if (res.ok && data.data) {
        setTrending(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadRecentlyViewed = async () => {
    try {
      const sessionId = localStorage.getItem('sessionId');
      if (!sessionId) return;
      const res = await fetch(`/api/recently-viewed/${sessionId}`);
      const data = await res.json();
      if (res.ok && data.data) {
        setRecentlyViewed(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // Session ID is generated in public/js/app.js. We need to do it here
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('sessionId', sessionId);
    }
    
    fetchProducts();
    loadTrending();
    loadRecentlyViewed();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    fetchProducts(1);
  };

  const clearFilters = () => {
    setFilters({ type: '', minPrice: '', maxPrice: '', rating: '' });
    // fetchProducts is NOT called immediately because state update is async, 
    // but we can call it with empty values:
    setTimeout(() => {
      fetchProducts(1);
    }, 0);
  };

  return (
    <main className="main-content">
      <section className="hero-banner">
        <h1 className="hero-title">Discover Premium Products</h1>
        <p className="hero-subtitle">Browse our curated catalog of electronics, books, and clothing — powered by React, MongoDB & Redis.</p>
      </section>

      {trending.length > 0 && (
        <section className="horizontal-scroll-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">🔥 Trending Now</h2>
              <p className="section-subtitle">Most viewed products this hour</p>
            </div>
          </div>
          <div className="horizontal-scroll">
            {trending.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}

      {recentlyViewed.length > 0 && (
        <section className="horizontal-scroll-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">👁️ Recently Viewed</h2>
              <p className="section-subtitle">Continue where you left off</p>
            </div>
          </div>
          <div className="horizontal-scroll">
            {recentlyViewed.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}

      <section className="filters-bar">
        <div className="filter-group">
          <span className="filter-label">Type</span>
          <select className="filter-select" name="type" value={filters.type} onChange={handleFilterChange}>
            <option value="">All Types</option>
            <option value="Electronics">Electronics</option>
            <option value="Book">Books</option>
            <option value="Clothing">Clothing</option>
          </select>
        </div>
        <div className="filter-group">
          <span className="filter-label">Price</span>
          <input type="number" className="filter-input" name="minPrice" placeholder="Min" value={filters.minPrice} onChange={handleFilterChange} min="0" />
          <span style={{ color: 'var(--text-muted)' }}>—</span>
          <input type="number" className="filter-input" name="maxPrice" placeholder="Max" value={filters.maxPrice} onChange={handleFilterChange} min="0" />
        </div>
        <div className="filter-group">
          <span className="filter-label">Rating</span>
          <select className="filter-select" name="rating" value={filters.rating} onChange={handleFilterChange} style={{ minWidth: '100px' }}>
            <option value="">Any</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
            <option value="2">2+ Stars</option>
          </select>
        </div>
        <div className="filter-group">
          <button className="filter-btn filter-btn-primary" onClick={applyFilters}>Apply</button>
          <button className="filter-btn filter-btn-secondary" onClick={clearFilters}>Clear</button>
        </div>
      </section>

      <section id="products-section">
        <div className="section-header">
          <h2 className="section-title">📦 All Products</h2>
          <span className="section-subtitle">{pagination.totalResults} products found</span>
        </div>
        
        {loading ? (
          <div className="loading-spinner"><div className="spinner"></div></div>
        ) : (
          <div className="product-grid">
            {products.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="pagination">
             {[...Array(pagination.totalPages)].map((_, i) => (
                <button 
                  key={i} 
                  className={`pagination-btn ${pagination.page === i + 1 ? 'active' : ''}`}
                  onClick={() => fetchProducts(i + 1)}
                >
                  {i + 1}
                </button>
             ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default Home;
