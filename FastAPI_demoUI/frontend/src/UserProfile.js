import React, { useState } from "react";
import axios from "axios";
import "./UserProfile.css";

const api = axios.create({ baseURL: "http://localhost:8000" });

export default function UserProfile({ user, onUpdate, addToast, cart, products }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: user.username, email: user.email });
  const [loading, setLoading] = useState(false);

  const initials = user.username
    ? user.username.slice(0, 2).toUpperCase()
    : "U";

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartItems = cart.reduce((s, i) => s + i.qty, 0);
  const memberSince = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.username.trim()) { addToast("Username cannot be empty", "error"); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await api.put(
        "/users/me",
        { username: form.username, email: form.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdate(data);
      setEditing(false);
      addToast("Profile updated successfully ✅");
    } catch (err) {
      addToast(err.response?.data?.detail || "Update failed", "error");
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setForm({ username: user.username, email: user.email });
    setEditing(false);
  };

  return (
    <div className="profile-grid">
      {/* Left — Profile Card */}
      <div className="profile-card">
        <div className="profile-banner" />
        <div className="profile-body">
          <div className="profile-avatar">{initials}</div>
          <div className="profile-name">{user.username}</div>
          <div className="profile-email">{user.email}</div>
          <span className="profile-badge">🛡️ {user.role?.name ?? "Member"}</span>
          <hr className="profile-divider" />
          <div className="profile-meta">
            <div className="profile-meta-row">
              <span>📅</span>
              <span>Member since <strong>{memberSince}</strong></span>
            </div>
            <div className="profile-meta-row">
              <span>🛒</span>
              <span><strong>{cartItems}</strong> items in cart</span>
            </div>
            <div className="profile-meta-row">
              <span>💰</span>
              <span>Cart value <strong>${cartTotal.toFixed(2)}</strong></span>
            </div>
            <div className="profile-meta-row">
              <span>📦</span>
              <span><strong>{products.length}</strong> products available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right — Details */}
      <div className="profile-details">
        {/* Account Info */}
        <div className="detail-card">
          <div className="detail-card-title">
            🪪 Account Information
            {!editing && (
              <button
                className="btn btn-primary"
                style={{ marginLeft: "auto", padding: "6px 16px", fontSize: 13 }}
                onClick={() => setEditing(true)}
              >
                ✏️ Edit
              </button>
            )}
          </div>

          {editing ? (
            <form className="edit-form" onSubmit={handleSave}>
              <div className="info-grid">
                <div className="info-field">
                  <label className="info-label">Username</label>
                  <input
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    placeholder="Username"
                    required
                  />
                </div>
                <div className="info-field">
                  <label className="info-label">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    disabled
                    placeholder="Email"
                  />
                </div>
              </div>
              <div className="edit-actions">
                <button className="btn btn-primary" type="submit" disabled={loading}>
                  {loading ? "Saving…" : "Save Changes"}
                </button>
                <button className="btn btn-secondary" type="button" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="info-grid">
              <div className="info-field">
                <span className="info-label">Username</span>
                <div className="info-value">👤 {user.username}</div>
              </div>
              <div className="info-field">
                <span className="info-label">Email</span>
                <div className="info-value">✉️ {user.email}</div>
              </div>
              <div className="info-field">
                <span className="info-label">Account ID</span>
                <div className="info-value">🔑 #{user.id ?? "—"}</div>
              </div>
              <div className="info-field">
                <span className="info-label">Role</span>
                <div className="info-value">🛡️ {user.role?.name ?? "—"}</div>
              </div>
            </div>
          )}
        </div>

        {/* Activity Stats */}
        <div className="detail-card">
          <div className="detail-card-title">📊 Activity Overview</div>
          <div className="activity-stats">
            <div className="activity-stat">
              <div className="activity-stat-value">{cartItems}</div>
              <div className="activity-stat-label">Cart Items</div>
            </div>
            <div className="activity-stat">
              <div className="activity-stat-value">${cartTotal.toFixed(0)}</div>
              <div className="activity-stat-label">Cart Value</div>
            </div>
            <div className="activity-stat">
              <div className="activity-stat-value">{products.length}</div>
              <div className="activity-stat-label">Products</div>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="detail-card">
          <div className="detail-card-title">🔒 Security</div>
          <div className="info-grid">
            <div className="info-field">
              <span className="info-label">Password</span>
              <div className="info-value">••••••••</div>
            </div>
            <div className="info-field">
              <span className="info-label">Session</span>
              <div className="info-value">🟢 Active</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
