import { useState } from 'react'
import { ShoppingCart, Heart, Star, Eye } from 'lucide-react'
import styles from './ProductCard.module.css'

const BADGE_COLORS = {
  'Best Seller': '#6366f1',
  'Hot': '#ef4444',
  'New': '#10b981',
  'Sale': '#f59e0b',
}

export default function ProductCard({ product, onAddToCart, onQuickView }) {
  const [wished, setWished] = useState(false)
  const [added, setAdded] = useState(false)

  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : null

  const handleAdd = () => {
    onAddToCart(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className={styles.card}>
      <div className={styles.imageWrap}>
        <img src={product.image} alt={product.name} loading="lazy" />
        {product.badge && (
          <span className={styles.badge} style={{ background: BADGE_COLORS[product.badge] }}>
            {product.badge}
          </span>
        )}
        {discount && <span className={styles.discount}>-{discount}%</span>}
        {!product.in_stock && <div className={styles.outOfStock}>Out of Stock</div>}
        <div className={styles.actions}>
          <button className={`${styles.iconBtn} ${wished ? styles.wished : ''}`} onClick={() => setWished(w => !w)} title="Wishlist">
            <Heart size={16} fill={wished ? 'currentColor' : 'none'} />
          </button>
          <button className={styles.iconBtn} onClick={() => onQuickView(product)} title="Quick View">
            <Eye size={16} />
          </button>
        </div>
      </div>

      <div className={styles.body}>
        <p className={styles.category}>{product.category}</p>
        <h3 className={styles.name}>{product.name}</h3>

        <div className={styles.rating}>
          <Star size={13} fill="#f59e0b" color="#f59e0b" />
          <span>{product.rating}</span>
          <span className={styles.reviews}>({product.reviews.toLocaleString()})</span>
        </div>

        <div className={styles.footer}>
          <div className={styles.prices}>
            <span className={styles.price}>${product.price.toFixed(2)}</span>
            {product.original_price && (
              <span className={styles.originalPrice}>${product.original_price.toFixed(2)}</span>
            )}
          </div>
          <button
            className={`${styles.addBtn} ${added ? styles.addedBtn : ''}`}
            onClick={handleAdd}
            disabled={!product.in_stock}
          >
            {added ? '✓ Added' : <><ShoppingCart size={14} /> Add</>}
          </button>
        </div>
      </div>
    </div>
  )
}
