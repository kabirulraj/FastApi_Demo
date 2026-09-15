import React, { useState } from "react";
import "./AuthPage.css";

const INIT_LOGIN  = { email: "", password: "" };
const INIT_SIGNUP = { name: "", email: "", password: "", confirm: "" };

function validate(tab, form) {
  const errs = {};
  if (tab === "signup" && !form.name.trim()) errs.name = "Name is required";
  if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = "Enter a valid email";
  if (form.password.length < 6) errs.password = "Minimum 6 characters";
  if (tab === "signup" && form.password !== form.confirm) errs.confirm = "Passwords do not match";
  return errs;
}

export default function AuthPage({ onAuth }) {
  const [tab, setTab]         = useState("login");
  const [form, setForm]       = useState(INIT_LOGIN);
  const [errs, setErrs]       = useState({});
  const [alert, setAlert]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const [showCf, setShowCf]   = useState(false);

  const switchTab = (t) => {
    setTab(t);
    setForm(t === "login" ? INIT_LOGIN : INIT_SIGNUP);
    setErrs({});
    setAlert(null);
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validate(tab, form);
    if (Object.keys(errors).length) { setErrs(errors); return; }
    setErrs({});
    setLoading(true);

    // Simulate async auth (replace with real API call when backend is ready)
    setTimeout(() => {
      setLoading(false);
      if (tab === "login") {
        setAlert({ type: "success", msg: `Welcome back, ${form.email}! 🎉` });
        setTimeout(() => onAuth({ email: form.email, name: form.email.split("@")[0] }), 1000);
      } else {
        setAlert({ type: "success", msg: "Account created! Logging you in… 🚀" });
        setTimeout(() => onAuth({ email: form.email, name: form.name }), 1000);
      }
    }, 800);
  };

  return (
    <div className="auth-overlay">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="logo">🛍️</div>
          <h1>ShopTrac</h1>
          <p>Your smart inventory & shopping platform</p>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab ${tab === "login"  ? "active" : ""}`} onClick={() => switchTab("login")}>Login</button>
          <button className={`auth-tab ${tab === "signup" ? "active" : ""}`} onClick={() => switchTab("signup")}>Sign Up</button>
        </div>

        {alert && <div className={`auth-alert ${alert.type}`} style={{ marginBottom: 14 }}>{alert.msg}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {tab === "signup" && (
            <div className="auth-field">
              <label>Full Name</label>
              <input placeholder="John Doe" value={form.name} onChange={set("name")} className={errs.name ? "error" : ""} />
              {errs.name && <span className="field-error">{errs.name}</span>}
            </div>
          )}

          <div className="auth-field">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} className={errs.email ? "error" : ""} />
            {errs.email && <span className="field-error">{errs.email}</span>}
          </div>

          <div className="auth-field">
            <label>Password</label>
            <div className="password-wrap">
              <input type={showPw ? "text" : "password"} placeholder="••••••••" value={form.password} onChange={set("password")} className={errs.password ? "error" : ""} />
              <button type="button" className="toggle-pw" onClick={() => setShowPw((v) => !v)}>{showPw ? "🙈" : "👁️"}</button>
            </div>
            {errs.password && <span className="field-error">{errs.password}</span>}
          </div>

          {tab === "signup" && (
            <div className="auth-field">
              <label>Confirm Password</label>
              <div className="password-wrap">
                <input type={showCf ? "text" : "password"} placeholder="••••••••" value={form.confirm} onChange={set("confirm")} className={errs.confirm ? "error" : ""} />
                <button type="button" className="toggle-pw" onClick={() => setShowCf((v) => !v)}>{showCf ? "🙈" : "👁️"}</button>
              </div>
              {errs.confirm && <span className="field-error">{errs.confirm}</span>}
            </div>
          )}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "Please wait…" : tab === "login" ? "Login →" : "Create Account →"}
          </button>
        </form>

        <div className="auth-divider" style={{ marginTop: 16 }}>
          {tab === "login"
            ? <>Don't have an account? <button onClick={() => switchTab("signup")}>Sign up</button></>
            : <>Already have an account? <button onClick={() => switchTab("login")}>Login</button></>
          }
        </div>
      </div>
    </div>
  );
}
