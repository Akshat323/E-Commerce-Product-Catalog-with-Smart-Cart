import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [trending, setTrending] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  const [searchParams] = useSearchParams();
  
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    minPrice: '',
    maxPrice: '',
    minRating: searchParams.get('minRating') || '',
    search: ''
  });

  const [pagination, setPagination] = useState({ page: 1, limit: 8, totalPages: 1, totalResults: 0 });
  const [loading, setLoading] = useState(true);

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    let url = `/api/products?page=${page}&limit=${pagination.limit}`;
    if (filters.type) url += `&type=${filters.type}`;
    if (filters.minPrice) url += `&minPrice=${filters.minPrice}`;
    if (filters.maxPrice) url += `&maxPrice=${filters.maxPrice}`;
    if (filters.minRating) url += `&minRating=${filters.minRating}`;
    if (filters.search) url += `&search=${filters.search}`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.success) {
        setProducts(data.data);
        setPagination({
          page: data.pagination.page,
          limit: data.pagination.limit,
          totalPages: data.pagination.pages,
          totalResults: data.pagination.total
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

    // Sync filters with URL params
    const typeFromUrl = searchParams.get('type') || '';
    if (filters.type !== typeFromUrl) {
      setFilters(prev => ({ ...prev, type: typeFromUrl }));
    }

    fetchProducts();
    loadTrending();
    loadRecentlyViewed();

    // If there's a type param, scroll to products
    if (searchParams.get('type')) {
      setTimeout(() => {
        document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  }, [searchParams]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    
    // If user manually changes type, update URL too
    if (name === 'type') {
      if (value) {
        window.history.pushState({}, '', `/?type=${value}`);
      } else {
        window.history.pushState({}, '', '/');
      }
    }
  };

  const applyFilters = () => {
    // Update URL to match all current filters
    const params = new URLSearchParams();
    if (filters.type) params.set('type', filters.type);
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    if (filters.minRating) params.set('minRating', filters.minRating);
    if (filters.search) params.set('search', filters.search);
    
    window.history.pushState({}, '', `/?${params.toString()}`);
    fetchProducts(1);
    
    // Smooth scroll to results
    document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilters({ type: '', minPrice: '', maxPrice: '', minRating: '', search: '' });
    // If there were URL params, clear them too
    if (searchParams.get('type') || searchParams.get('minRating')) {
      window.history.pushState({}, '', '/');
    }
    setTimeout(() => {
      fetchProducts(1);
    }, 0);
  };

  return (
    <main className="main-content">
      <section className="hero">
        <span className="badge">🔥 UP TO 15% OFF</span>
        <h1 className="hero-title">Top Deals This Week</h1>
        <p className="hero-subtitle">
          Save big on electronics, books, and more — limited time only.
        </p>
        <div className="hero-buttons">
          <button className="filter-btn filter-btn-primary" onClick={() => document.getElementById('products-section').scrollIntoView({ behavior: 'smooth' })}>
            Shop Now
          </button>
          <button className="filter-btn filter-btn-secondary" onClick={() => document.getElementById('products-section').scrollIntoView({ behavior: 'smooth' })}>
            View Products
          </button>
        </div>
      </section>

      <section className="features">
        <div className="feature-item">🚚 Fast Delivery</div>
        <div className="feature-item">🔒 Secure Payment</div>
        <div className="feature-item">⭐ Premium Quality</div>
      </section>

      {trending.length > 0 && (
        <section className="horizontal-scroll-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">Trending Now</h2>
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
              <h2 className="section-title">Recently Viewed</h2>
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
          <span className="filter-label">Price Range</span>
          <div className="filter-row">
            <input type="number" className="filter-input" name="minPrice" placeholder="Min" value={filters.minPrice} onChange={handleFilterChange} min="0" />
            <span className="filter-divider">—</span>
            <input type="number" className="filter-input" name="maxPrice" placeholder="Max" value={filters.maxPrice} onChange={handleFilterChange} min="0" />
          </div>
        </div>
        <div className="filter-group">
          <span className="filter-label">Rating</span>
          <select className="filter-select" name="minRating" value={filters.minRating} onChange={handleFilterChange} style={{ minWidth: '100px' }}>
            <option value="">Any</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
        <div className="filter-group" style={{ flexGrow: 1, maxWidth: '400px' }}>
          <span className="filter-label">Search Products</span>
          <input
            type="text"
            className="filter-input"
            name="search"
            placeholder="Keywords (e.g. MacBook, Nike...)"
            value={filters.search}
            onChange={handleFilterChange}
            style={{ width: '100%' }}
          />
        </div>
        <div className="filter-group">
          <button className="filter-btn filter-btn-primary" onClick={applyFilters}>Apply</button>
          <button className="filter-btn filter-btn-secondary" onClick={clearFilters}>Clear</button>
        </div>
      </section>

      <section id="products-section">
        <div className="section-header">
          <h2 className="section-title">All Products</h2>
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
