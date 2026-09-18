import React, { useMemo } from "react";
import "./Dashboard.css";

export default function Dashboard({ products, onNavigate }) {
  const totalValue = useMemo(
    () => products.reduce((s, p) => s + p.price * p.quantity, 0),
    [products]
  );
  const lowStock = useMemo(() => products.filter((p) => p.quantity > 0 && p.quantity < 5), [products]);
  const outOfStock = useMemo(() => products.filter((p) => p.quantity === 0), [products]);
  const recent = useMemo(() => [...products].slice(-5).reverse(), [products]);

  const stats = [
    { icon: "📦", color: "purple", value: products.length, label: "Total Products" },
    { icon: "💰", color: "green",  value: `$${totalValue.toFixed(2)}`, label: "Inventory Value" },
    { icon: "⚠️", color: "yellow", value: lowStock.length, label: "Low Stock" },
    { icon: "🚫", color: "red",    value: outOfStock.length, label: "Out of Stock" },
  ];

  return (
    <div className="dashboard">
      {/* Stat Cards */}
      <div className="stat-grid">
        {stats.map((s) => (
          <div className="stat-card" key={s.label}>
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div className="stat-info">
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        {/* Recent Products */}
        <div className="dash-card">
          <div className="dash-card-title">🕐 Recent Products</div>
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.length === 0 && (
                  <tr><td colSpan={4} className="empty-row">No products yet.</td></tr>
                )}
                {recent.map((p) => {
                  const [cls, label] =
                    p.quantity === 0
                      ? ["out-stock", "Out of Stock"]
                      : p.quantity < 5
                      ? ["low-stock", "Low Stock"]
                      : ["in-stock", "In Stock"];
                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 700 }}>{p.name}</td>
                      <td className="price-cell">${Number(p.price).toFixed(2)}</td>
                      <td><span className="qty-badge">{p.quantity}</span></td>
                      <td><span className={`stock-badge ${cls}`} style={{ position: "static" }}>{label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Quick Actions */}
          <div className="dash-card">
            <div className="dash-card-title">⚡ Quick Actions</div>
            <div className="quick-actions">
              <button className="quick-btn" onClick={() => onNavigate("shop")}>
                <span className="quick-btn-icon">🛍️</span> Go to Shop
              </button>
              <button className="quick-btn" onClick={() => onNavigate("admin")}>
                <span className="quick-btn-icon">➕</span> Add Product
              </button>
              <button className="quick-btn" onClick={() => onNavigate("admin")}>
                <span className="quick-btn-icon">📦</span> Manage Inventory
              </button>
            </div>
          </div>

          {/* Stock Alerts */}
          <div className="dash-card">
            <div className="dash-card-title">🔔 Stock Alerts</div>
            <div className="alert-list">
              {lowStock.length === 0 && outOfStock.length === 0 ? (
                <p className="no-alerts">✅ All products are well stocked!</p>
              ) : (
                <>
                  {outOfStock.map((p) => (
                    <div className="alert-item" key={p.id}>
                      <span className="alert-name">{p.name}</span>
                      <span className="alert-qty out">Out of Stock</span>
                    </div>
                  ))}
                  {lowStock.map((p) => (
                    <div className="alert-item" key={p.id}>
                      <span className="alert-name">{p.name}</span>
                      <span className="alert-qty low">Only {p.quantity} left</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
