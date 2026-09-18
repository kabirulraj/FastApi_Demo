import React, { useState } from "react";
import axios from "axios";
import "./AuthPage.css";

const api = axios.create({
  baseURL: "http://localhost:8000"
});

const INIT_LOGIN = {
  email: "",
  password: ""
};

const INIT_SIGNUP = {
  username: "",
  email: "",
  password: "",
  confirm: ""
};

function validate(tab, form) {
  const errs = {};

  if (tab === "signup" && !form.username.trim()) {
    errs.username = "Username is required";
  }

  if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    errs.email = "Enter a valid email";
  }

  if (form.password.length < 6) {
    errs.password = "Minimum 6 characters";
  }

  if (tab === "signup" && form.password !== form.confirm) {
    errs.confirm = "Passwords do not match";
  }

  return errs;
}

export default function AuthPage({ onAuth }) {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState(INIT_LOGIN);
  const [errs, setErrs] = useState({});
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);

  const switchTab = (t) => {
    setTab(t);
    setForm(t === "login" ? INIT_LOGIN : INIT_SIGNUP);
    setErrs({});
    setAlert(null);
  };

  const set = (k) => (e) => {
    setForm((f) => ({
      ...f,
      [k]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validate(tab, form);

    if (Object.keys(errors).length) {
      setErrs(errors);
      return;
    }

    setErrs({});
    setLoading(true);
    setAlert(null);

    try {
      if (tab === "signup") {

        // 1. Register user
        await api.post("/register", {
          username: form.username,
          email: form.email,
          password: form.password
        });

        // 2. Auto-login after signup
        const { data } = await api.post("/login", {
          email: form.email,
          password: form.password
        });

        localStorage.setItem("token", data.access_token);

        setAlert({
          type: "success",
          msg: "Account created! Welcome 🚀"
        });

        setTimeout(() => onAuth(data.user), 800);

      } else {

        // Login
        const { data } = await api.post("/login", {
          email: form.email,
          password: form.password
        });

        localStorage.setItem("token", data.access_token);

        setAlert({
          type: "success",
          msg: `Welcome back, ${data.user.username}! 🎉`
        });

        setTimeout(() => onAuth(data.user), 800);
      }

    } catch (err) {

      const detail = err.response?.data?.detail;

      let msg = "Something went wrong. Please try again.";

      // FastAPI validation error
      if (Array.isArray(detail)) {
        msg = detail.map((error) => error.msg).join(", ");
      }
      // Normal FastAPI error
      else if (typeof detail === "string") {
        msg = detail;
      }

      setAlert({
        type: "error",
        msg
      });

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-card">

        <div className="auth-brand">
          <div className="logo">🛍️</div>
          <h1>ShopTrac</h1>
          <p>Your smart inventory &amp; shopping platform</p>
        </div>

        <div className="auth-tabs">

          <button
            className={`auth-tab ${tab === "login" ? "active" : ""}`}
            onClick={() => switchTab("login")}
          >
            Login
          </button>

          <button
            className={`auth-tab ${tab === "signup" ? "active" : ""}`}
            onClick={() => switchTab("signup")}
          >
            Sign Up
          </button>

        </div>

        {alert && (
          <div
            className={`auth-alert ${alert.type}`}
            style={{ marginBottom: 14 }}
          >
            {alert.msg}
          </div>
        )}

        <form
          className="auth-form"
          onSubmit={handleSubmit}
          noValidate
        >

          {tab === "signup" && (
            <div className="auth-field">

              <label>Username</label>

              <input
                placeholder="John Doe"
                value={form.username}
                onChange={set("username")}
                className={errs.username ? "error" : ""}
              />

              {errs.username && (
                <span className="field-error">
                  {errs.username}
                </span>
              )}

            </div>
          )}

          <div className="auth-field">

            <label>Email</label>

            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set("email")}
              className={errs.email ? "error" : ""}
            />

            {errs.email && (
              <span className="field-error">
                {errs.email}
              </span>
            )}

          </div>

          <div className="auth-field">

            <label>Password</label>

            <div className="password-wrap">

              <input
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={set("password")}
                className={errs.password ? "error" : ""}
              />

              <button
                type="button"
                className="toggle-pw"
                onClick={() => setShowPw((v) => !v)}
              >
                {showPw ? "🙈" : "👁️"}
              </button>

            </div>

            {errs.password && (
              <span className="field-error">
                {errs.password}
              </span>
            )}

          </div>
 
          {tab === "signup" && (
            <div className="auth-field">

              <label>Confirm Password</label>

              <div className="password-wrap">

                <input
                  type={showCf ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.confirm}
                  onChange={set("confirm")}
                  className={errs.confirm ? "error" : ""}
                />

                <button
                  type="button"
                  className="toggle-pw"
                  onClick={() => setShowCf((v) => !v)}
                >
                  {showCf ? "🙈" : "👁️"}
                </button>

              </div>

              {errs.confirm && (
                <span className="field-error">
                  {errs.confirm}
                </span>
              )}

            </div>
          )}

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Please wait…"
              : tab === "login"
                ? "Login →"
                : "Create Account →"}
          </button>

        </form>

        <div
          className="auth-divider"
          style={{ marginTop: 16 }}
        >
          {tab === "login" ? (
            <>
              Don't have an account?{" "}
              <button onClick={() => switchTab("signup")}>
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button onClick={() => switchTab("login")}>
                Login
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
