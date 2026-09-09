import { useState, useMemo, useEffect, useRef } from 'react'
import { Search, ShoppingBag, X, Star, ChevronDown, Zap, Plus, Upload, PackagePlus } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { MOCK_PRODUCTS, MOCK_CATEGORIES, addProduct } from '../api/products'
import styles from './ProductsPage.module.css'

const SORT_OPTIONS = [
  { value: 'name', label: 'Name A–Z' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
]

export default function ProductsPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('name')
  const [products, setProducts] = useState(MOCK_PRODUCTS)
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [quickView, setQuickView] = useState(null)
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({ name: '', price: '', original_price: '', category: 'Electronics', badge: '', image: '', in_stock: true })
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const imageInputRef = useRef(null)

  const filtered = useMemo(() => {
    let list = products
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    if (category !== 'All') list = list.filter(p => p.category === category)
    return [...list].sort((a, b) => {
      if (sort === 'price_asc') return a.price - b.price
      if (sort === 'price_desc') return b.price - a.price
      if (sort === 'rating') return b.rating - a.rating
      return a.name.localeCompare(b.name)
    })
  }, [search, category, sort])

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id)
      return existing
        ? prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { ...product, qty: 1 }]
    })
  }

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id))
  const updateQty = (id, qty) => {
    if (qty < 1) return removeFromCart(id)
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i))
  }

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0)
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0)

  useEffect(() => {
    document.body.style.overflow = (cartOpen || quickView || addOpen) ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [cartOpen, quickView, addOpen])

  const validateForm = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Product name is required'
    if (!form.price || isNaN(form.price) || +form.price <= 0) errs.price = 'Enter a valid price'
    if (form.original_price && (isNaN(form.original_price) || +form.original_price <= 0)) errs.original_price = 'Enter a valid original price'
    if (!form.image.trim()) errs.image = 'Image URL is required'
    return errs
  }

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
    setFormErrors(errs => ({ ...errs, [name]: undefined }))
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    const errs = validateForm()
    if (Object.keys(errs).length) return setFormErrors(errs)
    setSubmitting(true)
    try {
      const newProduct = {
        id: Date.now(),
        name: form.name.trim(),
        price: parseFloat(form.price),
        original_price: form.original_price ? parseFloat(form.original_price) : null,
        category: form.category,
        badge: form.badge || null,
        image: form.image.trim(),
        in_stock: form.in_stock,
        rating: 0,
        reviews: 0,
      }
      // Try FastAPI, fall back to local state
      try { await addProduct(newProduct) } catch (_) {}
      setProducts(prev => [newProduct, ...prev])
      setSubmitSuccess(true)
      setTimeout(() => {
        setSubmitSuccess(false)
        setAddOpen(false)
        setForm({ name: '', price: '', original_price: '', category: 'Electronics', badge: '', image: '', in_stock: true })
      }, 1200)
    } finally {
      setSubmitting(false)
    }
  }

  const closeAddModal = () => {
    setAddOpen(false)
    setFormErrors({})
    setSubmitSuccess(false)
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>
            <Zap size={22} fill="currentColor" />
            <span>ShopFast</span>
          </div>
          <div className={styles.searchBar}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && <button className={styles.clearSearch} onClick={() => setSearch('')}><X size={14} /></button>}
          </div>
          <button className={styles.addProductBtn} onClick={() => setAddOpen(true)}>
            <Plus size={16} />
            <span>Add Product</span>
          </button>
          <button className={styles.cartBtn} onClick={() => setCartOpen(true)}>
            <ShoppingBag size={20} />
            {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
          </button>
        </div>
      </header>

      {/* Hero Banner */}
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.heroTag}>🔥 Summer Sale — Up to 40% Off</p>
          <h1>Discover Premium Products</h1>
          <p>Curated collection of top-rated items, delivered fast.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarInner}>
          <div className={styles.categories}>
            {MOCK_CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`${styles.catBtn} ${category === cat ? styles.catActive : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className={styles.toolbarRight}>
            <span className={styles.resultCount}>{filtered.length} products</span>
            <div className={styles.sortWrap}>
              <select value={sort} onChange={e => setSort(e.target.value)}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown size={14} className={styles.sortIcon} />
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <main className={styles.main}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <Search size={48} strokeWidth={1} />
            <p>No products found for "<strong>{search}</strong>"</p>
            <button onClick={() => { setSearch(''); setCategory('All') }}>Clear filters</button>
          </div>
        ) : (
          <div className={styles.grid}>
            {filtered.map(p => (
              <ProductCard key={p.id} product={p} onAddToCart={addToCart} onQuickView={setQuickView} />
            ))}
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      {cartOpen && (
        <div className={styles.overlay} onClick={() => setCartOpen(false)}>
          <div className={styles.drawer} onClick={e => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <h2>Your Cart <span>({cartCount})</span></h2>
              <button onClick={() => setCartOpen(false)}><X size={20} /></button>
            </div>
            <div className={styles.drawerBody}>
              {cart.length === 0 ? (
                <div className={styles.emptyCart}>
                  <ShoppingBag size={48} strokeWidth={1} />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className={styles.cartItem}>
                    <img src={item.image} alt={item.name} />
                    <div className={styles.cartItemInfo}>
                      <p className={styles.cartItemName}>{item.name}</p>
                      <p className={styles.cartItemPrice}>${(item.price * item.qty).toFixed(2)}</p>
                      <div className={styles.qtyControl}>
                        <button onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                        <span>{item.qty}</span>
                        <button onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                      </div>
                    </div>
                    <button className={styles.removeBtn} onClick={() => removeFromCart(item.id)}><X size={14} /></button>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className={styles.drawerFooter}>
                <div className={styles.total}>
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <button className={styles.checkoutBtn}>Proceed to Checkout</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {addOpen && (
        <div className={styles.overlay} style={{ justifyContent: 'center', alignItems: 'center' }} onClick={closeAddModal}>
          <div className={styles.addModal} onClick={e => e.stopPropagation()}>
            <div className={styles.addModalHeader}>
              <div className={styles.addModalTitle}>
                <PackagePlus size={20} />
                <h2>Add New Product</h2>
              </div>
              <button onClick={closeAddModal}><X size={20} /></button>
            </div>

            <form className={styles.addForm} onSubmit={handleAddProduct} noValidate>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Product Name <span>*</span></label>
                  <input name="name" value={form.name} onChange={handleFormChange} placeholder="e.g. Wireless Headphones" />
                  {formErrors.name && <p className={styles.fieldError}>{formErrors.name}</p>}
                </div>
              </div>

              <div className={styles.formRow2}>
                <div className={styles.formGroup}>
                  <label>Price (USD) <span>*</span></label>
                  <div className={styles.inputPrefix}>
                    <span>$</span>
                    <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleFormChange} placeholder="0.00" />
                  </div>
                  {formErrors.price && <p className={styles.fieldError}>{formErrors.price}</p>}
                </div>
                <div className={styles.formGroup}>
                  <label>Original Price <span className={styles.optional}>(optional)</span></label>
                  <div className={styles.inputPrefix}>
                    <span>$</span>
                    <input name="original_price" type="number" min="0" step="0.01" value={form.original_price} onChange={handleFormChange} placeholder="0.00" />
                  </div>
                  {formErrors.original_price && <p className={styles.fieldError}>{formErrors.original_price}</p>}
                </div>
              </div>

              <div className={styles.formRow2}>
                <div className={styles.formGroup}>
                  <label>Category <span>*</span></label>
                  <div className={styles.selectWrap}>
                    <select name="category" value={form.category} onChange={handleFormChange}>
                      {['Electronics', 'Fashion', 'Furniture', 'Home'].map(c => <option key={c}>{c}</option>)}
                    </select>
                    <ChevronDown size={14} />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Badge <span className={styles.optional}>(optional)</span></label>
                  <div className={styles.selectWrap}>
                    <select name="badge" value={form.badge} onChange={handleFormChange}>
                      <option value="">None</option>
                      {['Best Seller', 'Hot', 'New', 'Sale'].map(b => <option key={b}>{b}</option>)}
                    </select>
                    <ChevronDown size={14} />
                  </div>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Image URL <span>*</span></label>
                <input name="image" value={form.image} onChange={handleFormChange} placeholder="https://images.unsplash.com/..." />
                {formErrors.image && <p className={styles.fieldError}>{formErrors.image}</p>}
              </div>

              {form.image && (
                <div className={styles.imagePreview}>
                  <img src={form.image} alt="preview" onError={e => e.target.style.display='none'} />
                  <span>Preview</span>
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" name="in_stock" checked={form.in_stock} onChange={handleFormChange} />
                  <span className={styles.checkmark} />
                  In Stock
                </label>
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.cancelBtn} onClick={closeAddModal}>Cancel</button>
                <button type="submit" className={`${styles.submitBtn} ${submitSuccess ? styles.successBtn : ''}`} disabled={submitting}>
                  {submitSuccess ? '✓ Product Added!' : submitting ? 'Adding...' : <><Plus size={16} /> Add Product</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      {quickView && (
        <div className={styles.overlay} onClick={() => setQuickView(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setQuickView(null)}><X size={20} /></button>
            <div className={styles.modalContent}>
              <div className={styles.modalImage}>
                <img src={quickView.image} alt={quickView.name} />
                {quickView.badge && (
                  <span className={styles.modalBadge}>{quickView.badge}</span>
                )}
              </div>
              <div className={styles.modalInfo}>
                <p className={styles.modalCategory}>{quickView.category}</p>
                <h2>{quickView.name}</h2>
                <div className={styles.modalRating}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill={i < Math.floor(quickView.rating) ? '#f59e0b' : 'none'} color="#f59e0b" />
                  ))}
                  <span>{quickView.rating} · {quickView.reviews.toLocaleString()} reviews</span>
                </div>
                <div className={styles.modalPrices}>
                  <span className={styles.modalPrice}>${quickView.price.toFixed(2)}</span>
                  {quickView.original_price && (
                    <span className={styles.modalOriginal}>${quickView.original_price.toFixed(2)}</span>
                  )}
                  {quickView.original_price && (
                    <span className={styles.modalSave}>
                      Save ${(quickView.original_price - quickView.price).toFixed(2)}
                    </span>
                  )}
                </div>
                <p className={styles.modalDesc}>
                  Premium quality {quickView.name.toLowerCase()} with exceptional craftsmanship.
                  Designed for everyday use with durability and style in mind.
                </p>
                <div className={styles.modalStock}>
                  <span className={quickView.in_stock ? styles.inStock : styles.outStock}>
                    {quickView.in_stock ? '✓ In Stock' : '✗ Out of Stock'}
                  </span>
                </div>
                <button
                  className={styles.modalAddBtn}
                  disabled={!quickView.in_stock}
                  onClick={() => { addToCart(quickView); setQuickView(null); setCartOpen(true) }}
                >
                  <ShoppingBag size={18} /> Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
