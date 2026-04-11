import { Link } from 'react-router-dom';

const getCategoryIcon = (category) => {
  if (category === 'Electronics') return '💻';
  if (category === 'Book') return '📚';
  if (category === 'Clothing') return '👕';
  return '📦';
};

const ProductCard = ({ product }) => {
  const isOutOfStock = product.stockCount === 0;
  const isLowStock = product.stockCount > 0 && product.stockCount <= 5;
  
  let stockClass = 'in';
  let stockText = `${product.stockCount} in stock`;
  
  if (isOutOfStock) {
    stockClass = 'out';
    stockText = 'Out of Stock';
  } else if (isLowStock) {
    stockClass = 'low';
    stockText = `Only ${product.stockCount} left`;
  }

  const renderStars = (rating) => {
    const full = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    let stars = [];
    for (let i = 1; i <= 5; i++) {
        if (i <= full) {
            stars.push(<span key={i} className="star">★</span>);
        } else if (i === full + 1 && hasHalf) {
             stars.push(<span key={i} className="star">★</span>); // Assuming half star represented same in text for simplicity
        } else {
             stars.push(<span key={i} className="star empty">★</span>);
        }
    }
    return stars;
  };

  return (
    <Link to={`/product/${product._id}`} className="product-card">
      <div className="product-card-image">
        <span className="type-badge">{product.type}</span>
        {getCategoryIcon(product.type)}
      </div>
      <div className="product-card-body">
        <div className="product-card-category">{product.brand || 'Generic'}</div>
        <h3 className="product-card-name">{product.name}</h3>
        <div className="product-card-meta">
          <span className="product-card-price">${product.price.toFixed(2)}</span>
          {product.brand && <span className="product-card-brand">{product.brand}</span>}
        </div>
        <div className="product-card-footer">
          <div className="rating-stars">
            {renderStars(product.calcAverageRating || 0)}
            <span className="rating-text">({product.calcTotalReviews || 0})</span>
          </div>
          <div className={`product-card-stock ${stockClass}`}>
            {stockText}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
