import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import "./App.css";

const api = axios.create({ baseURL: "http://localhost:8000" });

const ICONS = ["📱","💻","📷","🖱️","⌨️","🎧","📺","🖨️","💾","🔋","🖥️","📡"];
const getIcon = (name = "") => ICONS[name.charCodeAt(0) % ICONS.length];

const stockStatus = (qty) =>
  qty === 0 ? ["out-stock","Out of Stock"] : qty < 5 ? ["low-stock","Low Stock"] : ["in-stock","In Stock"];

function Toast({ toasts }) {
  return (
    <div className="toast">
      {toasts.map((t) => (
        <div key={t.id} className={`toast-msg toast-${t.type}`}>{t.msg}</div>
      ))}
    </div>
  );
}

function CartDrawer({ cart, onClose, onQty, onRemove, onCheckout }) {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  return (
    <div className="cart-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="cart-drawer">
        <div className="cart-header">
          <h2>🛒 Your Cart ({cart.reduce((s, i) => s + i.qty, 0)})</h2>
          <button className="cart-close" onClick={onClose}>✕</button>
        </div>
        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty">🛍️<br />Your cart is empty</div>
          ) : cart.map((item) => (
            <div className="cart-item" key={item.id}>
              <div className="cart-item-icon">{getIcon(item.name)}</div>
              <div className="cart-item-info">
                <div className="cart-item-name">{item.name}</div>
                <div className="cart-item-price">${(item.price * item.qty).toFixed(2)}</div>
              </div>
              <div className="qty-controls">
                <button className="qty-btn" onClick={() => onQty(item.id, -1)}>−</button>
                <span className="qty-num">{item.qty}</span>
                <button className="qty-btn" onClick={() => onQty(item.id, 1)}>+</button>
              </div>
              <button className="cart-remove" onClick={() => onRemove(item.id)}>🗑</button>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total"><span>Total</span><span>${total.toFixed(2)}</span></div>
            <button className="btn-checkout" onClick={onCheckout}>Proceed to Checkout →</button>
          </div>
        )}
      </div>
    </div>
  );
}

function CheckoutModal({ cart, onClose, onSuccess }) {
  const [form, setForm] = useState({ name: "", email: "", address: "", card: "" });
  const [done, setDone] = useState(false);
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const handleOrder = (e) => {
    e.preventDefault();
    setDone(true);
    setTimeout(() => { onSuccess(); onClose(); }, 2500);
  };

  if (done) return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="order-success">
          <div className="check">✅</div>
          <h3>Order Placed!</h3>
          <p>Thanks {form.name}! Your order of ${total.toFixed(2)} is confirmed.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2>🧾 Checkout</h2>
        <div className="order-summary">
          {cart.map((i) => (
            <div className="order-summary-row" key={i.id}>
              <span>{i.name} × {i.qty}</span>
              <span>${(i.price * i.qty).toFixed(2)}</span>
            </div>
          ))}
          <div className="order-summary-row total"><span>Total</span><span>${total.toFixed(2)}</span></div>
        </div>
        <form className="modal-form" onSubmit={handleOrder}>
          <input placeholder="Full Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input placeholder="Delivery Address" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <input placeholder="Card Number (demo)" required value={form.card} onChange={(e) => setForm({ ...form, card: e.target.value })} />
          <div className="modal-actions">
            <button className="btn btn-primary" type="submit" style={{ flex: 1 }}>Place Order</button>
            <button className="btn btn-secondary" type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ShopView({ products, onAddToCart }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name");

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    let r = q ? products.filter((p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)) : [...products];
    r.sort((a, b) => sort === "price-asc" ? a.price - b.price : sort === "price-desc" ? b.price - a.price : a.name.localeCompare(b.name));
    return r;
  }, [products, search, sort]);

  return (
    <>
      <div className="toolbar">
        <input className="toolbar-search" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="toolbar-select" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="name">Sort: Name</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
        </select>
        <div className="chip">{list.length} products</div>
      </div>
      <div className="product-grid">
        {list.map((p) => {
          const [cls, label] = stockStatus(p.quantity);
          return (
            <div className="product-card" key={p.id}>
              <div className="product-img">
                {getIcon(p.name)}
                <span className={`stock-badge ${cls}`}>{label}</span>
              </div>
              <div className="product-body">
                <div className="product-name">{p.name}</div>
                <div className="product-desc">{p.description}</div>
              </div>
              <div className="product-footer">
                <span className="product-price">${Number(p.price).toFixed(2)}</span>
                <button className="btn-add" disabled={p.quantity === 0} onClick={() => onAddToCart(p)}>
                  {p.quantity === 0 ? "Sold Out" : "+ Add"}
                </button>
              </div>
            </div>
          );
        })}
        {list.length === 0 && <p style={{ color: "var(--muted)", gridColumn: "1/-1" }}>No products found.</p>}
      </div>
    </>
  );
}

function AdminView({ products, onRefresh, addToast }) {
  const [form, setForm] = useState({ id: "", name: "", description: "", price: "", quantity: "" });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState("id");
  const [sortDir, setSortDir] = useState("asc");

  const sorted = useMemo(() => [...products].sort((a, b) => {
    let av = a[sortField], bv = b[sortField];
    if (["id","price","quantity"].includes(sortField)) { av = Number(av); bv = Number(bv); }
    else { av = String(av).toLowerCase(); bv = String(bv).toLowerCase(); }
    return av < bv ? (sortDir === "asc" ? -1 : 1) : av > bv ? (sortDir === "asc" ? 1 : -1) : 0;
  }), [products, sortField, sortDir]);

  const handleSort = (f) => { setSortField(f); setSortDir(sortField === f && sortDir === "asc" ? "desc" : "asc"); };
  const thClass = (f) => sortField === f ? `sort-${sortDir}` : "";

  const reset = () => { setForm({ id: "", name: "", description: "", price: "", quantity: "" }); setEditId(null); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    const payload = { ...form, id: Number(form.id), price: Number(form.price), quantity: Number(form.quantity) };
    try {
      if (editId) { await api.put(`/products/${editId}`, payload); addToast("Product updated", "success"); }
      else { await api.post("/products/", payload); addToast("Product added", "success"); }
      reset(); onRefresh();
    } catch (err) { addToast(err.response?.data?.detail || "Operation failed", "error"); }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    setLoading(true);
    try { await api.delete(`/products/${id}`); addToast("Product deleted", "success"); onRefresh(); }
    catch { addToast("Delete failed", "error"); }
    setLoading(false);
  };

  const handleEdit = (p) => { setForm({ id: p.id, name: p.name, description: p.description, price: p.price, quantity: p.quantity }); setEditId(p.id); };

  return (
    <div className="admin-layout">
      <div className="card">
        <h2>{editId ? "✏️ Edit Product" : "➕ Add Product"}</h2>
        <form className="product-form" onSubmit={handleSubmit}>
          <input type="number" placeholder="ID" value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} required disabled={!!editId} />
          <input placeholder="Product Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <div className="form-row">
            <input type="number" placeholder="Price" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            <input type="number" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={loading}>{editId ? "Update" : "Add Product"}</button>
            {editId && <button className="btn btn-secondary" type="button" onClick={reset}>Cancel</button>}
          </div>
        </form>
      </div>

      <div className="card">
        <h2>📦 Inventory ({products.length})</h2>
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                {[["id","ID"],["name","Name"],["description","Description"],["price","Price"],["quantity","Qty"]].map(([f,l]) => (
                  <th key={f} className={thClass(f)} onClick={() => handleSort(f)}>{l}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td style={{ fontWeight: 700 }}>{p.name}</td>
                  <td style={{ color: "var(--muted)", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.description}</td>
                  <td className="price-cell">${Number(p.price).toFixed(2)}</td>
                  <td><span className="qty-badge">{p.quantity}</span></td>
                  <td>
                    <div className="tbl-actions">
                      <button className="btn-edit" onClick={() => handleEdit(p)}>Edit</button>
                      <button className="btn-delete" onClick={() => handleDelete(p.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {sorted.length === 0 && <tr><td colSpan={6} className="empty-row">No products found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [products, setProducts] = useState([]);
  const [view, setView] = useState("shop");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = (msg, type = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };

  const fetchProducts = async () => {
    try { const r = await api.get("/products/"); setProducts(r.data); }
    catch { addToast("Failed to load products", "error"); }
  };

  useEffect(() => { fetchProducts(); }, []); // eslint-disable-line

  const addToCart = (product) => {
    setCart((c) => {
      const ex = c.find((i) => i.id === product.id);
      return ex ? c.map((i) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i) : [...c, { ...product, qty: 1 }];
    });
    addToast(`${product.name} added to cart 🛒`);
  };

  const updateQty = (id, delta) => {
    setCart((c) => c.map((i) => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  };

  const removeFromCart = (id) => setCart((c) => c.filter((i) => i.id !== id));

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <>
      <nav className="navbar">
        <div className="nav-brand">
          <span>🛍️</span>
          <h1>ShopTrac</h1>
        </div>
        <div className="nav-links">
          <button className={`nav-link ${view === "shop" ? "active" : ""}`} onClick={() => setView("shop")}>Shop</button>
          <button className={`nav-link ${view === "admin" ? "active" : ""}`} onClick={() => setView("admin")}>Admin</button>
        </div>
        <div className="nav-right">
          {view === "shop" && (
            <button className="cart-btn" onClick={() => setCartOpen(true)}>
              🛒 Cart {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </button>
          )}
        </div>
      </nav>

      {view === "shop" && (
        <>
          <div className="hero">
            <h2>Discover Amazing Products</h2>
            <p>Shop the latest tech gadgets and electronics at unbeatable prices.</p>
            <div className="hero-actions">
              <button className="btn-hero btn-hero-primary" onClick={() => document.querySelector(".toolbar-search")?.focus()}>Shop Now</button>
              <button className="btn-hero btn-hero-outline" onClick={() => setView("admin")}>Manage Store</button>
            </div>
          </div>
          <div className="page">
            <p className="section-title">All Products <span>({products.length})</span></p>
            <ShopView products={products} onAddToCart={addToCart} />
          </div>
        </>
      )}

      {view === "admin" && (
        <div className="page">
          <p className="section-title">Admin <span>Panel</span></p>
          <AdminView products={products} onRefresh={fetchProducts} addToast={addToast} />
        </div>
      )}

      {cartOpen && (
        <CartDrawer
          cart={cart}
          onClose={() => setCartOpen(false)}
          onQty={updateQty}
          onRemove={removeFromCart}
          onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }}
        />
      )}

      {checkoutOpen && (
        <CheckoutModal
          cart={cart}
          onClose={() => setCheckoutOpen(false)}
          onSuccess={() => { setCart([]); addToast("Order placed successfully! 🎉"); }}
        />
      )}

      <footer className="footer">
        <strong>ShopTrac</strong> — Powered by Telusko · FastAPI + React
      </footer>

      <Toast toasts={toasts} />
    </>
  );
}
